import { useState } from "react";
import SearchBar from "./SearchBar";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { CATEGORY_MENU } from "../utils/categoryMenu";
<<<<<<< HEAD
import MegaMenu from "./MegaMenu";
import "../assets/styles/navbar.css";
import "../assets/styles/menu.css";

import React, { useRef, useEffect } from "react";
import { MEGA_MENU_NAM, MEGA_MENU_NU, MEGA_MENU_PHUKIEN } from "./megaMenuData";

const MENU = [{ label: "Nam" }, { label: "Nữ" }, { label: "Phụ kiện" }];
=======
import { useEffect, useState } from "react";
import { message } from "antd";
>>>>>>> origin/ThanhTung_profile_home_auth

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<any>(null);

<<<<<<< HEAD
  // Xác định active cho từng menu
  // Sản phẩm: chỉ active khi path là /products và không có category thuộc Nam/Nữ/Phụ kiện
  const isProductsPage =
    location.pathname === "/products" &&
    ![
      ...CATEGORY_MENU.NAM_IDS,
      ...CATEGORY_MENU.NU_IDS,
      ...CATEGORY_MENU.PHU_KIEN,
    ].includes(Number(categoryParam));

  // Nam: active khi category thuộc NAM_IDS
  const isNamActive = CATEGORY_MENU.NAM_IDS.includes(Number(categoryParam));
  // Nữ: active khi category thuộc NU_IDS
  const isNuActive = CATEGORY_MENU.NU_IDS.includes(Number(categoryParam));
  // Phụ kiện: active khi category là PHU_KIEN, PHU_KIEN_KINH, PHU_KIEN_MU
  const isPhuKienActive = [
    ...CATEGORY_MENU.PHU_KIEN,
    CATEGORY_MENU.PHU_KIEN_KINH,
    CATEGORY_MENU.PHU_KIEN_MU,
  ].includes(Number(categoryParam));
=======
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
>>>>>>> origin/ThanhTung_profile_home_auth

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

<<<<<<< HEAD
  const goToCart = () => {
    navigate("/cart");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [showMegaMenuNam, setShowMegaMenuNam] = useState(false);
  const [showMegaMenuNu, setShowMegaMenuNu] = useState(false);
  const [showMegaMenuPhuKien, setShowMegaMenuPhuKien] = useState(false);
  const hideMenuNamTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideMenuNuTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideMenuPhuKienTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const iconGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSearch) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        iconGroupRef.current &&
        !iconGroupRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  const handleMouseEnterNam = () => {
    if (hideMenuNamTimeout.current) clearTimeout(hideMenuNamTimeout.current);
    setShowMegaMenuNam(true);
  };
  const handleMouseLeaveNam = () => {
    hideMenuNamTimeout.current = setTimeout(() => {
      setShowMegaMenuNam(false);
    }, 150);
  };
  const handleMouseEnterNu = () => {
    if (hideMenuNuTimeout.current) clearTimeout(hideMenuNuTimeout.current);
    setShowMegaMenuNu(true);
  };
  const handleMouseLeaveNu = () => {
    hideMenuNuTimeout.current = setTimeout(() => {
      setShowMegaMenuNu(false);
    }, 150);
  };
  const handleMouseEnterPhuKien = () => {
    if (hideMenuPhuKienTimeout.current)
      clearTimeout(hideMenuPhuKienTimeout.current);
    setShowMegaMenuPhuKien(true);
  };
  const handleMouseLeavePhuKien = () => {
    hideMenuPhuKienTimeout.current = setTimeout(() => {
      setShowMegaMenuPhuKien(false);
    }, 150);
  };

=======
>>>>>>> origin/ThanhTung_profile_home_auth
  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => {
          navigate("/");
          setMenuOpen(false);
        }}
      >
        <span className="logo-text">
          Stride<span className="logo-x">X</span>
        </span>
      </div>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
      )}

      <ul className={`menu-links${menuOpen ? " active" : ""}`} id="navLinks">
        <li>
