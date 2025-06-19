import { useProductReviews } from "../../../hook/useProductReviews";

type Props = {
    productId: number;
};

const ReviewList = ({ productId }: Props) => {
    const { reviews, isLoading } = useProductReviews(productId);

    if (isLoading) return <p>Đang tải đánh giá...</p>;

    if (reviews.length === 0) return <p>Chưa có đánh giá nào cho sản phẩm này.</p>;

    return (
        <div className="mt-4">
            <h5>Đánh giá của khách hàng</h5>
            {reviews.map((r) => (
                <div key={r.id} className="mb-3 border-bottom pb-2">
                    <strong>{r.user}</strong> – ⭐ {r.rating}
                    <p>{r.comment}</p>
                    <small>{new Date(r.date).toLocaleDateString()}</small>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
