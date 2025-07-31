// src/pages/VoucherPage.tsx
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { Voucher } from "../../../types/Voucher";

// Định nghĩa interface cho API response
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

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
    try {
      const res = await axiosInstance.get<ApiResponse<Voucher[]>>("/vouchers");
      console.log("Voucher response:", res.data);
      setVouchers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVouchers([]);
    }
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
    try {
      if (isEditing && editId !== null) {
        await axiosInstance.put(`/vouchers/${editId}`, form);
      } else {
        await axiosInstance.post("/vouchers", form);
      }
      fetchVouchers();
      resetForm();
         } catch (error: any) {
       console.error("Error saving voucher:", error);
       if (error.response?.data?.errors) {
         console.error("Validation errors:", error.response.data.errors);
         alert("Lỗi validation: " + JSON.stringify(error.response.data.errors));
       }
     }
  };

  const resetForm = () => {
    setForm({ code: "", discount_amount: 0, expires_at: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (voucher: Voucher) => {
         setForm({
       code: voucher.code,
       discount_amount: voucher.value,
       expires_at: voucher.end_date,
     });
    setIsEditing(true);
    setEditId(voucher.id);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await axiosInstance.patch(`/vouchers/${id}/toggle`);
      fetchVouchers();
    } catch (error) {
      console.error("Error toggling voucher:", error);
    }
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
           min={new Date().toISOString().split('T')[0]}
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
          {Array.isArray(vouchers) && vouchers.map((v) => (
            <tr key={v.id}>
              <td>{v.code}</td>
                             <td>{v.value.toLocaleString()}₫</td>
                             <td>{v.end_date}</td>
                             <td>{v.status ? "Hoạt động" : "Đã khóa"}</td>
              <td>
                <button onClick={() => handleEdit(v)}>Sửa</button>
                                 <button onClick={() => handleToggleActive(v.id)}>
                   {v.status ? "Khóa" : "Mở lại"}
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
