// src/pages/admin/comments/CommentList.tsx

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Typography,
  Popconfirm,
  Switch,
  Rate,
} from "antd";
import type { TableProps } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Comment } from "../../../types/ProductType";
import {
  getComments,
  updateCommentStatus,
  deleteComment,
} from "../../../api/comment";

const { Title, Text } = Typography;

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getComments(page);
      setComments(res.data.data);
      setPagination({
        current: res.data.current_page,
        pageSize: res.data.per_page,
        total: res.data.total,
      });
    } catch (error) {
      message.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current);
  }, [pagination.current]);

  const handleStatusChange = async (commentId: number, newStatus: boolean) => {
    try {
      await updateCommentStatus(commentId, newStatus);
      message.success(`Đã ${newStatus ? "duyệt" : "ẩn"} đánh giá.`);
      // Cập nhật lại trạng thái trong danh sách mà không cần gọi lại API
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      message.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      message.success("Đã xóa đánh giá.");
      fetchData(pagination.current);
    } catch (error) {
      message.error("Không thể xóa đánh giá.");
    }
  };

  const columns: TableProps<Comment>["columns"] = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Người dùng",
      dataIndex: ["user", "name"],
      key: "user",
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      key: "product",
      ellipsis: true,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record) => (
        <Switch
          checked={status}
          checkedChildren="Hiển thị"
          unCheckedChildren="Đang ẩn"
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa đánh giá này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Quản lý Đánh giá</Title>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(p) =>
          setPagination((prev) => ({ ...prev, current: p.current ?? 1 }))
        }
      />
    </div>
  );
}
