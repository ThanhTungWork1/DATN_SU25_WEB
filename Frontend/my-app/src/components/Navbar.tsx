import SearchBar from "./SearchBar";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { CATEGORY_MENU } from "../utils/categoryMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");

  const isPhuKien =
    categoryParam === CATEGORY_MENU.PHU_KIEN.join(",") ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_KINH) ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_MU);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleClickPhuKien = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN.join(",")}`);
  };

  const handleClickPhuKienMu = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_MU}`);
  };

  const handleClickPhuKienKinh = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_KINH}`);
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

      <ul className="menu-links" id="navLinks">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} end>
            Trang chủ
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>
            Sản phẩm
          </NavLink>
        </li>
        <li className="dropdown">
          <button className={["1", "2"].includes(categoryParam || "") ? "active" : ""}>
            Nam <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li><button onClick={() => navigate("/products?category=1")}>Áo</button></li>
            <li><button onClick={() => navigate("/products?category=2")}>Quần</button></li>
          </ul>
        </li>
        <li className="dropdown">
          <button className={["5", "6"].includes(categoryParam || "") ? "active" : ""}>
            Nữ <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li><button onClick={() => navigate("/products?category=5")}>Áo</button></li>
            <li><button onClick={() => navigate("/products?category=6")}>Quần</button></li>
          </ul>
        </li>
        <li>
          <button onClick={() => navigate("/trend")}>Trend</button>
        </li>
        <li className="dropdown">
          <button onClick={handleClickPhuKien} className={isPhuKien ? "active" : ""}>
            Phụ kiện <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                onClick={handleClickPhuKienMu}
                className={categoryParam === String(CATEGORY_MENU.PHU_KIEN_MU) ? "active" : ""}
              >
                Mũ
              </button>
            </li>
            <li>
              <button
                onClick={handleClickPhuKienKinh}
                className={categoryParam === String(CATEGORY_MENU.PHU_KIEN_KINH) ? "active" : ""}
              >
                Kính
              </button>
            </li>
          </ul>
        </li>
        <li>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>
            Đơn hàng
          </NavLink>
        </li>
      </ul>

      <div className="icon-group">
        <SearchBar onSearch={handleSearch} />
        <div
          className="icon-btn"
          title="Tài khoản"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          &#128100;
        </div>
        <div
          className="icon-btn icon-favorite-navbar"
          title="Yêu thích"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/wishlist")}
        >
          <i className="far fa-heart"></i>
        </div>
        <div
          className="icon-btn"
          title="Giỏ hàng"
          onClick={goToCart}
          style={{ cursor: "pointer" }}
        >
          &#128722;
        </div>
        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
      </div>

      <div className="menu-toggle" id="menuToggle">&#9776;</div>
    </nav>
  );
};

export default Navbar;
