import { useRelatedProducts } from '../../../hook/ClientHookDetail';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../../../provider/CartProvider';
import '../../../assets/styles/detailProduct.css'

type RouteParams = {
    id: string;
};

interface RelatedProductsProps {
    categoryName?: string;
    tags?: string[];
    price?: number;
}

const RelatedProducts = ({ categoryName, tags, price }: RelatedProductsProps) => {
    const { id } = useParams<RouteParams>();
    const { data: relatedProducts, isLoading, isError } = useRelatedProducts(id!, categoryName, tags, price);
    const { addToCart } = useCart();

    if (isLoading) {
        return (
            <div className="related-products mt-5">
                <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
                <div className="row g-3">
                    {[1, 2, 3, 4].map((_, index) => (
                        <div className="col-md-3" key={index}>
                            <div className="card h-100">
                                <div className="card-img-top bg-light" style={{ height: '200px' }}></div>
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

    if (isError || !relatedProducts || relatedProducts.length === 0) {
        return (
            <div className="related-products mt-5">
                <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
                <p className="text-center text-muted">Không có sản phẩm liên quan</p>
            </div>
        );
    }

    return (
        <div className="related-products mt-5">
            <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
            <div className="row g-3">
                {relatedProducts.map((product) => (
                    <div className="col-md-3" key={product.id}>
                        <div className="card h-100">
                            <img
                                src={product.images[0] || "https://via.placeholder.com/300x300"}
                                className="card-img-top"
                                alt={product.name}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column justify-content-between">
                                <h6 className="card-title">{product.name}</h6>
                                <p className="price">
                                    {product.discount && product.discount > 0 && product.discount < 100 ? (
                                        <>
                                            <span className="text-decoration-line-through text-muted me-2">
                                                {product.price.toLocaleString()}đ
                                            </span>
                                            <span className="text-danger">
                                                {Math.max(0, Math.round(product.price * (1 - product.discount / 100))).toLocaleString()}đ
                                            </span>
                                        </>
                                    ) : (
                                        <span>{product.price.toLocaleString()}đ</span>
                                    )}
                                </p>
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
                                            image: product.images[0] || '',
                                            quantity: 1,
                                        });
                                        alert('Đã thêm vào giỏ hàng!');
                                    }}>
                                        Thêm giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
