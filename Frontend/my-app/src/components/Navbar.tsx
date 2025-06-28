import SearchBar from "./SearchBar";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { CATEGORY_MENU } from "../utils/categoryMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");
<<<<<<< HEAD

  // Xác định active cho từng menu
  // Sản phẩm: chỉ active khi path là /products và không có category thuộc Nam/Nữ/Phụ kiện
  const isProductsPage = location.pathname === "/products" &&
    ![...CATEGORY_MENU.NAM_IDS, ...CATEGORY_MENU.NU_IDS, ...CATEGORY_MENU.PHU_KIEN].includes(Number(categoryParam));

  // Nam: active khi category thuộc NAM_IDS
  const isNamActive = CATEGORY_MENU.NAM_IDS.includes(Number(categoryParam));
  // Nữ: active khi category thuộc NU_IDS
  const isNuActive = CATEGORY_MENU.NU_IDS.includes(Number(categoryParam));
  // Phụ kiện: active khi category là PHU_KIEN, PHU_KIEN_KINH, PHU_KIEN_MU
  const isPhuKienActive = [
    ...CATEGORY_MENU.PHU_KIEN,
    CATEGORY_MENU.PHU_KIEN_KINH,
    CATEGORY_MENU.PHU_KIEN_MU
  ].includes(Number(categoryParam));
=======
  
  const isPhuKien =
    categoryParam === CATEGORY_MENU.PHU_KIEN.join(",") ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_KINH) ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_MU);
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

<<<<<<< HEAD
=======
  // Xử lý click menu Phụ kiện (lọc cả Kính và Mũ)
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)
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
          <button
            className={isProductsPage ? "active" : ""}
            onClick={() => navigate("/products")}
            style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", padding: "8px 12px", borderRadius: "4px" }}
          >
            Sản phẩm
          </button>
        </li>
        <li className="dropdown">
          <button className={isNamActive ? "active" : ""}>
            Nam <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li><button onClick={() => navigate("/products?category=1")}>Áo</button></li>
            <li><button onClick={() => navigate("/products?category=2")}>Quần</button></li>
          </ul>
        </li>
        <li className="dropdown">
          <button className={isNuActive ? "active" : ""}>
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
          <button onClick={handleClickPhuKien} className={isPhuKienActive ? "active" : ""}>
            Phụ kiện <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                onClick={handleClickPhuKienMu}
                className={Number(categoryParam) === CATEGORY_MENU.PHU_KIEN_MU ? "active" : ""}
              >
                Mũ
              </button>
            </li>
            <li>
              <button
                onClick={handleClickPhuKienKinh}
                className={Number(categoryParam) === CATEGORY_MENU.PHU_KIEN_KINH ? "active" : ""}
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
          onClick={() => navigate("/register")}
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
