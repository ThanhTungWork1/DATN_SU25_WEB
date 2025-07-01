import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Product } from "../types/ProductType";
import type { ProductFilter } from "../types/ProductFilterType";
import { filterProducts } from "../utils/productFilter";
import { CATEGORY_MENU } from "../utils/categoryMenu";

export function useProductFilter(products: Product[], PAGE_SIZE: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(
    null,
  );
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy categoryId và loại sản phẩm (áo/quần) từ db.json
  useEffect(() => {
    /**
     * Khi URL có query ?category=ID hoặc ?category=ID_ao,ID_quan
     * Tách biệt logic: catId là id danh mục, subType là loại sản phẩm (ao/quan)
     */
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      let catId = categoryParam;
      let subType = "";
      if (categoryParam.includes("_")) {
        [catId, subType] = categoryParam.split("_");
      }
      const categoryArr = catId.split(",").map(Number).filter(Boolean);
      setFilter((prev) => ({
        ...prev,
        categories: categoryArr,
        type: subType || undefined, // Lưu loại sản phẩm vào filter.type
      }));
    } else {
      setFilter((prev) => ({ ...prev, categories: [], type: undefined }));
    }
    
  }, [location.search]);

  // Tự động lọc lại khi filter thay đổi
  useEffect(() => {
    const hasFilter =
      (filter.categories && filter.categories.length > 0) ||
      filter.name ||
      filter.priceRange ||
      (filter.colors && filter.colors.length > 0) ||
      (filter.sizes && filter.sizes.length > 0) ||
      (filter.materials && filter.materials.length > 0);
    if (hasFilter) {
      applyFilter();
    } else {
      setFilteredProducts(null);
    }
    
  }, [
    filter.categories,
    filter.name,
    filter.priceRange,
    filter.colors,
    filter.sizes,
    filter.materials,
  ]);

  // Tự động lọc lại khi products thay đổi
  useEffect(() => {
    const hasFilter =
      (filter.categories && filter.categories.length > 0) ||
      filter.name ||
      filter.priceRange ||
      (filter.colors && filter.colors.length > 0) ||
      (filter.sizes && filter.sizes.length > 0) ||
      (filter.materials && filter.materials.length > 0);
    if (hasFilter) {
      applyFilter();
    }
    
  }, [products]);

  // Hàm lọc sản phẩm
  const applyFilter = () => {
    const hasFilter =
      (filter.categories && filter.categories.length > 0) ||
      filter.name ||
      filter.priceRange ||
      (filter.colors && filter.colors.length > 0) ||
      (filter.sizes && filter.sizes.length > 0) ||
      (filter.materials && filter.materials.length > 0);
    if (!hasFilter) {
      setFilteredProducts(null);
      setCurrentPage(1);
      return;
    }
    const result = filterProducts(products, filter);
    setFilteredProducts(result);
    setCurrentPage(1);
  };

  // Hàm xóa filter
  const clearFilter = () => {
    setFilter({});
    setFilteredProducts(null);
    setCurrentPage(1);
  };

  // Tính toán sản phẩm hiển thị và phân trang lại ở frontend nếu có filter
  const displayProducts =
    filteredProducts !== null ? filteredProducts : products;
  const pagedProducts = displayProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pageCount = Math.ceil(displayProducts.length / PAGE_SIZE);

  // Xác định có phải đang ở trang danh mục Nam/Nữ/Phụ kiện không
  const isCategoryMenu = (() => {
    if (!filter.categories || filter.categories.length === 0) return false;
    if (
      filter.categories.length === 1 &&
      filter.categories[0] === CATEGORY_MENU.NAM
    )
      return true;
    if (
      filter.categories.length === 1 &&
      filter.categories[0] === CATEGORY_MENU.NU
    )
      return true;
    if (
      filter.categories.length === 2 &&
      filter.categories.includes(CATEGORY_MENU.PHU_KIEN[0]) &&
      filter.categories.includes(CATEGORY_MENU.PHU_KIEN[1])
    )
      return true;
    if (
      filter.categories.length === 1 &&
      (filter.categories[0] === CATEGORY_MENU.PHU_KIEN_KINH ||
        filter.categories[0] === CATEGORY_MENU.PHU_KIEN_MU)
    )
      return true;
    return false;
  })();

  // Hàm quay về trang tổng sản phẩm
  const handleBackToAll = () => {
    clearFilter();
    navigate("/products");
  };

  return {
    currentPage,
    setCurrentPage,
    filter,
    setFilter,
    filteredProducts,
    setFilteredProducts,
    applyFilter,
    clearFilter,
    displayProducts,
    pagedProducts,
    pageCount,
    isCategoryMenu,
    handleBackToAll,
  };
}
