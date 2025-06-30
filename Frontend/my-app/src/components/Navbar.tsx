import SearchBar from "./SearchBar";
import { useNavigate, useLocation } from "react-router-dom";
import { CATEGORY_MENU } from "../utils/categoryMenu";

/**
 * Navbar hiển thị menu và xử lý chuyển trang theo danh mục
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy category từ query string
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");
  
  const isPhuKien =
    categoryParam === CATEGORY_MENU.PHU_KIEN.join(",") ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_KINH) ||
    categoryParam === String(CATEGORY_MENU.PHU_KIEN_MU);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products/search?query=${encodeURIComponent(query)}`);
    }
  };

  // Xử lý click menu Phụ kiện (lọc cả Kính và Mũ)
  const handleClickPhuKien = () => {
    // Truyền mảng categoryId lên query string, ví dụ: ?category=3,4
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN.join(",")}`);
  };

  // Xử lý click menu Mũ (phụ kiện)
  const handleClickPhuKienMu = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_MU}`);
  };

  // Xử lý click menu Kính (phụ kiện)
  const handleClickPhuKienKinh = () => {
    navigate(`/products?category=${CATEGORY_MENU.PHU_KIEN_KINH}`);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img
          src="https://i.imgur.com/9Og6FJC.jpeg"
          alt="Logo Shop"
          style={{ width: "90px", height: "50px", objectFit: "contain" }}
        />
      </div>

      <ul className="nav-links" id="navLinks">
        <li>
          <a href="#">Trang chủ</a>
        </li>
        <li className="dropdown">
          <a
            href="#"
            className={categoryParam === "1" || categoryParam === "2" ? "active" : ""}
          >
            Nam <span className="dropdown-icon">▼</span>
          </a>
          <ul className="dropdown-menu">
            <li>
              <a href="#" onClick={() => navigate(`/products?category=1`)}>
                Áo
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate(`/products?category=2`)}>
                Quần
              </a>
            </li>
          </ul>
        </li>
        <li className="dropdown">
          <a
            href="#"
            className={categoryParam === "5" || categoryParam === "6" ? "active" : ""}
          >
            Nữ <span className="dropdown-icon">▼</span>
          </a>
          <ul className="dropdown-menu">
            <li>
              <a href="#" onClick={() => navigate(`/products?category=5`)}>
                Áo
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate(`/products?category=6`)}>
                Quần
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#">Trend</a>
        </li>
        <li className="dropdown">
          <a
            href="#"
            onClick={handleClickPhuKien}
            className={isPhuKien ? "active" : ""}
          >
            Phụ kiện <span className="dropdown-icon">▼</span>
          </a>
          <ul className="dropdown-menu">
            <li>
              <a
                href="#"
                onClick={handleClickPhuKienMu}
                className={
                  categoryParam === String(CATEGORY_MENU.PHU_KIEN_MU)
                    ? "active"
                    : ""
                }
              >
                Mũ
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={handleClickPhuKienKinh}
                className={
                  categoryParam === String(CATEGORY_MENU.PHU_KIEN_KINH)
                    ? "active"
                    : ""
                }
              >
                Kính
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#">Liên hệ</a>
        </li>
      </ul>

      <div className="icon-group">
        <SearchBar onSearch={handleSearch} />
        <div className="icon-btn" title="Tài khoản">
          &#128100;
        </div>
        <div className="icon-btn" title="Giỏ hàng">
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
