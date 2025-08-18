import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { message } from "antd";
import "../../../assets/styles/VoucherDetail.css";

interface VoucherUsage {
  user_name: string;
  user_email: string;
  order_code: string;
  discount_amount: number;
  used_at: string;
}

interface VoucherDetailData {
  voucher: {
    id: number;
    code: string;
    title: string;
    value: number;
    discount_type: "fixed" | "percent";
    min_order_amount: number;
    max_usage: number;
    used_count: number;
    start_date: string;
    end_date: string;
    status: boolean;
    description: string;
  };
  usage_history: VoucherUsage[];
}

interface VoucherDetailProps {
  voucherId: number | null;
  isVisible: boolean;
  onClose: () => void;
}

const VoucherDetail: React.FC<VoucherDetailProps> = ({
  voucherId,
  isVisible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VoucherDetailData | null>(null);

  useEffect(() => {
    if (isVisible && voucherId) {
      fetchVoucherDetail(voucherId);
    }
  }, [isVisible, voucherId]);

  const fetchVoucherDetail = async (id: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/vouchers/${id}/usage`);
      const responseData = response.data as any;
      if (responseData.status === "success") {
        setData(responseData.data);
        console.log(responseData.data);
      }
    } catch (error: any) {
      message.error("Không thể tải thông tin voucher");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (voucher: any) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    if (!voucher.status) return { label: "Đã khóa", color: "red" };
    if (now < startDate) return { label: "Chưa bắt đầu", color: "blue" };
    if (now > endDate) return { label: "Hết hạn", color: "orange" };
    if (voucher.used_count >= voucher.max_usage)
      return { label: "Đã sử dụng hết", color: "gray" };
    return { label: "Hoạt động", color: "green" };
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!isVisible) return null;

  return (
    <div className="voucher-detail-overlay" onClick={onClose}>
      <div
        className="voucher-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : data ? (
          <>
            <div className="modal-header">
              <h2>📊 Chi tiết Voucher: {data.voucher.code}</h2>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="voucher-modal-content">
              {/* Thông tin cơ bản */}
              <div className="info-section">
                <h3>📋 Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mã voucher:</label>
                    <span className="code">{data.voucher.code}</span>
                  </div>
                  <div className="info-item">
                    <label>Tiêu đề:</label>
                    <span>{data.voucher.title}</span>
                  </div>
                  <div className="info-item">
                    <label>Giá trị giảm:</label>
                    <span className="value">
                      {data.voucher.value.toLocaleString()}
                      {data.voucher.discount_type === "fixed" ? "₫" : "%"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Điều kiện:</label>
                    <span>
                      {data.voucher.min_order_amount > 0
                        ? `Đơn từ ${formatCurrency(data.voucher.min_order_amount)}`
                        : "Không điều kiện"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Ngày bắt đầu:</label>
                    <span>{formatDate(data.voucher.start_date)}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày hết hạn:</label>
                    <span>{formatDate(data.voucher.end_date)}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span
                      className={`status-badge status-${getStatusDisplay(data.voucher).color}`}
                    >
                      {getStatusDisplay(data.voucher).label}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Mô tả:</label>
                    <span>{data.voucher.description || "Không có mô tả"}</span>
                  </div>
                </div>
              </div>

              {/* Thống kê sử dụng */}
              <div className="stats-section">
                <h3>📈 Thống kê sử dụng</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{data.voucher.max_usage}</div>
                    <div className="stat-label">Tổng số lượt</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{data.voucher.used_count}</div>
                    <div className="stat-label">Đã sử dụng</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {data.voucher.max_usage - data.voucher.used_count}
                    </div>
                    <div className="stat-label">Còn lại</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {Math.round(
                        (data.voucher.used_count / data.voucher.max_usage) * 100
                      )}
                      %
                    </div>
                    <div className="stat-label">Tỷ lệ sử dụng</div>
                  </div>
                </div>
              </div>

              {/* Danh sách người dùng */}
              <div className="usage-section">
                <h3>👥 Danh sách người dùng đã sử dụng</h3>
                {data?.usage_history?.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>Chưa có ai sử dụng voucher này</p>
                  </div>
                ) : (
                  <div className="usage-list">
                    {data?.usage_history?.map((usage, index) => (
                      <div key={index} className="usage-item">
                        <div className="usage-header">
                          <span className="user-name">{usage.user_name}</span>
                          <span className="usage-date">{usage.used_at}</span>
                        </div>
                        <div className="usage-details">
                          <div className="detail-item">
                            <label>Email:</label>
                            <span>{usage.user_email}</span>
                          </div>
                          <div className="detail-item">
                            <label>Đơn hàng:</label>
                            <span>{usage.order_code}</span>
                          </div>
                          <div className="detail-item">
                            <label>Giảm giá:</label>
                            <span className="discount-amount">
                              {formatCurrency(usage.discount_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-button" onClick={onClose}>
                Đóng
              </button>
            </div>
          </>
        ) : (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <p>Không thể tải thông tin voucher</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherDetail;
