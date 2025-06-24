import { Link, useNavigate, } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearChatHistory } from "./chat";

<link rel="stylesheet" href="header.css" />

const Header = () => {
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const handleLogout = async () => {
    await clearChatHistory();
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchOpen(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img
            src="https://toppng.com/uploads/preview/uniqlo-logo-vector-11573942521rp32cmu2vg.png"
            alt="UNIQLO"
            style={{ height: "40px" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Sản phẩm
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Liên hệ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                Giới thiệu
              </Link>
            </li>
          </ul>

         
          {/* Thanh tìm kiếm */}
<div className="ms-auto d-flex align-items-center">
  {searchOpen && (
    <form className="search-form me-2" onSubmit={handleSearchSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
      />
      <button type="submit" className="search-submit">Tìm</button>
    </form>
  )}
  <button className="search-button" onClick={() => setSearchOpen(!searchOpen)}>
    <i className="fas fa-search"></i>
  </button>
</div>


          {/* Người dùng, Đơn hàng & Giỏ hàng */}
          <ul className="navbar-nav ms-3">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link btn btn-dark dropdown-toggle"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  👤 {user.fullName}
                </button>
                {isDropdownOpen && (
                  <ul className="dropdown-menu dropdown-menu-dark show" style={{ display: "block" }}>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  <i className="fas fa-user"></i> Đăng nhập
                </Link>
              </li>
            )}
            <li className="nav-item">
            <Link className="nav-link" to="/orders">
    <i className="fas fa-box"></i> Đơn hàng
  </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                <i className="fas fa-shopping-cart"></i>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
