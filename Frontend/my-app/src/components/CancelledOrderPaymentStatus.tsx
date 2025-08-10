import React from 'react';
import '../assets/styles/cancelledOrderPayment.css';

interface CancelledOrderPaymentStatusProps {
    isPaid: boolean | number | string;
    paymentMethod: string;
}

const CancelledOrderPaymentStatus: React.FC<CancelledOrderPaymentStatusProps> = ({ 
    isPaid, 
    paymentMethod 
}) => {
    // Xử lý is_paid có thể là string hoặc boolean
    const isPaidBool = isPaid === true || isPaid === 1 || isPaid === 'paid';
    
    if (isPaidBool) {
        return (
            <div className="cancelled-order-payment paid">
                <div className="main-text">❌ Đã thanh toán</div>
                <div className="sub-text">Cần hoàn tiền</div>
            </div>
        );
    } else if (paymentMethod === 'COD') {
        return (
            <div className="cancelled-order-payment cod">
                <div className="main-text">🔄 COD</div>
                <div className="sub-text">Đã hủy trước khi giao</div>
            </div>
        );
    } else {
        return (
            <div className="cancelled-order-payment unpaid">
                <div className="main-text">✅ Chưa thanh toán</div>
            </div>
        );
    }
};

export default CancelledOrderPaymentStatus; 