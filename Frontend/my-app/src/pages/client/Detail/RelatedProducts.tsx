import { useRelatedProducts } from '../../../hook/ClientHookDetail';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../../../provider/CartProvider';
import '../../../assets/styles/detailProduct.css'
import { toast } from 'sonner';

type RouteParams = {
    id: string;
};

interface RelatedProductsProps {
    categoryId?: number;
    limit?: number;
}

// =============================
// Component hiển thị danh sách sản phẩm liên quan
// =============================

const RelatedProducts = ({ categoryId, limit = 8 }: RelatedProductsProps) => {
    // Lấy id sản phẩm hiện tại từ URL
    const { id } = useParams<RouteParams>();
    // Lấy danh sách sản phẩm liên quan từ hook (lọc theo categoryId)
    const { data: relatedProducts, isLoading, isError } = useRelatedProducts(id!, categoryId, limit);
    // Lấy hàm thêm vào giỏ hàng từ context
    const { addToCart } = useCart();

    // Loading: hiển thị skeleton
    if (isLoading) {
        return (
            <div className="related-products mt-5">
                <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
                <div className="row g-3">
                    {[...Array(8)].map((_, index) => (
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={index}>
                            <div className="card h-100">
                                <div className="card-img-top bg-light" style={{ height: '300px' }}></div>
                                <div className="card-body">
                                    <div className="placeholder-glow">
                                        <h6 className="placeholder col-8"></h6>
                                        <p className="placeholder col-4"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Nếu lỗi hoặc không có sản phẩm liên quan
    if (isError || !relatedProducts || relatedProducts.length === 0) {
        return (
            <div className="related-products mt-5">
                <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
                <p className="text-center text-muted">Không có sản phẩm liên quan</p>
            </div>
        );
    }

    // =============================
    // Render danh sách sản phẩm liên quan
    // =============================
    return (
        <div className="related-products mt-5">
            <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
            <div className="row g-3">
                {relatedProducts.map((product) => {
                    // Lấy ảnh đại diện sản phẩm
                    const imageUrl = product.image || (product.images?.[0]);
                    return (
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={product.id}>
                            <div className="card h-100">
                                {/* Ảnh sản phẩm */}
                                <img
                                    src={imageUrl}
                                    className="card-img-top"
                                    alt={product.name}
                                    style={{ height: '300px', objectFit: 'contain', padding: '10px' }}
                                />
                                <div className="card-body d-flex flex-column justify-content-between">
                                    {/* Tên sản phẩm */}
                                    <h6 className="card-title">{product.name}</h6>
                                    {/* Giá sản phẩm, giá gốc nếu có, giá sau giảm nếu có */}
                                    <p className="price">
                                        {(() => {
                                            const originalPrice = product.original_price || product.old_price;
                                            if (product.discount && product.discount > 0 && product.discount < 100) {
                                                return (
                                                    <>
                                                        <span className="text-decoration-line-through text-muted me-2">
                                                            {product.price.toLocaleString()}đ
                                                        </span>
                                                        <span className="text-danger">
                                                            {Math.max(0, Math.round(product.price * (1 - product.discount / 100))).toLocaleString()}đ
                                                        </span>
                                                        {originalPrice && originalPrice > product.price && (
                                                            <span className="price-original">
                                                                {originalPrice.toLocaleString()}đ
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            } else {
                                                return (
                                                    <>
                                                        <span className="text-danger">{product.price.toLocaleString()}đ</span>
                                                        {originalPrice && originalPrice > product.price && (
                                                            <span className="price-original">
                                                                {originalPrice.toLocaleString()}đ
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            }
                                        })()}
                                    </p>
                                    {/* Nút xem chi tiết và thêm giỏ hàng */}
                                    <div className="d-flex gap-2">
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="btn btn-sm w-50 btn-buy"
                                        >
                                            Xem chi tiết
                                        </Link>
                                        <button className="btn btn-sm w-50 btn-cart" onClick={() => {
                                            addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: product.discount && product.discount > 0 && product.discount < 100
                                                    ? Math.max(0, Math.round(product.price * (1 - product.discount / 100)))
                                                    : product.price,
                                                image: product.images?.[0] || product.image || '',
                                                quantity: 1,
                                            });
                                            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
                                        }}>
                                            Thêm giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RelatedProducts;
