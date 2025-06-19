import type { Product } from '../../../types/DetailType';

type ProductInfoProps = {
    product: Product;
};

const ProductInfo = ({ product }: ProductInfoProps) => {
    return (
        <div className="product-info">
            {/* tên sp */}
            <h5>{product.name}</h5>
            {/* giá sp */}
            <h2>{product.price.toLocaleString()}đ</h2>
        </div>
    );
};

export default ProductInfo;