<<<<<<< HEAD
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
            onClick={() => setMenuOpen(false)}
          >
=======
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
>>>>>>> origin/ThanhTung_profile_home_auth
            Trang chủ
          </NavLink>
        </li>
        <li>
<<<<<<< HEAD
          {/* <button
            className={(isProductsPage ? "active " : "") + "nav-btn-product"}
            onClick={() => {
              navigate("/products");
              setMenuOpen(false);
=======
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
>>>>>>> origin/ThanhTung_profile_home_auth
            }}
          >
            Sản phẩm
          </button> */}
        </li>
<<<<<<< HEAD
        {MENU.map((menu) => (
          <li className="dropdown" key={menu.label}>
            <div
              className="dropdown-wrapper"
              onMouseEnter={
                menu.label === "Nam"
                  ? handleMouseEnterNam
                  : menu.label === "Nữ"
                    ? handleMouseEnterNu
                    : menu.label === "Phụ kiện"
                      ? handleMouseEnterPhuKien
                      : undefined
              }
              onMouseLeave={
                menu.label === "Nam"
                  ? handleMouseLeaveNam
                  : menu.label === "Nữ"
                    ? handleMouseLeaveNu
                    : menu.label === "Phụ kiện"
                      ? handleMouseLeavePhuKien
                      : undefined
              }
              style={{ position: "relative" }}
            >
=======
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
>>>>>>> origin/ThanhTung_profile_home_auth
              <button
                className={
                  menu.label === "Nam"
                    ? isNamActive
                      ? "active"
                      : ""
                    : menu.label === "Nữ"
                      ? isNuActive
                        ? "active"
                        : ""
                      : menu.label === "Phụ kiện"
                        ? isPhuKienActive
                          ? "active"
                          : ""
                        : ""
                }
              >
                {menu.label}
              </button>
              {menu.label === "Nam" && showMegaMenuNam && (
                <MegaMenu menuData={MEGA_MENU_NAM} />
              )}
              {menu.label === "Nữ" && showMegaMenuNu && (
                <MegaMenu menuData={MEGA_MENU_NU} />
              )}
              {menu.label === "Phụ kiện" && showMegaMenuPhuKien && (
                <MegaMenu menuData={MEGA_MENU_PHUKIEN} />
              )}
            </div>
          </li>
        ))}
        <li>
<<<<<<< HEAD
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Liên hệ
=======
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            Đơn hàng
>>>>>>> origin/ThanhTung_profile_home_auth
          </NavLink>
        </li>
      </ul>

<<<<<<< HEAD
      <div className="icon-group" ref={iconGroupRef}>
        {showSearch && <SearchBar onSearch={handleSearch} autoFocus />}
        <button
          className="searchbar-icon"
          aria-label="Tìm kiếm"
          type="button"
          onClick={() => setShowSearch((prev) => !prev)}
        >
          <span role="img" aria-label="search" style={{ fontSize: 20 }}>
            🔍
          </span>
        </button>
        <div
          className="icon-btn icon-favorite-navbar"
          title="Yêu thích"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/wishlist");
            setMenuOpen(false);
          }}
        >
          <i className="far fa-heart"></i>
        </div>
        <div
          className="icon-btn"
          title="Giỏ hàng"
          onClick={() => {
            goToCart();
            setMenuOpen(false);
          }}
          style={{ cursor: "pointer" }}
        >
          &#128722;
        </div>
        <div
          className="icon-btn"
          title="Tài khoản"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/register");
            setMenuOpen(false);
          }}
        >
          &#128100;
        </div>
      </div>

      <div
        className="menu-toggle"
        id="menuToggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        &#9776;
=======
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
>>>>>>> origin/ThanhTung_profile_home_auth
      </div>
    </nav>
  );
};

export default Navbar;
