import React, { useRef, useState, useEffect, useCallback } from "react";
import { validateSearchQuery } from "../validation/searchValidation";
import { config } from "../api/axios";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

// Helpers to normalize search query (no new file, embedded here)
function removeDiacritics(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeQuery(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const lower = trimmed.toLowerCase();
  const unaccent = removeDiacritics(lower);
  // keep letters, digits and spaces only
  return unaccent.replace(/[^a-z0-9\s]/g, "");
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, autoFocus }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
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

    if (onSearch && validateSearchQuery(query)) {
      const q = normalizeQuery(query);
      onSearch(q);
    }
  };

  // Debounced search suggestions
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchTerm.length >= 2) {
            try {
              setLoading(true);
              const response = await config.get("/product/search/suggestions", {
                params: { q: searchTerm },
              });
              setSuggestions(response.data.suggestions || []);
              setShowSuggestions(true);
            } catch (error) {
              console.error("Error fetching suggestions:", error);
              setSuggestions([]);
            } finally {
              setLoading(false);
            }
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }, 300);
      };
    })(),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Get suggestions
    debouncedSearch(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      // Nếu đang ở trang search thì điều hướng về trang trước hoặc /products
      if (window.location.pathname === "/search") {
        window.history.length > 1
          ? window.history.back()
          : window.location.assign("/products");
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);

    if (suggestion.type === "product") {
      window.location.href = suggestion.url;
    } else if (suggestion.type === "category") {
      window.location.href = suggestion.url;
    } else if (suggestion.type === "popular") {
      window.location.href = suggestion.url;
    }
  };

  return (
    <div className={`searchbar-container custom-searchbar`} ref={containerRef}>
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
            background: "#fff",
          }}
        />
        {loading && (
          <div
            className="search-loading"
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            ⏳
          </div>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="search-suggestions"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom:
                  index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color:
                    suggestion.type === "product"
                      ? "#007bff"
                      : suggestion.type === "category"
                        ? "#28a745"
                        : "#ffc107",
                }}
              >
                {suggestion.type === "product"
                  ? "🛍️"
                  : suggestion.type === "category"
                    ? "📁"
                    : "🔥"}
              </span>
              <span style={{ flex: 1, fontSize: "14px", color: "#222222" }}>
                {suggestion.text}
              </span>
              <span style={{ fontSize: "12px", color: "#6c757d" }}>
                {suggestion.type === "product"
                  ? "Sản phẩm"
                  : suggestion.type === "category"
                    ? "Danh mục"
                    : "Phổ biến"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
