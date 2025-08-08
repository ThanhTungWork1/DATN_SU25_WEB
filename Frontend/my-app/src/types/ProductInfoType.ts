import type { Product, Variant } from "./DetailType";

export type ProductInfoProps = {
  product: Product;
  selectedVariant?: Variant | null; // ✅ Thêm selectedVariant
  selectedVariantStock: number | null | undefined;
  sku: string | undefined;
}; 