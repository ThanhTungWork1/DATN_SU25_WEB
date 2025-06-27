import type { Product } from "../types/ProductType";
import type { ProductFilter } from "../types/ProductFilterType";

// Hàm chuẩn hóa tiếng Việt, bỏ dấu, chuyển thường, loại ký tự đặc biệt
function normalizeText(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "") // bỏ ký tự đặc biệt
    .replace(/\s+/g, " ")
    .trim();
}

export function filterProducts(
  products: Product[],
  filter: ProductFilter,
): Product[] {
  let result = products;
  console.log("[DEBUG] === BẮT ĐẦU LỌC SẢN PHẨM ===");
  console.log("[DEBUG] Filter input:", JSON.stringify(filter));
  console.log("[DEBUG] Tổng số sản phẩm đầu vào:", products.length);

  // Lọc theo tên (tìm kiếm mềm, chỉ cần 1 từ trong từ khóa xuất hiện trong tên sản phẩm)
  if (filter.name) {
    const keyword = normalizeText(filter.name);
    const keywordArr = keyword.split(" ").filter(Boolean);
    result = result.filter((p) => {
      const nameNorm = normalizeText(p.name);
      // Chỉ cần 1 từ trong keyword xuất hiện trong tên sản phẩm
      return keywordArr.some((word) => nameNorm.includes(word));
    });
  }
  // Lọc theo danh mục
  if (filter.categories && filter.categories.length > 0) {
    result = result.filter(
      (p) =>
        p.category_id &&
        filter.categories!.map(Number).includes(Number(p.category_id)),
    );
  }
  // Lọc theo giá
  if (
    filter.priceRange &&
    ["9-99", "99-499", "499-999"].includes(filter.priceRange)
  ) {
    result = result.filter((p) => {
      const price = p.price;
      if (filter.priceRange === "9-99") return price >= 9000 && price <= 99000;
      if (filter.priceRange === "99-499")
        return price > 99000 && price <= 499000;
      if (filter.priceRange === "499-999")
        return price > 499000 && price <= 999000;
      return false;
    });
  }
  // Lọc theo màu
  if (filter.colors && filter.colors.length > 0) {
    console.log("[DEBUG] Lọc theo màu - filter.colors:", filter.colors);
    result.forEach((p, idx) => {
      console.log(`[DEBUG] Sản phẩm #${idx} id=${p.id} colors=`, p.colors);
    });
    result = result.filter((p, idx) => {
      const productColors = p.colors ? p.colors.map(Number) : [];
      const filterColors = filter.colors!.map(Number);
      const isMatch = productColors.some((colorId) => filterColors.includes(colorId));
      console.log(`[DEBUG] So sánh màu - Sản phẩm #${idx} id=${p.id}:`, {
        productColors,
        filterColors,
        isMatch,
      });
      return p.colors && isMatch;
    });
    console.log("[DEBUG] Số sản phẩm sau khi lọc màu:", result.length);
  }
  // Lọc theo size
  if (filter.sizes && filter.sizes.length > 0) {
    console.log("[DEBUG] Lọc theo size - filter.sizes:", filter.sizes);
    result.forEach((p, idx) => {
      console.log(`[DEBUG] Sản phẩm #${idx} id=${p.id} sizes=`, p.sizes);
    });
    result = result.filter((p, idx) => {
      const productSizes = p.sizes ? p.sizes.map(Number) : [];
      const filterSizes = filter.sizes!.map(Number);
      const isMatch = productSizes.some((sizeId) => filterSizes.includes(sizeId));
      console.log(`[DEBUG] So sánh size - Sản phẩm #${idx} id=${p.id}:`, {
        productSizes,
        filterSizes,
        isMatch,
      });
      return p.sizes && isMatch;
    });
    console.log("[DEBUG] Số sản phẩm sau khi lọc size:", result.length);
  }
  // Lọc theo chất liệu
  if (filter.materials && filter.materials.length > 0) {
    console.log("[DEBUG] Lọc theo chất liệu - filter.materials:", filter.materials);
    result.forEach((p, idx) => {
      console.log(`[DEBUG] Sản phẩm #${idx} id=${p.id} materials=`, p.materials);
    });
    result = result.filter((p, idx) => {
      if (p.materials && Array.isArray(p.materials)) {
        const isMatch = p.materials.some((m: string) =>
          filter.materials!.some((fm) => m.toLowerCase() === fm.toLowerCase()),
        );
        console.log(`[DEBUG] So sánh chất liệu - Sản phẩm #${idx} id=${p.id}:`, {
          productMaterials: p.materials,
          filterMaterials: filter.materials,
          isMatch,
        });
        return isMatch;
      }
      return false;
    });
    console.log("[DEBUG] Số sản phẩm sau khi lọc chất liệu:", result.length);
  }
  console.log("[DEBUG] === KẾT THÚC LỌC SẢN PHẨM === Số sản phẩm còn lại:", result.length);
  return result;
}
