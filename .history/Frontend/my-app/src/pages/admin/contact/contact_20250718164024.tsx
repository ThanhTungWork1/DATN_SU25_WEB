import { Table, Input, Button, Modal, Form, message } from "antd";
import { useState, useEffect } from "react";
import { getContacts } from "../../../api/ApiContact";

export const Contact = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Lấy token admin từ localStorage hoặc context
  const token = localStorage.getItem("token_admin") || localStorage.getItem("token") || "";

  useEffect(() => {
    setLoading(true);
    getContacts(page, token)
      .then(res => {
        // res.data.data.data: mảng contacts, res.data.data.total: tổng số bản ghi
        setData(res.data.data.data || []);
        setTotal(res.data.data.total || 0);
      })
      .catch(() => message.error("Không lấy được danh sách liên hệ!"))
      .finally(() => setLoading(false));
  }, [page, token]);

  const handleReply = (record: any) => {
    setSelectedContact(record);
    setModalOpen(true);
  };

  const handleSendReply = (values: any) => {
    message.success("Phản hồi đã được gửi!");
    setModalOpen(false);
    // TODO: Gửi API phản hồi tới khách hàng
  };

  const filteredData = data.filter((item: any) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Tin nhắn",
      dataIndex: "message",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (text: string) => (
        <span style={{ color: text === "Chưa phản hồi" ? "red" : "green" }}>
          {text || "Chưa phản hồi"}
        </span>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => handleReply(record)}>
          Phản hồi
        </Button>
      ),
    },
  ];

  return (
    <>
      <h2>Quản lý liên hệ khách hàng</h2>
      <Input.Search
        placeholder="Tìm theo tên khách hàng"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table
        rowKey="id"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title={`Phản hồi: ${selectedContact?.name}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form onFinish={handleSendReply} layout="vertical">
          <Form.Item
            name="reply"
            label="Nội dung phản hồi"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập phản hồi tại đây..." />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Gửi phản hồi
          </Button>
        </Form>
      </Modal>
    </>
  );
};
