import React from 'react';
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
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
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
  reason: string;
  images: string; // JSON string of image URLs
  bank_account_info: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user: User;
  order: Order;
}

const getStatusTag = (status: "pending" | "approved" | "rejected") => {
  switch (status) {
    case "pending":
      return <Tag color="orange">Đang chờ duyệt</Tag>;
    case "approved":
      return <Tag color="green">Đã phê duyệt</Tag>;
    case "rejected":
      return <Tag color="red">Đã từ chối</Tag>;
    default:
      return <Tag>Không xác định</Tag>;
  }
};

const RefundRequestList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
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
    { id: number; status: string }
  >({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.patch<any>(
        `/admin/refund-requests/${id}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({
        queryKey: ["refundRequests", statusFilter],
      });
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái.");
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: RefundRequest, b: RefundRequest) => a.id - b.id,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: ["order", "order_code"],
      key: "order_code",
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "user_name",
    },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: (images: string) => {
        try {
          const imageUrls = JSON.parse(images);
          if (!Array.isArray(imageUrls) || imageUrls.length === 0)
            return "Không có ảnh";
          return (
            <Image.PreviewGroup>
              <Space size="small">
                {imageUrls.map((url, index) => (
                  <Image key={index} width={50} src={url} />
                ))}
              </Space>
            </Image.PreviewGroup>
          );
        } catch (e) {
          return "Lỗi ảnh";
        }
      },
    },
    {
      title: "Thông tin TK ngân hàng",
      dataIndex: "bank_account_info",
      key: "bank_account_info",
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
    </div>
  );
};

export default RefundRequestList;
