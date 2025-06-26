import { useState } from "react";
import type{ CartItem, OrderPayload } from "../types/DetailType";

type Props = {
  selectedItems: CartItem[];
  totalAmount: number;
  onSubmit: (order: OrderPayload) => void;
};

export default function CheckoutForm({ selectedItems, totalAmount, onSubmit }: Props) {
  const [info, setInfo] = useState({ name: "", phone: "", address: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...info, items: selectedItems, totalAmount });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input name="name" placeholder="Họ tên" className="form-control mb-2" required onChange={handleChange} />
      <input name="phone" placeholder="Số điện thoại" className="form-control mb-2" required onChange={handleChange} />
      <input name="address" placeholder="Địa chỉ" className="form-control mb-2" required onChange={handleChange} />
      <button className="btn btn-success mt-2" type="submit">Xác nhận đặt hàng</button>
    </form>
  );
}
