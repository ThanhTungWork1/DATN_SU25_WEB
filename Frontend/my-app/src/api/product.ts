// src/api/product.ts

// Thay đổi từ import axios sang import axiosInstance
import axiosInstance from "../utils/axiosInstance";
import { Product, ProductVariant, Color, Size, Category } from "../types/ProductType"; 

// Xóa BASE_URL ở đây, vì chúng ta đã cấu hình nó trong axiosInstance
// const BASE_URL = "http://localhost:8000/api"; 

// Tất cả các hàm đều sử dụng axiosInstance
// Các đường dẫn này là đường dẫn tương đối so với baseURL của axiosInstance (http://localhost:8000/api)

// API cho Products (Admin Routes) - Cần xác thực
export const getProducts = () => axiosInstance.get<Product[]>(`/admin/products`);
export const getProduct = (id: string | number) => axiosInstance.get<Product>(`/admin/products/${id}`);
export const updateProduct = (id: string | number, data: Partial<Product>) => axiosInstance.put<Product>(`/admin/products/${id}`, data);
export const createProduct = (data: Product) => axiosInstance.post<Product>(`/admin/products`, data);
export const deleteProduct = (id: string | number) => axiosInstance.delete<void>(`/admin/products/${id}`);

// API cho Categories, Colors, Sizes (Public Routes hoặc Authenticated Routes tùy vào routes/api.php)
// Nếu các route này không nằm trong admin group, chúng vẫn có thể gọi thẳng từ axiosInstance
export const getCategories = () => axiosInstance.get<Category[]>(`/categories`);
export const getCategory = (id: string | number) => axiosInstance.get<Category>(`/categories/${id}`);

export const getColors = () => axiosInstance.get<Color[]>(`/colors`);
export const getColor = (id: string | number) => axiosInstance.get<Color>(`/colors/${id}`);

export const getSizes = () => axiosInstance.get<Size[]>(`/sizes`);
export const getSize = (id: string | number) => axiosInstance.get<Size>(`/sizes/${id}`);

// API cho Product Variants (Public Routes hoặc Authenticated Routes tùy vào routes/api.php)
// Cập nhật đường dẫn nếu routes/api.php sử dụng product-variant (không phải resource)
// Dựa trên routes/api.php bạn gửi trước đó:
// Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
// ...
export const getProductVariants = (productId: string | number) => axiosInstance.get<ProductVariant[]>(`/product-variants/${productId}`);
export const getProductVariant = (id: string | number) => axiosInstance.get<ProductVariant>(`/product-variants/${id}`);
export const createProductVariant = (data: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => axiosInstance.post<ProductVariant>(`/product-variants`, data);
export const updateProductVariant = (id: string | number, data: Partial<ProductVariant>) => axiosInstance.put<ProductVariant>(`/product-variants/${id}`, data);
export const deleteProductVariant = (id: string | number) => axiosInstance.delete<void>(`/product-variants/${id}`);