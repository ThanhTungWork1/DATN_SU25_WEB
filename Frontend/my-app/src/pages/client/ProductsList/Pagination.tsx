type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null; // Không cần phân trang nếu chỉ có 1 trang

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Hiển thị tối đa 5 trang: [1] ... [4][5][6] ... [10]
  const generatePages = () => {
    const pages = [];
    const range = 2; // số trang ở 2 bên currentPage
    const minPage = Math.max(1, currentPage - range);
    const maxPage = Math.min(totalPages, currentPage + range);

    if (minPage > 1) pages.push(1);
    if (minPage > 2) pages.push("...");

    for (let i = minPage; i <= maxPage; i++) {
      pages.push(i);
    }

    if (maxPage < totalPages - 1) pages.push("...");
    if (maxPage < totalPages) pages.push(totalPages);

    return pages;
  };

  const pages = generatePages();

  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>

        {pages.map((page, index) => (
          <li
            key={index}
            className={`page-item ${
              page === currentPage ? "active" : ""
            } ${page === "..." ? "disabled" : ""}`}
          >
            {page === "..." ? (
              <span className="page-link">...</span>
            ) : (
              <button
                className="page-link"
                onClick={() => handlePageClick(page as number)}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};
