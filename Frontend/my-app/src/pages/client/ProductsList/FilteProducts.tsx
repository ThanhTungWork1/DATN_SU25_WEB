import type { ProductFilter } from "../../../types/ProductFilterType";

type Props = {
  filter: ProductFilter;
  setFilter: (f: ProductFilter) => void;
  onApply: () => void;
  onClear: () => void;
  categories: { id: number; name: string }[];
  colors: { id: number; name: string; code: string }[];
  sizes: { id: number; name: string }[];
};

export const FilteProducts = ({
  filter,
  setFilter,
  onApply,
  onClear,
  categories,
  colors,
  sizes,
}: Props) => {
  const materialList = [
    "Cotton",
    "Polyester",
    "Plastic",
    "Spandex",
    "Fleece",
  ];

  const toggleArray = <T,>(key: keyof ProductFilter, value: T) => {
    setFilter({
      ...filter,
      [key]: (filter[key] as T[])?.includes(value)
        ? (filter[key] as T[]).filter((v) => v !== value)
        : [...((filter[key] as T[]) || []), value],
    });
  };

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
        {/* Tên sản phẩm */}
        <div className="filter-group mb-2">
          <strong>Tên sản phẩm</strong>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="Nhập tên sản phẩm..."
            value={filter.name || ""}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
        </div>

        {/* Danh mục */}
        <div className="filter-group">
          <strong>Danh mục</strong>
          <br />
          {categories.map((cat) => (
            <label key={cat.id} style={{ display: "block", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filter.categories?.includes(cat.id) || false}
                onChange={() => toggleArray("categories", cat.id)}
                style={{ marginRight: 4 }}
              />
              {cat.name}
            </label>
          ))}
        </div>

        {/* Giá tiền */}
        <div className="filter-group mb-2">
          <strong>Giá tiền</strong>
          <div>
            <label style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="price"
                checked={!filter.priceRange}
                onChange={() =>
                  setFilter({ ...filter, priceRange: undefined })
                }
                style={{ marginRight: 4 }}
              />
              Tất cả
            </label>
          </div>
          {["9-99", "99-499", "499-999"].map((range) => (
            <div key={range}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="price"
                  checked={filter.priceRange === range}
                  onChange={() =>
                    setFilter({ ...filter, priceRange: range })
                  }
                  style={{ marginRight: 4 }}
                />
                {range.replace("-", "k - ")}k
              </label>
            </div>
          ))}
        </div>

        {/* Màu sắc */}
        <div className="filter-group mb-2">
          <strong>Màu sắc</strong>
          <div className="d-flex gap-3 flex-wrap mt-1">
            {colors.map((color) => (
              <label key={color.id} style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filter.colors?.includes(color.id) || false}
                  onChange={() => toggleArray("colors", color.id)}
                  style={{ display: "none" }}
                />
                <span
                  className="color-circle"
                  title={color.name}
                  style={{
                    backgroundColor: color.code,
                    border: "1px solid #ccc",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                ></span>
              </label>
            ))}
          </div>
        </div>

        {/* Kích cỡ */}
        <div className="filter-group">
          <strong>Kích cỡ</strong>
          <br />
          {sizes.map((size) => (
            <label key={size.id} style={{ display: "block", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filter.sizes?.includes(size.id) || false}
                onChange={() => toggleArray("sizes", size.id)}
                style={{ marginRight: 4 }}
              />
              {size.name}
            </label>
          ))}
        </div>

        {/* Chất liệu */}
        <div className="filter-group">
          <strong>Chất liệu</strong>
          <br />
          {materialList.map((material) => (
            <label key={material} style={{ display: "block", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filter.materials?.includes(material) || false}
                onChange={() => toggleArray("materials", material)}
                style={{ marginRight: 4 }}
              />
              {material}
            </label>
          ))}
        </div>

        {/* Nút thao tác */}
        <div className="filter-buttons d-flex justify-content-between mt-3">
          <button className="btn btn-filter" onClick={onApply}>
            Lọc sản phẩm
          </button>
          <button className="btn btn-clear" onClick={onClear}>
            Xóa sản phẩm
          </button>
        </div>
      </div>
    </>
  );
};
