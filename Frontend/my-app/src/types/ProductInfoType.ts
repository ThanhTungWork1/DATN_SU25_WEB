import type { Product, Variant } from "./DetailType";

export type ProductInfoProps = {
  product: Product;
  selectedVariantStock: number | null | undefined;
  sku: string | undefined;
  selectedVariant?: Variant;
}; 