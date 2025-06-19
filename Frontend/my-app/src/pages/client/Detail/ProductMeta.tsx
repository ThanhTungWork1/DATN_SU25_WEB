type ProductMetaProps = {
    sku: string;
    category: string;
    tags: string[];
};

const ProductMeta = ({ sku, category, tags }: ProductMetaProps) => {
    return (
        <div className="mt-3">
            <p>Mã SP: {sku}</p>
            <p>Loại: {category}</p>
            <p>Tags: {tags.join(', ')}</p>
        </div>
    );
};

export default ProductMeta;
