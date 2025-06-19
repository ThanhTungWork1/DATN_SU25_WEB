import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductDetail } from '../../../hook/ClientHookDetail';
import Navbar from '../../../components/Navbar';
import Aside from './Aside';
import MainImage from './MainImage';
import ProductInfo from './ProductInfo';
import Size from './Size';
import Color from '../../../components/Color';
import ProductActions from '../../../components/ProductActions';
import ProductMeta from './ProductMeta';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Footer from '../../../components/Footer';
import { useProductDetailLogic } from './useProductDetailLogic';
import '../../../assets/styles/detailProduct.css';

type RouteParams = {
    id: string;
};

const ProductDetail = () => {
    const { id } = useParams<RouteParams>();
    const { data: product, isLoading, isError } = useProductDetail(id!);
    const {
        selectedImage, setSelectedImage,
        selectedSize, setSelectedSize,
        selectedColor, setSelectedColor,
        handleAddToCart, handleBuyNow
    } = useProductDetailLogic(product);

    useEffect(() => { }, [id]); // giữ để nếu muốn thêm logic khi id đổi

    if (isLoading) return <p>Đang tải...</p>;
    if (isError || !product) return <p>Lỗi hoặc không có sản phẩm.</p>;

    return (
        <>
            <Navbar />

            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-lg-2 col-md-3 d-none d-md-block">
                        <Aside
                            images={product.images}
                            onSelect={setSelectedImage}
                            selectedImage={selectedImage}
                        />
                    </div>
                    <div className="col-lg-5 col-md-9 col-12">
                        <MainImage imageUrl={selectedImage} />
                    </div>

                    <div className="col-lg-5 col-12">
                        <ProductInfo product={product} />

                        <Size
                            variants={product.variants}
                            selectedSize={selectedSize}
                            onSelectSize={setSelectedSize}
                        />

                        <Color
                            colors={product.colors}
                            selectedColor={selectedColor}
                            onSelectColor={(color) => {
                                setSelectedColor(color);
                                if (color.image) setSelectedImage(color.image);
                            }}
                        />

                        <ProductActions
                            variants={product.variants}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />

                        <ProductMeta
                            sku={product.sku}
                            category={product.category}
                            tags={product.tags}
                        />

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
                    </div>
                </div>

                <ProductTabs key={product.id} product={product} />
                <RelatedProducts
                    categoryName={product.category}
                    tags={product.tags}
                    price={product.price}
                />
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;

