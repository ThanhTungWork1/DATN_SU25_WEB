import React, { useState } from 'react';
import { UseOrder } from '../../../types/UseOrder';
import OrderDetailModal from './OrderDetailModal';

type Props = {
  order: UseOrder;
  onCancel: (id: number) => void;
  onReorder: (order: UseOrder) => void;
};


const OrderItem: React.FC<Props> = ({ order, onCancel, onReorder }) => {
  const [showDetail, setShowDetail] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã nhận';
      case 'cancelled': return 'Đã huỷ';
      default: return status;
    }
  };

  const canCancel = order.status.toLowerCase() === 'pending';
  const canReorder = order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled';

  return (
    <>
      <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Đơn hàng #{order.id}</h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('vi-VN')} - {new Date(order.created_at).toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Sản phẩm preview */}
        <div className="mb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <img 
                  src={item.product_image || "https://via.placeholder.com/50"} 
                  alt={item.product_name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex items-center text-sm text-gray-500">
                +{order.items.length - 3} sản phẩm khác
              </div>
            )}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            Tổng: {order.total_price?.toLocaleString()}₫
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setShowDetail(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Xem chi tiết
          </button>
          
          {canReorder && (
            <button 
              onClick={() => onReorder(order)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Mua lại
            </button>
          )}
          
          {canCancel && (
            <button 
              onClick={() => onCancel(order.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Hủy đơn
            </button>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showDetail && (
        <OrderDetailModal 
          orderId={order.id} 
          onClose={() => setShowDetail(false)} 
        />
      )}
    </>
  );
};

export default OrderItem;
