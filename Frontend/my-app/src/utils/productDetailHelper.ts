import type { Product, Variant, ColorType } from "../types/DetailType";

export function processProductDetail(
  productData: Product,
  variantsFromDb: any[],
  allColors: any[],
  allSizes: any[],
  allCategories: any[],
): Product {
  // Tạo maps tra cứu nhanh
  const colorMap = new Map(allColors.map((c) => [Number(c.id), c]));
  const sizeMap = new Map(allSizes.map((s) => [Number(s.id), s]));
  const categoryMap = new Map(allCategories.map((c) => [Number(c.id), c]));

  // Tìm tên category
  const category = categoryMap.get(Number(productData.category_id));

  // Xử lý variants và colors
  const uniqueColorsForThisProduct = new Map<number, ColorType>();
  const processedVariants: Variant[] = variantsFromDb.map((variant) => {
    const foundColor = colorMap.get(Number(variant.color_id));
    const foundSize = sizeMap.get(Number(variant.size_id));

    if (
      foundColor &&
      !uniqueColorsForThisProduct.has(Number(foundColor.id))
    ) {
      uniqueColorsForThisProduct.set(Number(foundColor.id), {
        id: Number(foundColor.id),
        name: foundColor.name,
        code: foundColor.code,
        image: variant.image,
      });
    }

    return {
      size: foundSize?.name,
      stock: variant.stock,
      color: foundColor?.name,
      image: variant.image,
      sku: variant.sku,
    };
  });

  // Tổng hợp kết quả
  return {
    ...productData,
    category: category ? category.name : "Chưa phân loại",
    variants: processedVariants,
    colors: Array.from(uniqueColorsForThisProduct.values()),
  };
} 