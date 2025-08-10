import { useState } from "react";
import type { Product } from "../../../types/DetailType";
import { useReviewSystem } from "../../../hook/useReviewSystem";
import { FaStar } from "react-icons/fa";
import ReviewForm from "../../../components/ReviewForm";
import "../../../assets/styles/productTabs.css";

type ProductTabsProps = {
  product: Product;
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="d-flex align-items-center">
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          color={index < rating ? "#ffc107" : "#e4e5e9"}
          size={16}
        />
      ))}
      <span className="ms-2 fw-bold">{rating}.0</span>
    </div>
  );
};

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<"desc" | "review">("desc");
  const {
    reviews,
    eligibility,
    reviewsLoading,
    eligibilityLoading,
    isSubmitting,
    isFormVisible,
    setIsFormVisible,
    handleSubmitReview,
    canShowForm,
    isLoggedIn
  } = useReviewSystem(product.id);

  const renderDescription = () => (
    <>
      <p className="mt-3">{product.description}</p>
      <div className="row g-3">
        {(product.detailImages || []).slice(0, 2).map((img, index) => (
          <div className="col-md-6" key={index}>
            <img
              src={img}
              className="img-fluid tab-img"
              alt={`detail-${index}`}
            />
          </div>
        ))}
      </div>
    </>
  );

  const renderReviewHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0">Đánh giá sản phẩm</h5>
      {canShowForm && !isFormVisible && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsFormVisible(true)}
        >
          Viết đánh giá
        </button>
      )}
    </div>
  );

  const renderEligibilityMessage = () => {
    if (eligibilityLoading) return null;
    
    if (!isLoggedIn) {
      return (
        <div className="alert alert-info">
          <strong>Thông báo:</strong> Bạn cần đăng nhập để xem và viết đánh giá.
        </div>
      );
    }
    
    if (!eligibility.can_review && eligibility.reason !== 'already_reviewed') {
      return (
        <div className="alert alert-warning">
          <strong>Thông báo:</strong> {eligibility.message}
        </div>
      );
    }
    
    return null;
  };

  const renderReviewForm = () => {
    if (!isFormVisible || !canShowForm) return null;
    
    return (
      <div className="mb-4">
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={() => setIsFormVisible(false)}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  };

  const renderReviewList = () => {
    if (reviewsLoading) return <p>Đang tải đánh giá...</p>;
    
    if (!reviews || reviews.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted mb-0">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
          {canShowForm && (
            <small className="text-muted">
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </small>
          )}
        </div>
      );
    }

    return (
      <div className="review-scroll-container">
        {reviews.map((review) => {
          const reviewDate = new Date(review.created_at).toLocaleDateString(
            "vi-VN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          );
          return (
            <div key={review.id} className="mb-4 border-bottom pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <strong className="text-dark">
                  {review.user?.username ||
                    review.user?.name ||
                    "Người dùng ẩn danh"}
                </strong>
                <small className="text-muted">{reviewDate}</small>
              </div>
              <div className="my-2">
                <StarRating rating={review.rating} />
              </div>
              <p className="mb-0">{review.content}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReview = () => (
    <div>
      {renderReviewHeader()}
      {renderEligibilityMessage()}
      {renderReviewForm()}
      {renderReviewList()}
    </div>
  );

  return (
    <>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "desc" ? "active" : ""}`}
            onClick={() => setActiveTab("desc")}
          >
            Mô tả
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            Đánh giá ({reviews.length})
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === "desc" && <div>{renderDescription()}</div>}
        {activeTab === "review" && <div>{renderReview()}</div>}
      </div>
    </>
  );
};

export default ProductTabs;
