

const ProductActions = () => {
    return (
        <>
            <div className="input-group mb-3" style={{ width: '150px' }}>
                <button className="btn btn-outline-secondary">-</button>
                <input type="text" className="form-control text-center" defaultValue="1" />
                <button className="btn btn-outline-secondary">+</button>
            </div>

            <div className="d-flex gap-2">
                <button className="btn btn-warning text-white">Thêm giỏ hàng</button>
                <button className="btn btn-outline-secondary">+ Compare</button>
            </div>
        </>
    );
};

export default ProductActions;
