
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
};

export default ProductTabs;
