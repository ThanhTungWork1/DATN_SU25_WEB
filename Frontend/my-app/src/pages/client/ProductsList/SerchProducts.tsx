export const SerchProducts = () => {
  return (
    <>
      <div className="row mb-3">
        <div className="search-wrapper d-flex">
          <button
            className="btn btn-outline-secondary me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasFilter"
          >
            Bộ lọc
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
      </div>
    </>
  );
};
