import React, { useRef, useState, useEffect } from "react";
import "../assets/styles/SearchBar.css";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Đóng khi nhấn ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) onSearch(query);
    // Không đóng input ở đây
  };

  const handleIconClick = () => {
    if (!open) {
      setOpen(true);
    } else if (query.trim()) {
      if (onSearch) onSearch(query);
      // Không đóng input, chỉ tìm kiếm
    }
  };

  return (
    <div
      className={`searchbar-container${open ? " open" : ""}`}
      ref={containerRef}
    >
      <button
        className="searchbar-icon"
        aria-label="Tìm kiếm"
        type="button"
        onClick={handleIconClick}
      >
        <span role="img" aria-label="search">
          🔍
        </span>
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

export default SearchBar;
