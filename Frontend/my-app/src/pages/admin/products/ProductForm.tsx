import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProduct, updateProduct } from "../../../api/product";

export default function ProductForm() {
  const [form, setForm] = useState({ name: "", price: "" });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProduct(Number(id)).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await updateProduct(Number(id), form);
    else await createProduct(form);
    navigate("/admin/products");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2>
      <label>Tên sản phẩm:</label>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <label>Giá:</label>
      <input
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <button type="submit">{id ? "Cập nhật" : "Tạo mới"}</button>
    </form>
  );
}
