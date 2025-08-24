import React from "react";
import "../../../assets/styles/admin-responsive.css";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  message,
  Tooltip,
  Image,
  Form,
  Input,
  Upload,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { config as api } from "../../../api/axios";
import { format } from "date-fns";

const { Option } = Select;
const { confirm } = Modal;

// Interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  order_code: string;
  total_price: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface RefundRequest {
  id: number;
  user_id: number;
  order_id: number;
  amount: string;
  reason: string;
  evidence_image?: string;
  bill_image?: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  transaction_code?: string;
  note_admin?: string;
  created_at: string;
  updated_at: string;
  user: User;
  order: Order;
}

const getStatusTag = (
  status: "pending" | "approved" | "rejected" | "refunded"
) => {
  switch (status) {
    case "pending":
      return <Tag color="orange">Đang chờ duyệt</Tag>;
    case "approved":
      return <Tag color="blue">Đã phê duyệt</Tag>;
    case "rejected":
      return <Tag color="red">Đã từ chối</Tag>;
    case "refunded":
      return <Tag color="green">Đã hoàn tiền</Tag>;
    default:
      return <Tag>Không xác định</Tag>;
  }
};

const RefundRequestList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [refundForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<RefundRequest>>({
    queryKey: ["refundRequests", statusFilter],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<RefundRequest>>(
        `/admin/refund-requests`,
        { params: { status: statusFilter } }
      );
      return response.data;
    },
  });

  const updateStatusMutation = useMutation<
    any,
    Error,
    {
      id: number;
      status: string;
      transaction_code?: string;
      note_admin?: string;
      bill_image?: File;
    }
  >({
    mutationFn: async ({
      id,
      status,
      transaction_code,
      note_admin,
      bill_image,
    }: {
      id: number;
      status: string;
      transaction_code?: string;
      note_admin?: string;
      bill_image?: File;
    }) => {
      // Always use JSON for now to avoid FormData issues
      const jsonData = {
        status: status,
        transaction_code: transaction_code || null,
        note_admin: note_admin || null,
      };

      console.log("JSON data being sent:", jsonData);

      const response = await api.patch<any>(
        `/admin/refund-requests/${id}/status`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({
        queryKey: ["refundRequests", statusFilter],
      });
      setRefundModalVisible(false);
      setSelectedRefund(null);
      refundForm.resetFields();
    },
    onError: (error: any) => {
      console.error("Refund error:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Có lỗi xảy ra khi cập nhật trạng thái.");
      }
    },
  });

  const showUpdateConfirm = (
    id: number,
    newStatus: "approved" | "rejected"
  ) => {
    confirm({
      title: `Bạn có chắc muốn ${newStatus === "approved" ? "phê duyệt" : "từ chối"} yêu cầu này?`,
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        updateStatusMutation.mutate({ id, status: newStatus });
      },
    });
  };

  const showRefundModal = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setRefundModalVisible(true);
  };

  const handleRefundSubmit = (values: any) => {
    console.log("Form values:", values);
    console.log("Bill image:", values.bill_image);
    console.log("Bill image file:", values.bill_image?.[0]?.originFileObj);

    // Get the actual file from the upload component
    const billImageFile = values.bill_image?.[0]?.originFileObj;
    console.log("Bill image file to send:", billImageFile);

    if (!billImageFile) {
      message.error("Vui lòng chọn ảnh bill chuyển khoản!");
      return;
    }

    if (selectedRefund) {
      updateStatusMutation.mutate({
        id: selectedRefund.id,
        status: "refunded",
        transaction_code: values.transaction_code,
        note_admin: values.note_admin,
        bill_image: billImageFile,
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: RefundRequest, b: RefundRequest) => a.id - b.id,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "order_id",
      key: "order_id",
      render: (order_id: number) => `#${order_id}`,
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "user_name",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => {
        const reasonMap: { [key: string]: string } = {
          quality_issue: "Chất lượng sản phẩm",
          not_as_described: "Không đúng mô tả",
          damaged: "Sản phẩm bị hỏng",
          wrong_size: "Sai kích thước",
          delivery_issue: "Vấn đề giao hàng",
          other: "Lý do khác",
        };
        return reasonMap[reason] || reason;
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "evidence_image",
      key: "evidence_image",
      render: (evidence_image: string) => {
        if (!evidence_image) return "Không có ảnh";
        return (
          <Image
            width={50}
            src={`http://localhost:8000/storage/${evidence_image}`}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        );
      },
    },
    {
      title: "Thông tin TK ngân hàng",
      key: "bank_info",
      render: (record: RefundRequest) => (
        <div>
          <div>
            <strong>Ngân hàng:</strong> {record.bank_name}
          </div>
          <div>
            <strong>Tên TK:</strong> {record.bank_account_name}
          </div>
          <div>
            <strong>Số TK:</strong> {record.bank_account_number}
          </div>
          <div>
            <strong>Số tiền:</strong>{" "}
            {parseInt(record.amount).toLocaleString("vi-VN")}₫
          </div>
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => format(new Date(text), "dd/MM/yyyy HH:mm"),
      sorter: (a: RefundRequest, b: RefundRequest) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: RefundRequest) => (
        <Space size="middle">
          {record.status === "pending" && (
            <>
              <Tooltip title="Phê duyệt">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => showUpdateConfirm(record.id, "approved")}
                ></Button>
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => showUpdateConfirm(record.id, "rejected")}
                ></Button>
              </Tooltip>
            </>
          )}
          {record.status === "approved" && (
            <Tooltip title="Hoàn tiền">
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => showRefundModal(record)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Hoàn tiền
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý Yêu cầu Hoàn tiền</h2>
      <Space style={{ marginBottom: 16 }}>
        <span>Lọc theo trạng thái:</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="pending">Đang chờ duyệt</Option>
          <Option value="approved">Đã phê duyệt</Option>
          <Option value="rejected">Đã từ chối</Option>
          <Option value="refunded">Đã hoàn tiền</Option>
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: data?.total,
          pageSize: data?.per_page,
          current: data?.current_page,
          onChange: (_page) => {},
        }}
      />

      {/* Modal Hoàn tiền */}
      <Modal
        title="Xác nhận hoàn tiền"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          setSelectedRefund(null);
          refundForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRefund && (
          <div>
            <div
              style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: "#f5f5f5",
                borderRadius: 6,
              }}
            >
              <h4>Thông tin yêu cầu hoàn tiền</h4>
              <p>
                <strong>Khách hàng:</strong> {selectedRefund.user.name}
              </p>
              <p>
                <strong>Đơn hàng:</strong> #{selectedRefund.order_id}
              </p>
              <p>
                <strong>Số tiền:</strong>{" "}
                {parseInt(selectedRefund.amount).toLocaleString("vi-VN")}₫
              </p>
              <p>
                <strong>Ngân hàng:</strong> {selectedRefund.bank_name}
              </p>
              <p>
                <strong>Tên TK:</strong> {selectedRefund.bank_account_name}
              </p>
              <p>
                <strong>Số TK:</strong> {selectedRefund.bank_account_number}
              </p>
            </div>

            <Form
              form={refundForm}
              layout="vertical"
              onFinish={handleRefundSubmit}
            >
              <Form.Item
                label="Mã giao dịch"
                name="transaction_code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giao dịch!" },
                ]}
              >
                <Input placeholder="Nhập mã giao dịch chuyển khoản" />
              </Form.Item>

              <Form.Item
                label="Ảnh bill chuyển khoản"
                name="bill_image"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng upload ảnh bill chuyển khoản!",
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  accept="image/*"
                  fileList={refundForm.getFieldValue("bill_image") || []}
                  onChange={(info) => {
                    console.log("Upload onChange:", info);
                    refundForm.setFieldsValue({ bill_image: info.fileList });
                  }}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload ảnh</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Ghi chú cho khách hàng"
                name="note_admin"
                rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập thông tin chi tiết về việc hoàn tiền (ví dụ: thời gian chuyển khoản, ngân hàng gửi, lý do hoàn tiền...)"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateStatusMutation.isPending}
                    icon={<DollarOutlined />}
                  >
                    Xác nhận hoàn tiền
                  </Button>
                  <Button
                    onClick={() => {
                      setRefundModalVisible(false);
                      setSelectedRefund(null);
                      refundForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RefundRequestList;
