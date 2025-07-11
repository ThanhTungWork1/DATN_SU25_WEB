<<<<<<< HEAD
<<<<<<< HEAD
const Footer = () => {
  return (
    <footer className="bg-light text-dark py-5 border-top">
      <div className="container">
        <div className="row">
          {/* Cột 1: Về Uniqlo */}
          <div className="col-md-3">
            <h6 className="fw-bold">Về StrideX</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-dark text-decoration-none">Giới thiệu</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Danh sách cửa hàng</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Cơ hội nghề nghiệp</a></li>
            </ul>
          </div>

          {/* Cột 2: Trợ giúp */}
          <div className="col-md-3">
            <h6 className="fw-bold">Trợ giúp</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-dark text-decoration-none">Hỏi đáp</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Chính sách trả hàng</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          {/* Cột 3: Danh mục */}
          <div className="col-md-3">
            <h6 className="fw-bold">Danh mục</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-dark text-decoration-none">Giày thể thao</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Quần áo</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Phụ kiện</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Khuyến mãi</a></li>
            </ul>
          </div>

          {/* Cột 4: Bản tin */}
          <div className="col-md-3">
            <h6 className="fw-bold">Bản tin điện tử</h6>
            <p className="small">
              Đăng ký để nhận thông tin sản phẩm mới, khuyến mãi & sự kiện từ StrideX.
            </p>
            <a href="#" className="fw-bold text-dark">ĐĂNG KÝ NGAY</a>
          </div>
        </div>

        <hr className="border-dark my-4" />

        {/* Mô tả thương hiệu */}
        <div className="footer-desc small mb-3">
          StrideX – Trang web bán đồ thể thao uy tín với sản phẩm đa dạng như giày chạy bộ, quần áo thể thao, phụ kiện chất lượng từ các thương hiệu hàng đầu. Giao hàng toàn quốc, hỗ trợ đổi trả nhanh chóng.
        </div>

        {/* Tài khoản xã hội */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="mb-0 small">Cài đặt cookies | <a href="#" className="text-dark text-decoration-none">English</a> | <a href="#" className="text-dark text-decoration-none">Tiếng Việt</a></p>
          </div>
          <div>
            <a href="#" className="text-dark me-3"><i className="fab fa-facebook fa-lg"></i></a>
            <a href="#" className="text-dark me-3"><i className="fab fa-instagram fa-lg"></i></a>
            <a href="#" className="text-dark me-3"><i className="fab fa-youtube fa-lg"></i></a>
            <a href="#" className="text-dark"><i className="fab fa-tiktok fa-lg"></i></a>
          </div>
        </div>

        <hr className="border-dark my-4" />

        {/* Bản quyền & nút đầu trang */}
        <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0 small">&copy; 2024 StrideX. BẢO LƯU MỌI QUYỀN.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn btn-outline-dark btn-sm"
          >
            ⬆ ĐẦU TRANG
          </button>
        </div>
      </div>
    </footer>
  );
=======


=======
>>>>>>> f51a0d77 (trang detail hoan thien)
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
        StrideX – Trang web bán đồ thể thao uy tín với sản phẩm đa dạng như giày
        chạy bộ, quần áo thể thao, phụ kiện chất lượng từ các thương hiệu hàng
        đầu. Giao hàng toàn quốc, hỗ trợ đổi trả nhanh chóng.
      </div>

<<<<<<< HEAD
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
>>>>>>> 6a994c6e (giao dien detail)
=======
      <div className="footer-bottom">
        <p>&copy; 2024 StrideX</p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="scroll-top"
        >
          ⬆ ĐẦU TRANG
        </button>
      </div>
    </footer>
  );
>>>>>>> a8244187 (giao dien list sp)
};

export default Footer;
