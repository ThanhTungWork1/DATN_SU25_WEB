import React, { useState } from 'react';
import { useReviewSystem } from '../../../hook/useReviewSystem';
import { toast } from 'react-toastify';

interface ReviewModalProps {
  productId: number;
  productName: string;
  productImage?: string;
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (productId: number) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  productId,
  productName,
  productImage,
  orderId,
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  
  const {
    eligibility,
    eligibilityLoading,
    handleSubmitReview,
    isSubmitting,
    setIsFormVisible
  } = useReviewSystem(productId, orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    handleSubmitReview({
      content: content.trim(),
      rating,
      orderId
    });
    
    // Reset form và đóng modal
    setContent('');
    setRating(5);
    setHoveredRating(0);
    setIsFormVisible(false);
    
    // Gọi callback để cập nhật trạng thái đánh giá
    if (onReviewSubmitted) {
      onReviewSubmitted(productId);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  if (eligibilityLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Đang kiểm tra quyền đánh giá...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eligibility.can_review) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Không thể đánh giá</h3>
            <p className="text-gray-600 mb-4">{eligibility.message}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-50 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Đánh giá sản phẩm</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <img
              src={productImage || "https://via.placeholder.com/80"}
              alt={productName}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-lg mb-1">{productName}</h4>
              <p className="text-sm text-gray-600">ID: #{productId}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
            <div className="mb-2">
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               Đánh giá của bạn
             </label>
            <div className="flex gap-1 justify-center mb-2">
               {[1, 2, 3, 4, 5].map((star) => {
                 const isFilled = star <= (hoveredRating || rating);
                 return (
                   <button
                     key={star}
                     type="button"
                     onMouseEnter={() => setHoveredRating(star)}
                     onMouseLeave={() => setHoveredRating(0)}
                     onClick={() => setRating(star)}
                                           className={`text-3xl transform transition-all duration-200 hover:scale-110 cursor-pointer ${
                        isFilled 
                          ? 'text-yellow-400 drop-shadow-sm' 
                          : 'text-gray-300'
                      }`}
                      style={{ 
                        color: isFilled ? '#fbbf24' : '#d1d5db',
                        fontSize: '2rem',
                        border: 'none',
                        background: 'none'
                      }}
                   >
                     ★
                   </button>
                 );
               })}
             </div>
             <div className="text-center">
               <p className="text-sm font-medium text-gray-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                 {(hoveredRating || rating) === 1 && '😞 Rất không hài lòng'}
                 {(hoveredRating || rating) === 2 && '😕 Không hài lòng'}
                 {(hoveredRating || rating) === 3 && '😐 Bình thường'}
                 {(hoveredRating || rating) === 4 && '😊 Hài lòng'}
                 {(hoveredRating || rating) === 5 && '😍 Rất hài lòng'}
               </p>
             </div>
           </div>

          {/* Nội dung đánh giá */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung đánh giá
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/500
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
