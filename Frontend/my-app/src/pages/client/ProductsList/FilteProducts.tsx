export const FilteProducts = () => {
  return (
    <>
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Bộ lọc</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="filter-group">
          <strong>Danh mục</strong>
          <br />
          <div>
            <input type="checkbox" /> Áo
          </div>
          <div>
            <input type="checkbox" /> Quần
          </div>
          <div>
            <input type="checkbox" /> Giày
          </div>
          <div>
            <input type="checkbox" /> Phụ kiện
          </div>
        </div>
        <div className="filter-group">
          <strong>Giá tiền</strong>
          <br />
          <div>
            <input type="checkbox" /> 9k - 99k
          </div>
          <div>
            <input type="checkbox" /> 99k - 499k
          </div>
          <div>
            <input type="checkbox" /> 499k - 999k
          </div>
        </div>
        <div className="filter-group">
          <strong>Màu sắc</strong>
          <br />
          <div className="d-flex gap-2 mb-2">
            <div className="color-circle bg-dark"></div>
            <div className="color-circle bg-light border"></div>
            <div className="color-circle bg-secondary"></div>
            <div className="color-circle bg-danger"></div>
          </div>
          <div className="d-flex gap-2">
            <div className="color-circle bg-primary"></div>
            <div className="color-circle" style={{ backgroundColor: "#39FF14" }}></div>
            <div className="color-circle" style={{ backgroundColor: "#FF6B00" }}></div>
            <div className="color-circle" style={{ backgroundColor: "#A8E6CF" }}></div>
          </div>
        </div>
        <div className="filter-group">
          <strong>Kích cỡ</strong>
          <br />
          <div>
            <input type="checkbox" /> S
          </div>
          <div>
            <input type="checkbox" /> M
          </div>
          <div>
            <input type="checkbox" /> L
          </div>
          <div>
            <input type="checkbox" /> XL
          </div>
          <div>
            <input type="checkbox" /> XXL
          </div>
          <div>
            <input type="checkbox" /> 2XXL
          </div>
        </div>
        <div className="filter-group">
  <strong>Chất liệu</strong>
  <br />
  <div>
    <input type="checkbox" /> Cotton
  </div>
  <div>
    <input type="checkbox" /> Polyester
  </div>
  <div>
    <input type="checkbox" /> Spandex (Elastane)
  </div>
  <div>
    <input type="checkbox" /> Nylon
  </div>
  <div>
    <input type="checkbox" /> Spandex
  </div>
  <div>
    <input type="checkbox" /> Nỉ thể thao (Fleece)
  </div>
</div>
        {/* Nút Lọc và Xóa */}
        <div className="filter-buttons d-flex justify-content-between mt-3">
          <button className="btn btn-filter">Lọc sản phẩm</button>
          <button className="btn btn-clear">Xóa sản phẩm</button>
        </div>
      </div>
    </>
  );
};
