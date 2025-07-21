import React, { useRef, useState, useEffect } from "react";
import { validateSearchQuery } from "../validation/searchValidation";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, autoFocus }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input khi mở
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Không làm gì, vì showSearch sẽ được quản lý ở Navbar
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng khi nhấn ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Không làm gì, vì showSearch sẽ được quản lý ở Navbar
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD

=======
>>>>>>> origin/ThanhTung_profile_home_auth
    if (onSearch && validateSearchQuery(query)) {
      onSearch(query);
    }
  };

<<<<<<< HEAD
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === "") {
      // Nếu đang ở trang search thì điều hướng về trang trước hoặc /products
      if (window.location.pathname === "/search") {
        window.history.length > 1 ? window.history.back() : window.location.assign("/products");
=======
  const handleIconClick = () => {
    if (!open) {
      setOpen(true);
    } else if (validateSearchQuery(query)) {
      if (onSearch) {
        onSearch(query);
>>>>>>> origin/ThanhTung_profile_home_auth
      }
    }
  };

  return (
    <div
      className={`searchbar-container custom-searchbar`}
      ref={containerRef}
    >
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="searchbar-input"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleChange}
          style={{
            width: 180,
            opacity: 1,
            padding: "0 12px",
            transition: "all 0.3s",
            borderRadius: 24,
            border: "none",
            outline: "none",
            background: "#fff"
          }}
        />
      </form>
    </div>
  );
};

export default SearchBar;