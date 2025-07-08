import axios from "axios";
import type { Product, Variant, ColorType } from "../types/DetailType";

/**
 * ============================================================
 * HÀM LẤY DỮ LIỆU CHI TIẾT SẢN PHẨM (getProductById)
 * ============================================================
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const [
      productResponse,
      variantsResponse,
      colorsResponse,
      sizesResponse,
      categoriesResponse,
    ] = await Promise.all([
      axios.get(`http://localhost:3000/products/${id}`),
      axios.get(`http://localhost:3000/productVariants?product_id=${id}`),
      axios.get(`http://localhost:3000/colors`),
      axios.get(`http://localhost:3000/sizes`),
      axios.get(`http://localhost:3000/categories`),
    ]);

    const productData = productResponse.data as Product;
    const variantsFromDb = variantsResponse.data as any[];
    const allColors = colorsResponse.data as any[];
    const allSizes = sizesResponse.data as any[];
    const allCategories = categoriesResponse.data as any[];

    const colorMap = new Map(allColors.map((c) => [Number(c.id), c]));
    const sizeMap = new Map(allSizes.map((s) => [Number(s.id), s]));
    const categoryMap = new Map(allCategories.map((c) => [Number(c.id), c]));

    const category = categoryMap.get(Number(productData.category_id));
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

    const finalProduct: Product = {
      ...productData,
      category: category ? category.name : "Chưa phân loại",
      variants: processedVariants,
      colors: Array.from(uniqueColorsForThisProduct.values()),
    };

    return finalProduct;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

/**
 * ============================================================
 * LẤY DANH SÁCH TẤT CẢ SẢN PHẨM
 * ============================================================
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:3000/products`);
  return data as Product[];
};

/**
 * ============================================================
 * LẤY COMMENT & USERS
 * ============================================================
 */
export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};

export const getAllUsers = async () => {
  return await axios.get(`http://localhost:3000/users`);
};

/**
 * ============================================================
 * GIỎ HÀNG - CART
 * ============================================================
 */
export const getCart = async () => {
  const { data } = await axios.get("http://localhost:3000/cart");
  return data;
};

export const addToCart = async (item: {
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
}) => {
  return await axios.post("http://localhost:3000/cart", item);
};

export const updateCartItem = async (id: number, quantity: number) => {
  return await axios.patch(`http://localhost:3000/cart/${id}`, { quantity });
};

export const removeCartItem = async (id: number) => {
  return await axios.delete(`http://localhost:3000/cart/${id}`);
};

/**
 * ============================================================
 * ĐƠN HÀNG - ORDER
 * ============================================================
 */
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
