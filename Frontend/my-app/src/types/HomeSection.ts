export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  title: string;
  old_price?: number;
  discount?: number;
  sold?: number;
}

export interface HomeSection {
  id: number;
  name: string;
  title: string;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  products: Product[];
}

export interface HomeSectionResponse {
  sections: HomeSection[];
}

export interface HomeSectionProductResponse {
  section: HomeSection;
  products: Product[];
} 