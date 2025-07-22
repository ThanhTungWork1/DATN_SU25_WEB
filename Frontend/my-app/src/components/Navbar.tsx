import SearchBar from "./SearchBar";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { CATEGORY_MENU } from "../utils/categoryMenu";
import { useEffect, useState } from "react";
import { message } from "antd";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setUser(null);
      }
    }
  }, [location]); // cập nhật mỗi lần chuyển route

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công");
    setUser(null);
    navigate("/login");
  };

  const goToCart = () => navigate("/cart");

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");

  const isProductsPage =
    location.pathname === "/products" &&
    ![...CATEGORY_MENU.NAM_IDS, ...CATEGORY_MENU.NU_IDS, ...CATEGORY_MENU.PHU_KIEN].includes(Number(categoryParam));

  const isNamActive = CATEGORY_MENU.NAM_IDS.includes(Number(categoryParam));
  const isNuActive = CATEGORY_MENU.NU_IDS.includes(Number(categoryParam));
  const isPhuKienActive = [
    ...CATEGORY_MENU.PHU_KIEN,
    CATEGORY_MENU.PHU_KIEN_KINH,
    CATEGORY_MENU.PHU_KIEN_MU,
  ].includes(Number(categoryParam));

  const handleClickPhuKien = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN.join(",")}`);
  };

  const handleClickPhuKienMu = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_MU}`);
  };

  const handleClickPhuKienKinh = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_KINH}`);
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
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
            Trang chủ
          </NavLink>
        </li>
        <li>
          <button
            className={isProductsPage ? "active" : ""}
            onClick={() => navigate("/products")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "4px",
            }}
          >
            Sản phẩm
          </button>
        </li>
        <li className="dropdown">
          <button className={isNamActive ? "active" : ""}>
            Nam <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button onClick={() => navigate("/products?category=1")}>Áo</button>
            </li>
            <li>
              <button onClick={() => navigate("/products?category=2")}>Quần</button>
            </li>
          </ul>
        </li>
        <li className="dropdown">
          <button className={isNuActive ? "active" : ""}>
            Nữ <span className="dropdown-icon">▼</span>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button onClick={() => navigate("/products?category=5")}>Áo</button>
            </li>
            <li>
              <button onClick={() => navigate("/products?category=6")}>Quần</button>
            </li>
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
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            Đơn hàng
          </NavLink>
        </li>
      </ul>

      <div className="icon-group">
        <SearchBar onSearch={handleSearch} />
        <div
          className="icon-btn"
          title="Yêu thích"
          onClick={() => navigate("/wishlist")}
          style={{ cursor: "pointer" }}
        >
          <i className="far fa-heart"></i>
        </div>
        <div className="icon-btn" title="Giỏ hàng" onClick={goToCart} style={{ cursor: "pointer" }}>
          🛒
        </div>

        {user ? (
          <>
            {user.role === "admin" && (
              <button className="login-btn" onClick={() => navigate("/admin/dashboard")}>
                Admin
              </button>
            )}
            <button className="login-btn" onClick={() => navigate("/profile")}>
              {user.name || "Tài khoản"}
            </button>
            <button className="login-btn" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
            <button className="login-btn" onClick={() => navigate("/register")}>
              Đăng ký
            </button>
          </>
        )}
      </div>

      <div className="menu-toggle" id="menuToggle">
        ☰
      </div>
    </nav>
  );
};

export default Navbar;
