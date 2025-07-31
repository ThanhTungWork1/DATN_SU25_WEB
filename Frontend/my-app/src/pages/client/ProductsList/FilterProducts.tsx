import type { ProductFilter } from "../../../types/ProductFilterType";
import Color from "../../../components/Color";

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
        newFilter.min_price = min;
        newFilter.max_price = max;
      } else {
        delete newFilter.min_price;
        delete newFilter.max_price;
      }
      delete newFilter.priceRange;
    } else {
      newFilter[key] = value;
    }
    setFilter(newFilter);
  };

  const toggleArray = <T,>(key: keyof ProductFilter, value: T) => {
    const arr = (filter[key] as T[]) || [];
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    handleChange(key as string, newArr);
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
        {loadingCategories ? (
          <div>Đang tải danh mục...</div>
        ) : (
          <>
            {/* Danh mục */}
            <div className="filter-group">
              <strong>Danh mục</strong>
              <br />
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  style={{ display: "block", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={filter.category_id === cat.id}
                    onChange={() =>
                      filter.category_id === cat.id
                        ? handleChange("categories", [])
                        : handleChange("categories", [cat.id])
                    }
                    style={{ marginRight: 4 }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </>
        )}

        {loadingColors ? (
          <div>Đang tải màu sắc...</div>
        ) : (
          <>
            {/* Giá tiền */}
            <div className="filter-group mb-2">
              <strong>Giá tiền</strong>
              <div>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="price"
                    checked={!filter.min_price && !filter.max_price}
                    onChange={() => handleChange("priceRange", undefined)}
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
                      checked={
                        filter.min_price + "-" + filter.max_price === range
                      }
                      onChange={() => handleChange("priceRange", range)}
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
              <Color
                colors={colors}
                selectedColor={
                  colors.find((c) => c.id === filter.color_id) || null
                }
                onSelectColor={(color) =>
                  filter.color_id === color.id
                    ? handleChange("colors", [])
                    : handleChange("colors", [color.id])
                }
              />
            </div>
          </>
        )}

        {loadingSizes ? (
          <div>Đang tải size...</div>
        ) : (
          <>
            {/* Kích cỡ */}
            <div className="filter-group">
              <strong>Kích cỡ</strong>
              <br />
              {sizes.map((size) => (
                <label
                  key={size.id}
                  style={{ display: "block", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={filter.size_id === size.id}
                    onChange={() =>
                      filter.size_id === size.id
                        ? handleChange("sizes", [])
                        : handleChange("sizes", [size.id])
                    }
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
                <label
                  key={material}
                  style={{ display: "block", cursor: "pointer" }}
                >
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
          </>
        )}

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
