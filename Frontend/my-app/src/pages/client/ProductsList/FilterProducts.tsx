import type { ProductFilter } from "../../../types/ProductFilterType";
import Color from "../../../components/Color";
import "../../../assets/styles/filter-effects.css";
import { useState } from "react";

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

  // Cấu trúc menu danh mục
  const categoryMenu = {
    Nam: {
      Áo: [
        "Áo thun nam",
        "Áo tanktop nam",
        "Áo sơ mi nam",
        "Áo polo nam",
        "Áo thể thao nam",
      ],
      Quần: [
        "Quần jeans nam",
        "Quần short nam",
        "Quần thể thao nam",
        "Quần dài nam",
        "Quần jogger nam",
      ],
    },
    Nữ: {
      Áo: [
        "Áo thun nữ",
        "Áo sơ mi nữ",
        "Áo Croptop nữ",
        "Áo polo nữ",
        "Áo Tanktop nữ",
      ],
      Quần: [
        "Quần legging nữ",
        "Quần jeans nữ",
        "Quần short nữ",
        "Quần jogger nữ",
        "Váy đầm thể thao nữ",
      ],
    },
    "Phụ kiện": {
      "Phụ kiện khác": ["Mũ nón", "Tất vớ", "Túi xách", "Thắt lưng"],
    },
  };

  // State để quản lý menu mở/đóng
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedSubMenus, setExpandedSubMenus] = useState<{
    [key: string]: boolean;
  }>({});

  // Toggle menu chính
  const toggleMainMenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Toggle sub menu
  const toggleSubMenu = (subMenuKey: string) => {
    setExpandedSubMenus((prev) => ({
      ...prev,
      [subMenuKey]: !prev[subMenuKey],
    }));
  };

  // Lưu filter history
  const saveFilterHistory = (filters: any) => {
    try {
      const history = JSON.parse(
        localStorage.getItem("filter_history") || "[]"
      );
      const newHistory = [
        filters,
        ...history.filter(
          (h: any) => JSON.stringify(h) !== JSON.stringify(filters)
        ),
      ].slice(0, 5); // Giữ tối đa 5 filter gần nhất
      localStorage.setItem("filter_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving filter history:", error);
    }
  };

  // Lấy filter history
  const getFilterHistory = () => {
    try {
      return JSON.parse(localStorage.getItem("filter_history") || "[]");
    } catch (error) {
      console.error("Error getting filter history:", error);
      return [];
    }
  };

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
            {/* Danh mục - Menu phân cấp */}
            <div className="filter-section">
              <div className="filter-section-title">📁 Danh mục</div>
              {Object.entries(categoryMenu).map(
                ([mainCategory, subCategories]) => (
                  <div key={mainCategory} className="category-menu-item">
                    {/* Menu chính */}
                    <div
                      className="category-main-menu"
                      onClick={() => toggleMainMenu(mainCategory)}
                    >
                      <span className="category-icon">
                        {expandedMenus[mainCategory] ? "📂" : "📁"}
                      </span>
                      <span className="category-name">{mainCategory}</span>
                      <span className="category-arrow">
                        {expandedMenus[mainCategory] ? "▼" : "▶"}
                      </span>
                    </div>

                    {/* Sub menu */}
                    {expandedMenus[mainCategory] && (
                      <div className="category-sub-menu">
                        {Object.entries(subCategories).map(
                          ([subCategory, items]) => (
                            <div key={subCategory} className="sub-menu-item">
                              {/* Sub menu header */}
                              <div
                                className="sub-menu-header"
                                onClick={() =>
                                  toggleSubMenu(
                                    `${mainCategory}-${subCategory}`
                                  )
                                }
                              >
                                <span className="sub-category-icon">
                                  {expandedSubMenus[
                                    `${mainCategory}-${subCategory}`
                                  ]
                                    ? "📂"
                                    : "📁"}
                                </span>
                                <span className="sub-category-name">
                                  {subCategory}
                                </span>
                                <span className="sub-category-arrow">
                                  {expandedSubMenus[
                                    `${mainCategory}-${subCategory}`
                                  ]
                                    ? "▼"
                                    : "▶"}
                                </span>
                              </div>

                              {/* Items trong sub menu */}
                              {expandedSubMenus[
                                `${mainCategory}-${subCategory}`
                              ] && (
                                <div className="sub-menu-items">
                                  {items.map((item) => {
                                    const category = categories.find(
                                      (cat) => cat.name === item
                                    );
                                    if (!category) return null;

                                    return (
                                      <div
                                        key={category.id}
                                        className="filter-checkbox sub-item"
                                      >
                                        <label>
                                          <input
                                            type="checkbox"
                                            checked={
                                              filter.category_id === category.id
                                            }
                                            onChange={() =>
                                              filter.category_id === category.id
                                                ? handleChange("categories", [])
                                                : handleChange("categories", [
                                                    category.id,
                                                  ])
                                            }
                                          />
                                          {category.name}
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
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

            {/* Quick Filter Presets */}
            <div className="filter-section">
              <div className="filter-section-title">⚡ Sắp xếp nhanh</div>
              <div className="filter-presets">
                <button
                  className={`preset-btn ${filter.preset === "new_arrivals" ? "active" : ""}`}
                  onClick={() => handleChange("preset", "new_arrivals")}
                >
                  🆕 Mới nhất
                </button>
                <button
                  className={`preset-btn ${filter.preset === "best_sellers" ? "active" : ""}`}
                  onClick={() => handleChange("preset", "best_sellers")}
                >
                  🔥 Bán chạy
                </button>
                <button
                  className={`preset-btn ${filter.preset === "price_low_to_high" ? "active" : ""}`}
                  onClick={() => handleChange("preset", "price_low_to_high")}
                >
                  💰 Giá tăng dần
                </button>
                <button
                  className={`preset-btn ${filter.preset === "price_high_to_low" ? "active" : ""}`}
                  onClick={() => handleChange("preset", "price_high_to_low")}
                >
                  💰 Giá giảm dần
                </button>
                <button
                  className={`preset-btn ${filter.preset === "name_a_to_z" ? "active" : ""}`}
                  onClick={() => handleChange("preset", "name_a_to_z")}
                >
                  📝 A → Z
                </button>
              </div>
            </div>
          </>
        )}

        {/* Filter History */}
        <div className="filter-section">
          <div className="filter-section-title">📚 Lịch sử bộ lọc</div>
          {getFilterHistory().length > 0 ? (
            <div className="filter-history">
              {getFilterHistory()
                .slice(0, 3)
                .map((historyFilter: any, index: number) => (
                  <button
                    key={index}
                    className="history-btn"
                    onClick={() => {
                      setFilter(historyFilter);
                      saveFilterHistory(historyFilter);
                    }}
                  >
                    🔄 {Object.keys(historyFilter).length} bộ lọc
                  </button>
                ))}
            </div>
          ) : (
            <div className="no-history">Chưa có lịch sử bộ lọc</div>
          )}
        </div>

        {/* Nút thao tác */}
        <div className="filter-section" style={{ borderBottom: "none" }}>
          <div className="d-flex justify-content-center gap-3">
            <button
              className="filter-button btn-filter"
              onClick={() => {
                saveFilterHistory(filter);
                onApply();
              }}
            >
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
