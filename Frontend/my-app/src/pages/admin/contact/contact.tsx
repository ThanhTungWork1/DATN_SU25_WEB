import { Table, Input, Button, Modal, Form, message } from "antd";
import { useState } from "react";

const sampleData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "a@gmail.com",
    phone: "0901234567",
    message: "Shop còn size M không?",
    status: "Chưa phản hồi",
  },
];

export const Contact = () => {
  const [data, setData] = useState(sampleData);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const handleReply = (record: any) => {
    setSelectedContact(record);
    setModalOpen(true);
  };

  const handleSendReply = (values: any) => {
    message.success("Phản hồi đã được gửi!");
    setModalOpen(false);
    // TODO: Gửi API phản hồi tới khách hàng
  };

  const filteredData = data.filter((item) =>
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
          {text}
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
      <Table rowKey="id" dataSource={filteredData} columns={columns} />

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
