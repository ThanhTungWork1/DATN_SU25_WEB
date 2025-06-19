export interface Variant {
    size: string;
    stock: number;
}

export type ColorType = {
    name: string;
    code: string;
    image?: string;
};

export interface Product {
    id: number;
    name: string;
    price: number;
    discount?: number;
    sku: string;
    category: string;
    tags: string[];
    images: string[];
    detailImages?: string[];
    variants: Variant[];
    colors: ColorType[];
    description?: string;
    rating?: number;
    reviews?: number;
    details?: string[];
}

export type SizeProps = {
    variants: Variant[];
    selectedSize: string | null;
    onSelectSize: (size: string) => void;
};