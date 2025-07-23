import axios from "axios";
import type { Product } from "../types/DetailType";
import { processProductDetail } from "../utils/productDetailHelper";

// Định nghĩa interfaces cho API responses
interface ProductResponse {
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
  variants?: any;
  colors?: any[];
  rating?: number;
  reviews?: number;
  details?: string[];
}

interface VariantResponse {
  id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  stock: number;
  image: string;
  sku: string;
}

interface ColorResponse {
  id: number;
  name: string;
  code: string;
  image?: string;
}

interface SizeResponse {
  id: number;
  name: string;
}

interface CategoryResponse {
  id: number;
  name: string;
}

interface CartResponse {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface CartItemResponse {
  id: number;
  cart_id: number;
  variant_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const [
      productResponse,
      variantsResponse,
      colorsResponse,
      sizesResponse,
      categoriesResponse
    ] = await Promise.all([
      axios.get(`http://localhost:3000/products/${id}`),
      axios.get(`http://localhost:3000/productVariants?product_id=${id}`),
      axios.get(`http://localhost:3000/colors`),
      axios.get(`http://localhost:3000/sizes`),
      axios.get(`http://localhost:3000/categories`)
    ]);

    // Chuyển đổi images về dạng mảng nếu là string
    let productData = productResponse.data as ProductResponse;
    if (typeof productData.images === 'string') {
      try {
        const parsed = JSON.parse(productData.images);
        productData.images = Array.isArray(parsed) ? parsed.filter((img: any) => typeof img === 'string') : undefined;
      } catch {
        productData.images = undefined;
      }
    } else if (!Array.isArray(productData.images)) {
      productData.images = undefined;
    }

    return processProductDetail(
      productData as unknown as Product,
      variantsResponse.data as VariantResponse[],
      colorsResponse.data as ColorResponse[],
      sizesResponse.data as SizeResponse[],
      categoriesResponse.data as CategoryResponse[]
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:3000/products`);
  return data as Product[];
};

export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};

export const getAllUsers = async () => {
  return await axios.get(`http://localhost:3000/users`);
};

export const getCartItemsWithDetails = async (userId: number) => {
  const cartRes = await axios.get(`http://localhost:3000/carts?user_id=${userId}`);
  const cart = (cartRes.data as CartResponse[])[0];
  if (!cart) return [];

  const [itemsRes, variantsRes, productsRes, colorsRes, sizesRes] = await Promise.all([
    axios.get(`http://localhost:3000/cartItems?cart_id=${cart.id}`),
    axios.get(`http://localhost:3000/productVariants`),
    axios.get(`http://localhost:3000/products`),
    axios.get(`http://localhost:3000/colors`),
    axios.get(`http://localhost:3000/sizes`)
  ]);

  const items = itemsRes.data as CartItemResponse[];
  const variants = variantsRes.data as VariantResponse[];
  const products = productsRes.data as ProductResponse[]; // Sửa thành mảng
  const colors = colorsRes.data as ColorResponse[];
  const sizes = sizesRes.data as SizeResponse[];

  return items.map((item: CartItemResponse) => {
    let variant = variants.find((v: VariantResponse) => v.id === item.variant_id);
    let product = variant
      ? products.find((p: ProductResponse) => p.id === variant.product_id)
      : products.find((p: ProductResponse) => p.id === item.variant_id); // fallback nếu không có variant

    if (!variant) {
      console.warn('Không tìm thấy variant cho cartItem', item);
    }
    if (!product) {
      console.warn('Không tìm thấy product cho variant', variant, 'cartItem', item);
    }

    const color = colors.find((c: ColorResponse) => c.id === variant?.color_id);
    const size = sizes.find((s: SizeResponse) => s.id === variant?.size_id);

    return {
      id: item.id,
      quantity: item.quantity,
      image: variant?.image || product?.image || '',
      name: product?.name || 'Không tìm thấy tên sản phẩm',
      price: product?.price ?? 0,
      color: color?.name || '',
      size: size?.name || ''
    };
  });
};

export const addToCart = async (userId: number, variant_id: number, quantity: number) => {
  const cartRes = await axios.get(`http://localhost:3000/carts?user_id=${userId}`);
  let cart = (cartRes.data as CartResponse[])[0];

  if (!cart) {
    const newCart = await axios.post("http://localhost:3000/carts", {
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    cart = newCart.data as CartResponse;
  }

  return await axios.post("http://localhost:3000/cartItems", {
    cart_id: cart.id,
    variant_id,
    quantity,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

export const updateCartItem = async (id: number, quantity: number) => {
  return await axios.patch(`http://localhost:3000/cartItems/${id}`, { quantity });
};

export const removeCartItem = async (id: number) => {
  return await axios.delete(`http://localhost:3000/cartItems/${id}`);
};

export const getAllOrders = async () => {
  const { data } = await axios.get("http://localhost:3000/orders");
  return data;
};

export const createOrder = async (orderData: {
  userId: number;
  items: any[];
  total: number;
  address: string;
  phone: string;
}) => {
  return await axios.post("http://localhost:3000/orders", orderData);
};

export const getOrderById = async (id: number) => {
  const { data } = await axios.get(`http://localhost:3000/orders/${id}`);
  return data;
};
