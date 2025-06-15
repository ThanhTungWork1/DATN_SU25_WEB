<<<<<<< HEAD
import { useState } from "react";
import type { Product } from "../../../types/DetailType";
import { useProductReviews } from "../../../hook/useProductReviews";
import { FaStar } from "react-icons/fa";

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

const ProductTabs = () => {
    return (
        <div className="tab-content">
            <div className="tab-pane fade show active" id="desc">
                <p className="mt-3">
                    Áo Thun Nam Cotton - Trơn - Nhiều màu
                    Size: S, M, L, XL, XXL
                    * Size S: dưới 40kg
                    * Size M: dưới 50kg
                    * Size L: từ 50 - 60kg
                    * Size XL: từ 60 - 72kg
                    * Size XXL: từ 72 - 85kg
                    Size Áo còn phụ thuộc vào chiều cao cân nặng từng người. Những ai có chiều cao cân nặng đặc biệt ( Quá cao hoặc quá thấp so với cân nặng) nên inbox riêng shop để được hỗ trợ tư vấn size cụ thể.
                    Màu sắc: Nhiều màu - Chủ yếu các màu tối cho Nam giới
                    Gồm các màu chính: Đen - Trắng - Xanh Đen - Xám Đen - Xám Tiêu - Xanh dương - Đỏ Đô...
                    Chất liệu: 90% Cotton
                    Đường May chi tiết kỹ lưỡng và chắc chắn.
                </p>
                <div className="row g-3">
                    <div className="col-md-6">
                        <img
                            src="https://tse2.mm.bing.net/th?id=OIP.Unxqn1jDdXWTF9co7IvQOQHaE7&pid=Api&P=0&h=180/400x250"
                            className="img-fluid"
                            alt="product"
                        />
                    </div>
                    <div className="col-md-6">
                        <img
                            src="https://tse2.mm.bing.net/th?id=OIP.Unxqn1jDdXWTF9co7IvQOQHaE7&pid=Api&P=0&h=180/400x250"
                            className="img-fluid"
                            alt="product"
                        />
                    </div>
                </div>
            </div>

            <div className="tab-pane fade" id="add">...</div>
            <div className="tab-pane fade" id="review">...</div>
        </div>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default ProductTabs;
