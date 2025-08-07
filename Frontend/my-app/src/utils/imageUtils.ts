/**
 * Utility functions để xử lý URL ảnh từ backend
 */

const BACKEND_URL = 'http://localhost:8000';

/**
 * Chuyển đổi raw image path thành full URL
 * @param imagePath - Đường dẫn ảnh từ database
 * @returns Full URL hoặc placeholder nếu không có ảnh
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return "https://via.placeholder.com/300x300?text=No+Image";
  }
  
  // Nếu đã là URL đầy đủ thì return luôn
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Nếu là path thì thêm prefix backend
  return `${BACKEND_URL}/storage/${imagePath}`;
};

/**
 * Lấy ảnh chính của sản phẩm với fallback
 * @param product - Object sản phẩm
 * @returns URL ảnh chính
 */
export const getProductMainImage = (product: any): string => {
  return (
    product.image_url ||
    getImageUrl(product.image) ||
    (product.images && getImageUrl(product.images[0])) ||
    "https://via.placeholder.com/300x300?text=No+Image"
  );
};

/**
 * Lấy ảnh hover của sản phẩm
 * @param product - Object sản phẩm  
 * @returns URL ảnh hover hoặc null
 */
export const getProductHoverImage = (product: any): string | null => {
  return (
    product.hover_image_url ||
    getImageUrl(product.hover_image) ||
    null
  );
};
