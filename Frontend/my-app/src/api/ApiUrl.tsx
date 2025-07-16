import axios from "axios";
import type { Product } from "../types/DetailType";
import { processProductDetail } from "../utils/productDetailHelper";

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

    return processProductDetail(
      productResponse.data,
      variantsResponse.data,
      colorsResponse.data,
      sizesResponse.data,
      categoriesResponse.data
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:3000/products`);
  return data;
};

export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};

export const getAllUsers = async () => {
  return await axios.get(`http://localhost:3000/users`);
};

export const getCartItemsWithDetails = async (userId: number) => {
  const cartRes = await axios.get(`http://localhost:3000/carts?user_id=${userId}`);
  const cart = cartRes.data[0];
  if (!cart) return [];

  const [itemsRes, variantsRes, productsRes, colorsRes, sizesRes] = await Promise.all([
    axios.get(`http://localhost:3000/cartItems?cart_id=${cart.id}`),
    axios.get(`http://localhost:3000/productVariants`),
    axios.get(`http://localhost:3000/products`),
    axios.get(`http://localhost:3000/colors`),
    axios.get(`http://localhost:3000/sizes`)
  ]);

  const items = itemsRes.data;
  const variants = variantsRes.data;
  const products = productsRes.data;
  const colors = colorsRes.data;
  const sizes = sizesRes.data;

  return items.map((item: any) => {
    const variant = variants.find((v: any) => v.id === item.variant_id);
    const product = products.find((p: any) => p.id === variant?.product_id);
    const color = colors.find((c: any) => c.id === variant?.color_id);
    const size = sizes.find((s: any) => s.id === variant?.size_id);

    return {
      id: item.id,
      quantity: item.quantity,
      image: variant?.image,
      name: product?.name,
      price: product?.price,
      color: color?.name,
      size: size?.name
    };
  });
};

export const addToCart = async (userId: number, variant_id: number, quantity: number) => {
  const cartRes = await axios.get(`http://localhost:3000/carts?user_id=${userId}`);
  let cart = cartRes.data[0];

  if (!cart) {
    const newCart = await axios.post("http://localhost:3000/carts", {
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    cart = newCart.data;
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
