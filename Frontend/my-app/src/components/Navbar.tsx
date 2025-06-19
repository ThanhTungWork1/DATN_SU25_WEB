

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">MyLogo</div>

            <ul className="nav-links" id="navLinks">
                <li><a href="#">Trang chủ</a></li>
                <li><a href="#">Nam</a></li>
                <li><a href="#">Nữ</a></li>
                <li><a href="#">Trend</a></li>
                <li className="dropdown">
                    <a href="#">Phụ kiện ▾</a>
                    <ul className="dropdown-menu">
                        <li><a href="#">Giày thể thao</a></li>
                        <li><a href="#">Mũ</a></li>
                        <li><a href="#">Kính</a></li>
                        <li><a href="#">Tất/Vớ</a></li>
                    </ul>
                </li>
                <li><a href="#">Liên hệ</a></li>
            </ul>

            <div className="icon-group">
                <div className="search-container">
                    <div className="search-toggle" id="searchToggle">&#128269;</div>
                    <input type="text" id="searchInput" placeholder="Tìm kiếm..." />
                </div>

                <div className="icon-btn" title="Tài khoản">&#128100;</div>
                <div className="icon-btn" title="Giỏ hàng">&#128722;</div>

                <button className="login-btn">Đăng nhập</button>
            </div>

            <div className="menu-toggle" id="menuToggle">&#9776;</div>
        </nav>
    );
};

export default Navbar;
