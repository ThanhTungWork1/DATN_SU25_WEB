import { useState } from 'react';
import type { Product } from '../../../types/DetailType';
import { useProductReviews } from '../../../hook/useProductReviews';

type ProductTabsProps = {
    product: Product;
};

const ProductTabs = ({ product }: ProductTabsProps) => {
    const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'review'>('desc');
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

    return (
        <>
            {/* Tabs */}
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'desc' ? 'active' : ''}`}
                        onClick={() => setActiveTab('desc')}
                    >
                        Mô tả
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'review' ? 'active' : ''}`}
                        onClick={() => setActiveTab('review')}
                    >
                        Đánh giá ({reviews.length})
                    </button>
                </li>
            </ul>

            {/* Nội dung tab */}
            <div className="tab-content mt-3">
                {activeTab === 'desc' && <div>{renderDescription()}</div>}
                {activeTab === 'review' && <div>{renderReview()}</div>}
            </div>
        </>
    );
};

export default ProductTabs;
