export interface Variant {
  size?: string;
  stock: number;
  color?: string;
  image?: string;
  sku?: string;
}

export type ColorType = {
  id: number;
  name: string;
  code: string;
  image?: string;
};

export interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  old_price?: number;
  description?: string;
  status?: boolean;
  slug?: string;
  category_id?: number;
  image?: string;
  material?: string;
  sold?: number;
  discount?: number;
  sku?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  detailImages?: string[];
  variants?: Variant[];
  colors?: ColorType[];
  rating?: number;
  reviews?: number;
  details?: string[];
}

export type SizeProps = {
  variants: Variant[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
};
