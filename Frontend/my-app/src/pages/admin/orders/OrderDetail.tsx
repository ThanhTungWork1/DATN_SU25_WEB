import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../../../api/order";
import { Typography, Descriptions, message } from "antd";

const { Title } = Typography;

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getOrder(id)
        .then((res) => setOrder(res.data))
        .catch(() => message.error("Không tìm thấy đơn hàng"));
    }
  }, [id]);

  if (!order) return null;

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.id}</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Khách hàng">{order.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{order.total.toLocaleString()} VND</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{order.status}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{order.note || "Không có"}</Descriptions.Item>
      </Descriptions>
    </div>
  );
}
