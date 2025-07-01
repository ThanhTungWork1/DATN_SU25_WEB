<<<<<<< HEAD
import type { ProductFilter } from "../../../types/ProductFilterType";
/**
 * Bộ lọc sản phẩm (lọc theo tên, giá, màu, size, chất liệu)
 */
export const FilteProducts = ({
  filter,
  setFilter,
  onApply,
  onClear,
  categories,
  colors,
  sizes,
}: {
  filter: ProductFilter;
  setFilter: (f: ProductFilter) => void;
  onApply: () => void;
  onClear: () => void;
  categories: { id: number; name: string }[];
  colors: { id: number; name: string; code: string }[];
  sizes: { id: number; name: string }[];
}) => {
  // Chọn màu theo id
  const toggleColor = (colorId: number) => {
    setFilter({
      ...filter,
      colors: filter.colors?.includes(colorId)
        ? filter.colors.filter((c) => c !== colorId)
        : [...(filter.colors || []), colorId],
    });
  };
  // Chọn size theo id
  const toggleSize = (sizeId: number) => {
    setFilter({
      ...filter,
      sizes: filter.sizes?.includes(sizeId)
        ? filter.sizes.filter((s) => s !== sizeId)
        : [...(filter.sizes || []), sizeId],
    });
  };
  // Chọn chất liệu (vẫn là string)
  const materialList = [
    "Cotton",
    "Polyester",
    "Plastic",
    "Spandex",
    "Fleece",
  ];
  const toggleMaterial = (material: string) => {
    setFilter({
      ...filter,
      materials: filter.materials?.includes(material)
        ? filter.materials.filter((m) => m !== material)
        : [...(filter.materials || []), material],
    });
  };
  // Chọn danh mục theo id
  const toggleCategory = (catId: number) => {
    setFilter({
      ...filter,
      categories: filter.categories?.includes(catId)
        ? filter.categories.filter((c) => c !== catId)
        : [...(filter.categories || []), catId],
    });
  };

=======
export const FilteProducts = () => {
>>>>>>> a8244187 (giao dien list sp)
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
<<<<<<< HEAD
        {/* Tên sản phẩm - Đặt lên trên cùng */}
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
            <label
              key={cat.id}
              style={{ cursor: "pointer", display: "block", marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={filter.categories?.includes(cat.id) || false}
                onChange={() => toggleCategory(cat.id)}
                style={{ marginRight: 4 }}
              />{" "}
              {cat.name}
            </label>
          ))}
        </div>
        {/* Giá tiền */}
        <div className="filter-group mb-2">
          <strong>Giá tiền</strong>
          <div>
            <label style={{ cursor: "pointer", marginBottom: 0 }}>
              <input
                type="radio"
                name="price"
                checked={!filter.priceRange}
                onChange={() => setFilter({ ...filter, priceRange: undefined })}
                style={{ marginRight: 4 }}
              />{" "}
              Tất cả
            </label>
          </div>
          <div>
            <label style={{ cursor: "pointer", marginBottom: 0 }}>
              <input
                type="radio"
                name="price"
                checked={filter.priceRange === "9-99"}
                onChange={() => setFilter({ ...filter, priceRange: "9-99" })}
                style={{ marginRight: 4 }}
              />{" "}
              9k - 99k
            </label>
          </div>
          <div>
            <label style={{ cursor: "pointer", marginBottom: 0 }}>
              <input
                type="radio"
                name="price"
                checked={filter.priceRange === "99-499"}
                onChange={() => setFilter({ ...filter, priceRange: "99-499" })}
                style={{ marginRight: 4 }}
              />{" "}
              99k - 499k
            </label>
          </div>
          <div>
            <label style={{ cursor: "pointer", marginBottom: 0 }}>
              <input
                type="radio"
                name="price"
                checked={filter.priceRange === "499-999"}
                onChange={() => setFilter({ ...filter, priceRange: "499-999" })}
                style={{ marginRight: 4 }}
              />{" "}
              499k - 999k
            </label>
          </div>
        </div>
        {/* Màu sắc */}
        <div className="filter-group mb-2">
          <strong>Màu:</strong>
          <div className="d-flex gap-3 flex-wrap mt-1">
            {colors.map((color) => (
              <label
                key={color.id}
                style={{ cursor: "pointer", marginBottom: 0 }}
              >
                <input
                  type="checkbox"
                  checked={filter.colors?.includes(color.id) || false}
                  onChange={() => toggleColor(color.id)}
                  style={{ display: "none" }}
                />
                <span
                  className="color-circle"
                  style={{ backgroundColor: color.code }}
                  title={color.name}
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
            <label
              key={size.id}
              style={{ cursor: "pointer", display: "block", marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={filter.sizes?.includes(size.id) || false}
                onChange={() => toggleSize(size.id)}
                style={{ marginRight: 4 }}
              />{" "}
              {size.name}
            </label>
          ))}
        </div>
        {/* Chất liệu */}
        <div className="filter-group">
          <strong>Chất liệu</strong>
          <br />
          {materialList.map((material) => (
            <label
              key={material}
              style={{ cursor: "pointer", display: "block", marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={filter.materials?.includes(material) || false}
                onChange={() => toggleMaterial(material)}
                style={{ marginRight: 4 }}
              />{" "}
              {material}
            </label>
          ))}
        </div>
        {/* Nút Lọc và Xóa */}
        <div className="filter-buttons d-flex justify-content-between mt-3">
          <button className="btn btn-filter" onClick={onApply}>
            Lọc sản phẩm
          </button>
          <button className="btn btn-clear" onClick={onClear}>
            Xóa sản phẩm
          </button>
=======
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
>>>>>>> a8244187 (giao dien list sp)
        </div>
      </div>
    </>
  );
};
