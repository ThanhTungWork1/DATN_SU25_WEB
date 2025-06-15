

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
                {/* Logo bên trái */}
                <a className="navbar-brand" href="#">StrideX</a>

                {/* Button mobile */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Phần nội dung chính */}
                <div className="collapse navbar-collapse" id="navbarContent">
                    {/* Menu căn giữa */}
                    <div className="navbar-nav mx-auto">
                        <a className="nav-link" href="#">Trang chủ</a>
                        <a className="nav-link" href="#">Cửa hàng</a>
                        <a className="nav-link" href="#">About</a>
                        <a className="nav-link" href="#">Liên hệ</a>
                    </div>

                    {/* Các icon bên phải */}
                    <div className="navbar-nav ms-auto">
                        <a className="nav-link" href="#" title="Search">
                            <i className="fas fa-search"></i>
                        </a>
                        <a className="nav-link" href="#" title="Wishlist">
                            <i className="far fa-heart"></i>
                        </a>
                        <a className="nav-link" href="#" title="Cart">
                            <i className="fas fa-shopping-cart"></i>
                        </a>
                        <a className="nav-link" href="#" title="Account">
                            <i className="far fa-user"></i>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
