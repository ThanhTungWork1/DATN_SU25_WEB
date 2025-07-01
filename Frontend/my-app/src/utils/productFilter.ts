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
// hàm lọc sp
export function filterProducts(
  products: Product[],
  filter: ProductFilter,
): Product[] {
  let result = products;

  // Lọc theo tên (ưu tiên AND, fallback OR nếu không có kết quả)
  if (filter.name) {
    // Tách từ khóa tìm kiếm thành mảng, loại bỏ khoảng trắng thừa
    // Ví dụ: "quần nam" => ["quần", "nam"]
    const keyword = normalizeText(filter.name);
    const keywordArr = keyword.split(" ").filter(Boolean);
    // Xác định loại sản phẩm chính từ từ khóa
    const mainTypes = ['ao', 'quan', 'kinh', 'mu'];
    const mainTypeInKeyword = mainTypes.find(type => keywordArr.includes(type));
    let filteredList = result;
    // Ưu tiên lọc đúng loại sản phẩm chính nếu có
    if (mainTypeInKeyword) {
      filteredList = filteredList.filter(p => normalizeText(p.name).includes(mainTypeInKeyword));
    }
    // Loại trừ sản phẩm "nam" khi tìm "nữ" và ngược lại
    const hasNu = keywordArr.includes('nu');
    const hasNam = keywordArr.includes('nam');
    if (hasNu) {
      filteredList = filteredList.filter(p => !normalizeText(p.name).includes('nam'));
    }
    if (hasNam) {
      filteredList = filteredList.filter(p => !normalizeText(p.name).includes('nu'));
    }
    // Lọc kiểu AND: tất cả từ đều phải có
    let filteredByName = filteredList.filter((p) => {
      const nameNorm = normalizeText(p.name);
      return keywordArr.every((word) => nameNorm.includes(word));
    });
    // Nếu không có kết quả và có nhiều hơn 1 từ khóa, fallback sang OR với xếp hạng số từ trùng
    if (filteredByName.length === 0 && keywordArr.length > 1) {
      let orMatched = filteredList
        .map((p) => {
          const nameNorm = normalizeText(p.name);
          const matchCount = keywordArr.filter((word) => nameNorm.includes(word)).length;
          return { product: p, matchCount };
        })
        .filter((item) => item.matchCount > 0);
      orMatched.sort((a, b) => b.matchCount - a.matchCount);
      filteredByName = orMatched.map((item) => item.product);
    }
    result = filteredByName;
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
    result = result.filter((p) => {
      const productColors = p.colors ? p.colors.map(Number) : [];
      const filterColors = filter.colors!.map(Number);
      const isMatch = productColors.some((colorId) => filterColors.includes(colorId));
      return p.colors && isMatch;
    });
    
  }
  // Lọc theo size
  if (filter.sizes && filter.sizes.length > 0) {
    result = result.filter((p) => {
      const productSizes = p.sizes ? p.sizes.map(Number) : [];
      const filterSizes = filter.sizes!.map(Number);
      const isMatch = productSizes.some((sizeId) => filterSizes.includes(sizeId));
      
      return p.sizes && isMatch;
    });
    
  }
  // Lọc theo chất liệu
  if (filter.materials && filter.materials.length > 0) {
    result = result.filter((p) => {
      if (p.materials && Array.isArray(p.materials)) {
        const isMatch = p.materials.some((m: string) =>
          filter.materials!.some((fm) => m.toLowerCase() === fm.toLowerCase()),
        );
        return isMatch;
      }
      return false;
    });
  }
  return result;
}

// Toggle color id trong filter
export function toggleColor(filter: ProductFilter, colorId: number): ProductFilter {
  return {
    ...filter,
    colors: filter.colors?.includes(colorId)
      ? filter.colors.filter((c) => c !== colorId)
      : [...(filter.colors || []), colorId],
  };
}

// Toggle size id trong filter
export function toggleSize(filter: ProductFilter, sizeId: number): ProductFilter {
  return {
    ...filter,
    sizes: filter.sizes?.includes(sizeId)
      ? filter.sizes.filter((s) => s !== sizeId)
      : [...(filter.sizes || []), sizeId],
  };
}

// Toggle material trong filter
export function toggleMaterial(filter: ProductFilter, material: string): ProductFilter {
  return {
    ...filter,
    materials: filter.materials?.includes(material)
      ? filter.materials.filter((m) => m !== material)
      : [...(filter.materials || []), material],
  };
}

// Toggle category id trong filter
export function toggleCategory(filter: ProductFilter, catId: number): ProductFilter {
  return {
    ...filter,
    categories: filter.categories?.includes(catId)
      ? filter.categories.filter((c) => c !== catId)
      : [...(filter.categories || []), catId],
  };
}
