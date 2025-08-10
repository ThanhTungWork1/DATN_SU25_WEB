import { useEffect, useState } from "react";
import "../../../assets/styles/Voucher.css";
import axiosInstance from "../../../utils/axiosInstance";
import { Voucher } from "../../../types/Voucher";
import { message } from "antd";
import VoucherDetail from "./VoucherDetail";

interface ApiResponsePaginated<T> {
  status: string;
  message: string;
  data: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: T[];
  };
}

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    value: 0,
    start_date: "",
    expiry_date: "",
    min_order_amount: 0,
    max_usage: 1,
    discount_type: "fixed" as "fixed" | "percent",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null
  );

  const [hasBackendError, setHasBackendError] = useState(false);

  const fetchVouchers = async (page = 1) => {
    setLoading(true);
    setHasBackendError(false);
    try {
      const res = await axiosInstance.get<ApiResponsePaginated<Voucher>>(
        `/admin/vouchers?page=${page}`
      );
      
      // Backend returns: { status, message, data: { current_page, data: [...], last_page, ... } }
      if (res.data.status === 'success' && res.data.data) {
        const paginationData = res.data.data;
        setVouchers(paginationData.data || []);
        setCurrentPage(paginationData.current_page);
        setLastPage(paginationData.last_page);
      } else {
        throw new Error(res.data.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error("Error fetching vouchers:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 500) {
        setHasBackendError(true);
        message.error("Lỗi server nội bộ khi tải danh sách voucher. Vui lòng liên hệ admin.");
      } else if (error.response?.status === 404) {
        setHasBackendError(true);
        message.error("Không tìm thấy API endpoint cho voucher.");
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn.");
      } else {
        setHasBackendError(true);
        message.error(`Không thể tải danh sách voucher: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`);
      }
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(currentPage);
  }, [currentPage]);

  const formatCurrency = (value: number | string) => {
    const numericValue =
      typeof value === "string"
        ? parseInt(value.replace(/\D/g, "")) || 0
        : value;
    return numericValue.toLocaleString("vi-VN");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(raw || "0");
    setForm({ ...form, value: numericValue });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        code: form.code,
        value: Number(form.value),
        start_date: form.start_date,
        expiry_date: form.expiry_date, // Backend expects expiry_date, stores as end_date
        min_order_amount: Number(form.min_order_amount),
        max_usage: Number(form.max_usage),
        discount_type: form.discount_type,
        description: form.description,
      };

      if (isEditing && editId !== null) {
        await axiosInstance.put(`/admin/vouchers/${editId}`, payload);
        message.success("Cập nhật voucher thành công!");
      } else {
        await axiosInstance.post("/admin/vouchers", payload);
        message.success("Tạo voucher thành công!");
      }
      resetForm();
      fetchVouchers(currentPage);
    } catch (error: any) {
      console.error("Error saving voucher:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        Object.values(errors).forEach((errorArray: any) => {
          errorArray.forEach((err: string) => message.error(err));
        });
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        message.error("Lỗi server nội bộ khi lưu voucher. Vui lòng liên hệ admin.");
      } else if (error.response?.status === 422) {
        message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn.");
      } else {
        message.error(`Có lỗi xảy ra khi lưu voucher: ${error.message || "Không xác định"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      value: 0,
      start_date: "",
      expiry_date: "",
      min_order_amount: 0,
      max_usage: 1,
      discount_type: "fixed",
      description: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (voucher: Voucher) => {
    setForm({
      code: voucher.code,
      value: voucher.value,
      start_date: voucher.start_date?.split("T")[0] || "",
      expiry_date: (voucher.end_date || voucher.expiry_date)?.split("T")[0] || "", // Handle both field names
      min_order_amount: voucher.min_order_amount || 0,
      max_usage: voucher.max_usage || 1,
      discount_type: voucher.discount_type || "fixed",
      description: voucher.description || "",
    });
    setIsEditing(true);
    setEditId(voucher.id);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await axiosInstance.patch(`/admin/vouchers/${id}/toggle`);
      message.success("Thay đổi trạng thái voucher thành công!");
      fetchVouchers(currentPage);
    } catch (error: any) {
      console.error("Error toggling voucher:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      if (error.response?.status === 500) {
        message.error("Lỗi server nội bộ khi thay đổi trạng thái voucher.");
      } else if (error.response?.status === 404) {
        message.error("Không tìm thấy voucher.");
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Không thể thay đổi trạng thái voucher");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      try {
        await axiosInstance.delete(`/admin/vouchers/${id}`);
        message.success("Xóa voucher thành công");
        fetchVouchers(currentPage);
      } catch (error: any) {
        console.error("Error deleting voucher:", error);
        console.error("Error response:", error.response);
        console.error("Error data:", error.response?.data);
        
        if (error.response?.status === 500) {
          message.error("Lỗi server nội bộ khi xóa voucher.");
        } else if (error.response?.status === 404) {
          message.error("Không tìm thấy voucher cần xóa.");
        } else if (error.response?.status === 403) {
          message.error("Không có quyền xóa voucher này.");
        } else if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Có lỗi xảy ra khi xóa voucher");
        }
      }
    }
  };

  const handleViewUsage = (id: number) => {
    setSelectedVoucherId(id);
    setDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedVoucherId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
    }
  };

  const getStatusDisplay = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date || voucher.expiry_date); // Handle both field names

    if (!voucher.status) return { label: "Đã khóa", color: "red" };
    if (now < startDate) return { label: "Chưa bắt đầu", color: "blue" };
    if (now > endDate) return { label: "Hết hạn", color: "orange" };
    if (voucher.used_count >= voucher.max_usage)
      return { label: "Đã sử dụng hết", color: "gray" };
    return { label: "Hoạt động", color: "green" };
  };

  // Render error state if backend is not available
  if (hasBackendError) {
    return (
      <div className="voucher-container">
        <h2>Quản lý Voucher</h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
          <h3 style={{ color: '#6c757d', marginBottom: '12px' }}>
            Tính năng Voucher đang được phát triển
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            API endpoint cho quản lý voucher chưa sẵn sàng.<br/>
            Vui lòng liên hệ team backend để thiết lập endpoint /admin/vouchers
          </p>
          <button 
            onClick={() => fetchVouchers(currentPage)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Đang thử lại...' : 'Thử lại'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voucher-container">
      <h2>Quản lý Voucher</h2>

      <form onSubmit={handleSubmit} className="voucher-form">
        <div className="form-row">
          <div className="form-group">
            <label>Mã voucher *</label>
            <input
              name="code"
              value={form.code}
              onChange={handleInputChange}
              placeholder="VD: GIAMGIA2025"
              required
            />
          </div>
          <div className="form-group">
            <label>Số tiền giảm *</label>
            <div className="currency-input">
              <input
                type="text"
                name="value"
                value={formatCurrency(form.value)}
                onChange={handleCurrencyChange}
                placeholder="VD: 50000"
                required
              />
              <span className="currency-label">₫</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày bắt đầu *</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>Ngày hết hạn *</label>
            <input
              type="date"
              name="expiry_date"
              value={form.expiry_date}
              onChange={handleInputChange}
              min={form.start_date || new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Điều kiện sử dụng</label>
            <div className="currency-input">
              <input
                type="text"
                name="min_order_amount"
                value={formatCurrency(form.min_order_amount)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const numericValue = parseInt(raw || "0");
                  setForm({ ...form, min_order_amount: numericValue });
                }}
                placeholder="VD: 100000 (để trống = không điều kiện)"
              />
              <span className="currency-label">₫</span>
            </div>
          </div>
          <div className="form-group">
            <label>Số lần sử dụng tối đa *</label>
            <input
              type="number"
              name="max_usage"
              value={form.max_usage}
              onChange={handleInputChange}
              min="1"
              placeholder="VD: 100"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Loại giảm giá *</label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleInputChange}
              required
            >
              <option value="fixed">Giảm theo tiền (₫)</option>
              <option value="percent">Giảm theo phần trăm (%)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mô tả voucher</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về voucher (tùy chọn)"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} disabled={loading}>
              Hủy
            </button>
          )}
        </div>
      </form>

      <table className="voucher-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giảm</th>
            <th>Điều kiện</th>
            <th>Ngày bắt đầu</th>
            <th>Hết hạn</th>
            <th>Sử dụng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => {
            const status = getStatusDisplay(v);
            return (
              <tr key={v.id}>
                <td>{v.code}</td>
                <td>
                  {v.value.toLocaleString()}
                  {v.discount_type === "fixed" ? "₫" : "%"}
                </td>
                <td>
                  {v.min_order_amount > 0
                    ? `Đơn từ ${v.min_order_amount.toLocaleString()}₫`
                    : "Không điều kiện"}
                </td>
                <td>{v.start_date?.split("T")[0] || "N/A"}</td>
                <td>{v.end_date?.split("T")[0] || "N/A"}</td>
                <td>
                  <span className="usage-info">
                    {v.used_count}/{v.max_usage} người
                  </span>
                  <br />
                  <small className="usage-note">(Mỗi người 1 lần)</small>
                </td>
                <td>
                  <span className={`status-badge status-${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(v)}
                      disabled={v.used_count > 0}
                      title={
                        v.used_count > 0
                          ? "Không thể sửa voucher đã được sử dụng"
                          : ""
                      }
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleToggleActive(v.id)}>
                      {v.status ? "Khóa" : "Mở lại"}
                    </button>
                    <button
                      onClick={() => handleViewUsage(v.id)}
                      title="Xem chi tiết sử dụng"
                      className="view-btn"
                    >
                      👥
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={new Date(v.end_date) > new Date()}
                      title={
                        new Date(v.end_date) > new Date()
                          ? "Chỉ có thể xóa voucher đã hết hạn"
                          : "Xóa voucher"
                      }
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={currentPage === 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ← Trang trước
        </button>
        <span>
          Trang {currentPage} / {lastPage}
        </span>
        <button
          disabled={currentPage === lastPage || loading}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Trang sau →
        </button>
      </div>

      {/* Voucher Detail Modal */}
      <VoucherDetail
        voucherId={selectedVoucherId}
        isVisible={detailModalVisible}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default VoucherPage;
