import { useState } from "react";
import type { Product } from "../../../types/DetailType";
import { useProductReviews } from "../../../hook/useProductReviews";
import { FaStar } from "react-icons/fa";

type ProductTabsProps = {
  product: Product;
};

/* Component hiển thị sao đánh giá */
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
  const { reviews, isLoading } = useProductReviews(product.id);

  // Render mô tả sản phẩm
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

  // Render đánh giá sản phẩm
  const renderReview = () => {
    if (isLoading) return <p>Đang tải đánh giá...</p>;
    if (!reviews || reviews.length === 0) {
      return (
        <p className="text-muted mt-3">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
      );
    }

    return (
      <div>
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
                  {review.user?.username || "Người dùng ẩn danh"}
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

  return (
    <>
      {/* Tabs điều hướng */}
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

      {/* Nội dung tab */}
      <div className="tab-content mt-3 tab-content-scrollable">
        {activeTab === "desc" && <div>{renderDescription()}</div>}
        {activeTab === "review" && <div>{renderReview()}</div>}
      </div>
    </>
  );
};

export default ProductTabs;
