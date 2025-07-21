import { Input, Table, Tag, Switch, message, Modal, Button } from "antd";
import useList from "../../../hook/users/UseList";
import type { IUser } from "../../../types/users";
import { useState } from "react";
import { config } from "../../../api/axios"; // Giả sử bạn có axios cấu hình sẵn ở đây
import { Link } from "react-router-dom";

const UserList = () => {
  const { data, isLoading, refetch } = useList({ resource: "users" }); // có thể thêm refetch để reload dữ liệu
  const [searchText, setSearchText] = useState("");

  if (isLoading) return <div>Loading...</div>;

  // Sắp xếp theo vai trò
  const rolePriority: Record<string, number> = {
    admin: 1,
    moderator: 2,
    user: 3,
  };

  const dataSource = data?.data
    ?.map((user: IUser) => ({
      key: user.id,
      ...user,
    }))
    .sort(
      (a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99)
    );

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      await config.patch(`/users/${userId}`, { status: newStatus });
      message.success("Cập nhật trạng thái thành công");
      refetch?.(); // Làm mới danh sách
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: IUser) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {status ? (
            <Tag color="green">Hoạt động</Tag>
          ) : (
            <Tag color="red">Tạm khóa</Tag>
          )}
          <Switch
            checked={status}
            // onChange={(checked) => handleStatusChange(record.id, checked)}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
            size="small"
            onChange={(checked) =>
              Modal.confirm({
                title: "Bạn có chắc muốn thay đổi trạng thái?",
                okText: "Đồng ý",
                cancelText: "Hủy",
                onOk: () => handleStatusChange(record.id, checked), // hoặc record.user_id nếu dùng user_id
              })
            }
          />
        </div>
      ),
    },

    {
      title: "Xác minh",
      dataIndex: "is_verified",
      key: "is_verified",
      render: (v: boolean) =>
        v ? (
          <Tag color="green">Đã xác minh</Tag>
        ) : (
          <Tag color="orange">Chưa xác minh</Tag>
        ),
    },
  ];

  const filteredData = dataSource?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.address.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Button type="primary">
        <Link to="/admin/users/create">Thêm người dùng</Link>
      </Button>

      <Input.Search
        placeholder="Tìm theo tên người dùng"
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300, marginBottom: 16 }}
      />

      <h1 className="font-semibold text-xl py-5">Danh sách người dùng</h1>
      <Table dataSource={filteredData} columns={columns} />
    </div>
  );
};

export default UserList;
