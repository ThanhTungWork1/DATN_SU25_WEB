import type { ProductFilter } from "../../../types/ProductFilterType";
import Color from "../../../components/Color";
import "../../../assets/styles/filter-effects.css";

type Props = {
  filter: any;
  setFilter: (f: any) => void;
  onApply: () => void;
  onClear: () => void;
  categories: { id: number; name: string }[];
  colors: { id: number; name: string; code: string }[];
  sizes: { id: number; name: string }[];
  loadingCategories: boolean;
  loadingColors: boolean;
  loadingSizes: boolean;
};

export const FilterProducts = ({
  filter,
  setFilter,
  onApply,
  onClear,
  categories,
  colors,
  sizes,
  loadingCategories,
  loadingColors,
  loadingSizes,
}: Props) => {
  const materialList = ["Cotton", "Polyester", "Plastic", "Spandex", "Fleece"];

  // Chuyển đổi filter FE sang filter BE
  const handleChange = (key: string, value: any) => {
    let newFilter = { ...filter };

    if (key === "categories") {
      newFilter.category_id = value.length > 0 ? value[0] : undefined;
      delete newFilter.categories;
    } else if (key === "colors") {
      newFilter.color_id = value.length > 0 ? value[0] : undefined;
      delete newFilter.colors;
    } else if (key === "sizes") {
      newFilter.size_id = value.length > 0 ? value[0] : undefined;
      delete newFilter.sizes;
    } else if (key === "priceRange") {
      if (value) {
        const [min, max] = value.split("-");
        // Chuyển đổi từ "9k" thành 9000 VND
        newFilter.min_price = parseInt(min) * 1000;
        newFilter.max_price = parseInt(max) * 1000;
      } else {
        delete newFilter.min_price;
        delete newFilter.max_price;
      }
      delete newFilter.priceRange;
    } else if (key === "materials") {
      newFilter.materials = value.length > 0 ? value.join(",") : undefined;
    } else {
      newFilter[key] = value;
    }

    setFilter(newFilter);
  };

  const toggleArray = <T,>(key: keyof ProductFilter, value: T) => {
    let arr: T[];

    if (key === "materials") {
      // Xử lý materials từ string thành array
      arr = (filter[key] ? filter[key].split(",") : []) as T[];
    } else {
      arr = (filter[key] as T[]) || [];
    }

    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];

    handleChange(key as string, newArr);
  };

  return (
    <>
      <div className="filter-header">
        <h5 className="filter-title">🏃 Bộ lọc sản phẩm</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas">
          ✕
        </button>
      </div>
      <div className="filter-container">
        {loadingCategories ? (
          <div className="filter-loading">Đang tải danh mục...</div>
        ) : (
          <>
            {/* Danh mục */}
            <div className="filter-section">
              <div className="filter-section-title">Danh mục</div>
              {categories.map((cat) => (
                <div key={cat.id} className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filter.category_id === cat.id}
                      onChange={() =>
                        filter.category_id === cat.id
                          ? handleChange("categories", [])
                          : handleChange("categories", [cat.id])
                      }
                    />
                    {cat.name}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {loadingColors ? (
          <div className="filter-loading">Đang tải màu sắc...</div>
        ) : (
          <>
            {/* Giá tiền */}
            <div className="filter-section">
              <div className="filter-section-title">💰 Giá tiền</div>
              <div className="filter-radio">
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={!filter.min_price && !filter.max_price}
                    onChange={() => handleChange("priceRange", undefined)}
                  />
                  Tất cả
                </label>
              </div>
              {["9-99", "99-499", "499-999"].map((range) => (
                <div key={range} className="filter-radio">
                  <label>
                    <input
                      type="radio"
                      name="price"
                      checked={
                        filter.min_price ===
                          parseInt(range.split("-")[0]) * 1000 &&
                        filter.max_price ===
                          parseInt(range.split("-")[1]) * 1000
                      }
                      onChange={() => handleChange("priceRange", range)}
                    />
                    {range.replace("-", "k - ")}k
                  </label>
                </div>
              ))}
            </div>

            {/* Màu sắc */}
            <div className="filter-section">
              <div className="filter-section-title">🎨 Màu sắc</div>
              <Color
                colors={colors}
                selectedColor={
                  colors.find((c) => c.id === filter.color_id) || null
                }
                onSelectColor={(color: { id: number }) =>
                  filter.color_id === color.id
                    ? handleChange("colors", [])
                    : handleChange("colors", [color.id])
                }
              />
            </div>
          </>
        )}

        {loadingSizes ? (
          <div className="filter-loading">Đang tải size...</div>
        ) : (
          <>
            {/* Kích cỡ */}
            <div className="filter-section">
              <div className="filter-section-title">📏 Kích cỡ</div>
              {sizes.map((size) => (
                <div key={size.id} className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filter.size_id === size.id}
                      onChange={() =>
                        filter.size_id === size.id
                          ? handleChange("sizes", [])
                          : handleChange("sizes", [size.id])
                      }
                    />
                    {size.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Chất liệu */}
            <div className="filter-section">
              <div className="filter-section-title">🧵 Chất liệu</div>
              {materialList.map((material) => (
                <div key={material} className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        filter.materials?.split(",").includes(material) || false
                      }
                      onChange={() => toggleArray("materials", material)}
                    />
                    {material}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Nút thao tác */}
        <div className="filter-section" style={{ borderBottom: "none" }}>
          <div className="d-flex justify-content-center gap-3">
            <button className="filter-button btn-filter" onClick={onApply}>
              ⚡ Lọc sản phẩm
            </button>
            <button className="filter-button btn-clear" onClick={onClear}>
              🗑️ Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
