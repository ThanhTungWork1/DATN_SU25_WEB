<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a8244187 (giao dien list sp)
import { useState } from "react";
import type { Product } from "../../../types/DetailType";
import { useProductReviews } from "../../../hook/useProductReviews";
import { FaStar } from "react-icons/fa";
<<<<<<< HEAD

type ProductTabsProps = {
  product: Product;
};

/* Component để hiển thị các ngôi sao đánh giá */
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
  const [activeTab, setActiveTab] = useState<"desc" | "info" | "review">(
    "desc",
  );
  const { reviews, isLoading } = useProductReviews(product.id);

  // Render phần mô tả sản phẩm
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

  // Render phần đánh giá
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
            },
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
      {/* Tabs */}
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
=======
=======
import { useState } from 'react';
import type { Product } from '../../../types/DetailType';
import { useProductReviews } from '../../../hook/useProductReviews';
<<<<<<< HEAD
>>>>>>> f51a0d77 (trang detail hoan thien)
=======
import { FaStar } from 'react-icons/fa';
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
=======
>>>>>>> a8244187 (giao dien list sp)

type ProductTabsProps = {
  product: Product;
};

/* Component để hiển thị các ngôi sao đánh giá */
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
  const [activeTab, setActiveTab] = useState<"desc" | "info" | "review">(
    "desc",
  );
  const { reviews, isLoading } = useProductReviews(product.id);

  // Render phần mô tả sản phẩm
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

<<<<<<< HEAD
    // Render phần đánh giá
<<<<<<< HEAD
    const renderReview = () => (
        <div>
            {isLoading ? (
                <p>Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
                <p>Chưa có đánh giá nào</p>
            ) : (
                reviews.map((r) => (
                    <div key={r.id} className="mb-3 border-bottom pb-2">
                        <strong>{r.user}</strong> – ⭐ {r.rating}
                        <p>{r.comment}</p>
                        <small>{new Date(r.date).toLocaleDateString()}</small>
                    </div>
                ))
            )}
        </div>
    );
<<<<<<< HEAD
>>>>>>> 6a994c6e (giao dien detail)
=======
=======
    const renderReview = () => {
        if (isLoading) return <p>Đang tải đánh giá...</p>;
        if (!reviews || reviews.length === 0) {
            return <p className="text-muted mt-3">Chưa có đánh giá nào cho sản phẩm này.</p>;
        }

        return (
            <div>
                {reviews.map((review) => {
                    /*
                     * =================================================================
                     * GỠ LỖI: In ra đối tượng review để kiểm tra
                     * =================================================================
                     */
                    console.log("[DEBUG] Dữ liệu của một review:", review);
                    
                    const reviewDate = new Date(review.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                    return (
                        <div key={review.id} className="mb-4 border-bottom pb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <strong className="text-dark">{review.user?.username || 'Người dùng ẩn danh'}</strong>
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
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
=======
  // Render phần đánh giá
  const renderReview = () => {
    if (isLoading) return <p>Đang tải đánh giá...</p>;
    if (!reviews || reviews.length === 0) {
      return (
        <p className="text-muted mt-3">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
      );
    }
>>>>>>> a8244187 (giao dien list sp)

    return (
      <div>
        {reviews.map((review) => {
          /*
           * =================================================================
           * GỠ LỖI: In ra đối tượng review để kiểm tra
           * =================================================================
           */
          console.log("[DEBUG] Dữ liệu của một review:", review);

          const reviewDate = new Date(review.created_at).toLocaleDateString(
            "vi-VN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            },
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
<<<<<<< HEAD
>>>>>>> f51a0d77 (trang detail hoan thien)
=======
  };

  return (
    <>
      {/* Tabs */}
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
>>>>>>> a8244187 (giao dien list sp)
};

export default ProductTabs;
