import React from 'react';
import { UseOrder } from '../../../types/UseOrder';

interface Props {
  order: UseOrder;
  onCancel: (id: number) => void;
}

const OrderItem: React.FC<Props> = ({ order, onCancel }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'text-warning',
      'processing': 'text-info',
      'shipped': 'text-primary',
      'delivered': 'text-success',
      'cancelled': 'text-danger',
      'completed': 'text-success'
    };
    return statusColors[status] || 'text-secondary';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy',
      'completed': 'Hoàn thành'
    };
    return statusTexts[status] || status;
  };

  const canCancelOrder = () => {
    return order.status === 'pending' || order.status === 'processing';
  };

  const totalPrice = order.total_amount + (order.shipping_fee || 0) - (order.discount_amount || 0);

  return (
    <div className="border p-4 mb-4 rounded">
      <div className="row">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="mb-1">Đơn hàng #{order.id}</h6>
              <small className="text-muted">
                Đặt lúc: {formatDate(order.created_at)}
              </small>
            </div>
            <span className={`badge ${getStatusColor(order.status)} fs-6`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">Sản phẩm:</h6>
              {order.items.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                  <div className="flex-grow-1">
                    <div className="fw-medium">{item.product_name || 'Sản phẩm'}</div>
                    <small className="text-muted">
                      {item.variant_color_name && `Màu: ${item.variant_color_name}`}
                      {item.variant_size_name && ` | Size: ${item.variant_size_name}`}
                      {` | SL: ${item.quantity}`}
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="fw-medium">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Info */}
          <div className="mb-3">
            <h6 className="mb-2">Thông tin giao hàng:</h6>
            <div className="text-muted small">
              <div><strong>Người nhận:</strong> {order.shipping_name}</div>
              <div><strong>Số điện thoại:</strong> {order.shipping_phone}</div>
              <div><strong>Địa chỉ:</strong> {order.shipping_address}</div>
              {order.note && <div><strong>Ghi chú:</strong> {order.note}</div>}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Order Summary */}
          <div className="border rounded p-3 mb-3">
            <h6 className="mb-3">Tổng kết đơn hàng</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Tạm tính:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            {order.shipping_fee > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Tổng cộng:</strong>
              <strong className="text-danger">{formatCurrency(totalPrice)}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2">
            {canCancelOrder() && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                    onCancel(order.id);
                  }
                }}
              >
                Hủy đơn hàng
              </button>
            )}
            <button className="btn btn-outline-primary btn-sm">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
