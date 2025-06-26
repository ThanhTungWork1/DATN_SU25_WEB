import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const goToCart = () => {
    navigate("/cart");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <img
          src="https://i.imgur.com/9Og6FJC.jpeg"
          alt="Logo Shop"
          style={{ width: "90px", height: "50px", objectFit: "contain", cursor: "pointer" }}
        />
      </div>

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
        <SearchBar onSearch={handleSearch} />
        
        <div className="icon-btn" title="Tài khoản">
          &#128100;
        </div>

        <div className="icon-btn" title="Giỏ hàng" onClick={goToCart} style={{ cursor: "pointer" }}>
          &#128722;
        </div>

        <button className="login-btn">Đăng nhập</button>
      </div>

      <div className="menu-toggle" id="menuToggle">
        &#9776;
      </div>
    </nav>
  );
};

export default Navbar;
