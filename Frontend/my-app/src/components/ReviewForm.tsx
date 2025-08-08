import React, { useState } from 'react';
import { Star, StarFill } from 'react-bootstrap-icons';

interface ReviewFormProps {
  onSubmit: (reviewData: { content: string; rating: number }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content, rating });
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          className="btn p-0 me-1"
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(i)}
          style={{ background: 'none', border: 'none' }}
        >
          {isFilled ? (
            <StarFill size={24} className="text-warning" />
          ) : (
            <Star size={24} className="text-muted" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="border rounded p-4 bg-light">
      <h5 className="mb-3">Viết đánh giá của bạn</h5>
      
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-3">
          <label className="form-label">Đánh giá sao:</label>
          <div className="d-flex align-items-center">
            {renderStarRating()}
            <span className="ms-2 text-muted">
              {rating > 0 ? `${rating}/5 sao` : 'Chọn số sao'}
            </span>
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-3">
          <label htmlFor="reviewContent" className="form-label">
            Nội dung đánh giá: <span className="text-danger">*</span>
          </label>
          <textarea
            id="reviewContent"
            className="form-control"
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            required
          />
          <small className="text-muted">
            {content.length}/500 ký tự
          </small>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || rating === 0 || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
        <small className="text-muted">
          <strong>Lưu ý:</strong> Đánh giá phải dựa trên trải nghiệm thực tế với sản phẩm. 
          Chúng tôi sẽ kiểm duyệt các đánh giá có nội dung không phù hợp.
        </small>
      </div>
    </div>
  );
};

export default ReviewForm;
