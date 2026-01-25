import React from "react";
import "../../../components/Pagination.css";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 12,
}: Props) => {
  if (totalPages <= 1) return null;

  // Tính toán range hiển thị
  const getPageNumbers = () => {
    const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // Tính toán thông tin hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-wrapper">
      {/* Nút Previous */}
      <button
        className={`pagination-btn pagination-prev ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        <svg
          className="pagination-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="pagination-text">Trước</span>
      </button>

      {/* Số trang */}
      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="pagination-dots">...</span>
            ) : (
              <button
                className={`pagination-btn pagination-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => onPageChange(page as number)}
                aria-label={`Trang ${page}`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Nút Next */}
      <button
        className={`pagination-btn pagination-next ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        <span className="pagination-text">Sau</span>
        <svg
          className="pagination-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Quick jump */}
      {totalPages > 10 && (
        <div className="pagination-jump">
          <span className="pagination-text">Đi đến trang:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            className="pagination-input"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement;
                const page = parseInt(target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                  target.value = "";
                }
              }
            }}
            placeholder={`1-${totalPages}`}
          />
        </div>
      )}
    </div>
  );
};
