/**
 * Component phân trang chuẩn
 * @param currentPage Trang hiện tại
 * @param totalPages Tổng số trang
 * @param onPageChange Callback khi đổi trang
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  // Tạo mảng số trang để render
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Nếu chỉ có 1 trang thì không hiển thị phân trang
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item${page === currentPage ? " active" : ""}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li
          className={`page-item${currentPage === totalPages ? " disabled" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
};
