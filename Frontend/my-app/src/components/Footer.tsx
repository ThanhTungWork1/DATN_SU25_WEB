const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-links">
                <a href="#">Hỏi đáp</a>
                <a href="#">Chính sách bảo mật</a>
                <a href="#">Điều khoản sử dụng</a>
                <a href="#">Giới thiệu</a>
                <a href="#">Liên hệ</a>
            </div>

            <div className="footer-menu">
                <a href="#">Giày thể thao</a>
                <a href="#">Quần áo</a>
                <a href="#">Phụ kiện</a>
                <a href="#">Khuyến mãi</a>
            </div>

            <div className="footer-desc">
                StrideX – Trang web bán đồ thể thao uy tín với sản phẩm đa dạng như giày chạy bộ, quần áo thể thao, phụ kiện chất
                lượng từ các thương hiệu hàng đầu. Giao hàng toàn quốc, hỗ trợ đổi trả nhanh chóng.
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 StrideX</p>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="scroll-top"
                >
                    ⬆ ĐẦU TRANG
                </button>
            </div>
        </footer>
    );
};

export default Footer;
