import type { Product } from "./DetailType";

export type ProductInfoProps = {
  product: Product;
  selectedVariantStock: number | null | undefined;
  sku: string | undefined;
}; 