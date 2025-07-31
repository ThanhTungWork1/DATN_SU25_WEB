// src/pages/VoucherPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Voucher } from "../../../types/Voucher"; // sửa lại tên import

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_amount: 0,
    expires_at: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchVouchers = async () => {
    const res = await axios.get<Voucher[]>("/api/vouchers");
    console.log("Voucher response:", res.data);
    setVouchers(res.data);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "discount_amount" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editId !== null) {
      await axios.put(`/api/vouchers/${editId}`, form);
    } else {
      await axios.post("/api/vouchers", form);
    }
    fetchVouchers();
    resetForm();
  };

  const resetForm = () => {
    setForm({ code: "", discount_amount: 0, expires_at: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (voucher: Voucher) => {
    setForm({
      code: voucher.code,
      discount_amount: voucher.discount_amount,
      expires_at: voucher.expires_at,
    });
    setIsEditing(true);
    setEditId(voucher.id);
  };

  const handleToggleActive = async (id: number) => {
    await axios.patch(`/api/vouchers/${id}/toggle`);
    fetchVouchers();
  };

  return (
    <div>
      <h2>Quản lý Voucher</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="code"
          value={form.code}
          onChange={handleInputChange}
          placeholder="Mã voucher"
          required
        />
        <input
          type="number"
          name="discount_amount"
          value={form.discount_amount}
          onChange={handleInputChange}
          placeholder="Số tiền giảm (VND)"
          required
        />
        <input
          type="date"
          name="expires_at"
          value={form.expires_at}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{isEditing ? "Cập nhật" : "Thêm mới"}</button>
        {isEditing && (
          <button type="button" onClick={resetForm}>
            Hủy
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giảm</th>
            <th>Hết hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id}>
              <td>{v.code}</td>
              <td>{v.discount_amount.toLocaleString()}₫</td>
              <td>{v.expires_at}</td>
              <td>{v.is_active ? "Hoạt động" : "Đã khóa"}</td>
              <td>
                <button onClick={() => handleEdit(v)}>Sửa</button>
                <button onClick={() => handleToggleActive(v.id)}>
                  {v.is_active ? "Khóa" : "Mở lại"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherPage;
