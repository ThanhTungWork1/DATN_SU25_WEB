export const Pagination = () => {
  return (
    <>
      {/* Phân trang */}
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <a className="page-link" href="#">
              «
            </a>
          </li>
          <li className="page-item active">
            <a className="page-link" href="#">
              1
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              »
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};
