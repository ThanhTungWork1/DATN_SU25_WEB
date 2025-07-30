import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";
import MegaMenu from "./MegaMenu";
import useCurrentUser from "../hook/useCurrentUser";
import { CATEGORY_MENU } from "../utils/categoryMenu";
import {
  MEGA_MENU_NAM,
  MEGA_MENU_NU,
  MEGA_MENU_PHUKIEN,
} from "./megaMenuData";

import "../assets/styles/navbar.css";
import "../assets/styles/menu.css";

const MENU = [{ label: "Nam" }, { label: "Nữ" }, { label: "Phụ kiện" }];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");

  const { data: user, isLoading } = useCurrentUser();

  const isProductsPage =
    location.pathname === "/products" &&
    ![
      ...CATEGORY_MENU.NAM_IDS,
      ...CATEGORY_MENU.NU_IDS,
      ...CATEGORY_MENU.PHU_KIEN,
    ].includes(Number(categoryParam));

  const isNamActive = CATEGORY_MENU.NAM_IDS.includes(Number(categoryParam));
  const isNuActive = CATEGORY_MENU.NU_IDS.includes(Number(categoryParam));
  const isPhuKienActive = [
    ...CATEGORY_MENU.PHU_KIEN,
    CATEGORY_MENU.PHU_KIEN_KINH,
    CATEGORY_MENU.PHU_KIEN_MU,
  ].includes(Number(categoryParam));

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

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
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
            onClick={() => setMenuOpen(false)}
          >
            Trang chủ
          </NavLink>
        </li>

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
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            Liên hệ
          </NavLink>
        </li>
      </ul>

      <div className="icon-group" ref={iconGroupRef}>
        {showSearch && <SearchBar onSearch={handleSearch} autoFocus />}

        <button
          className="searchbar-icon"
          aria-label="Tìm kiếm"
          type="button"
          onClick={() => setShowSearch((prev) => !prev)}
        >
          🔍
        </button>

        <div
          className="icon-btn icon-favorite-navbar"
          title="Yêu thích"
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
            navigate("/cart")
            setMenuOpen(false);
          }}
        >
          🛒
        </div>

        {isLoading ? (
          <div className="icon-btn" style={{ cursor: "wait" }}>
            Đang tải...
          </div>
        ) : user ? (
          <div
            className="icon-btn"
            title="Đăng xuất"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
              window.location.reload();
            }}
          >
            👤 {user.name}  
          </div>
        ) : (
          <div
            className="icon-btn"
            title="Tài khoản"
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
          >
            👤
          </div>
        )}

        <div
          className="menu-toggle"
          id="menuToggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
