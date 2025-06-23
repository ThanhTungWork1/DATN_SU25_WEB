<<<<<<< HEAD
import React, { useRef, useState, useEffect } from "react";
import "../assets/styles/SearchBar.css";
import { validateSearchQuery } from "../validation/searchValidation";
=======
import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/SearchBar.css';
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
<<<<<<< HEAD
  const [query, setQuery] = useState("");
=======
  const [query, setQuery] = useState('');
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input khi mở
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
<<<<<<< HEAD
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
=======
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
    };
  }, [open]);

  // Đóng khi nhấn ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
<<<<<<< HEAD
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
=======
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (onSearch && validateSearchQuery(query)) onSearch(query);
=======
    if (onSearch && query.trim()) onSearch(query);
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
    // Không đóng input ở đây
  };

  const handleIconClick = () => {
    if (!open) {
      setOpen(true);
<<<<<<< HEAD
    } else if (validateSearchQuery(query)) {
=======
    } else if (query.trim()) {
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
      if (onSearch) onSearch(query);
      // Không đóng input, chỉ tìm kiếm
    }
  };

  return (
<<<<<<< HEAD
    <div
      className={`searchbar-container${open ? " open" : ""}`}
      ref={containerRef}
    >
=======
    <div className={`searchbar-container${open ? ' open' : ''}`} ref={containerRef}>
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
      <button
        className="searchbar-icon"
        aria-label="Tìm kiếm"
        type="button"
        onClick={handleIconClick}
      >
<<<<<<< HEAD
        <span role="img" aria-label="search">
          🔍
        </span>
=======
        <span role="img" aria-label="search">🔍</span>
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
      </button>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="searchbar-input"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  );
};

<<<<<<< HEAD
export default SearchBar;
=======
export default SearchBar; 
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
