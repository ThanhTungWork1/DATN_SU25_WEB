import axios from 'axios';
import type { Product, Variant, ColorType } from '../types/DetailType';

/*
 * =================================================================
 * HÀM LẤY DỮ LIỆU CHI TIẾT SẢN PHẨM (getProductById)
 * =================================================================
 * Mục tiêu: Lấy đầy đủ thông tin cho một sản phẩm, bao gồm cả các
 * biến thể (variants), màu sắc (colors), và kích cỡ (sizes) của nó.
 */
export const getProductById = async (id: string): Promise<Product> => {
    try {
        // BƯỚC 1: LẤY TẤT CẢ DỮ LIỆU THÔ CẦN THIẾT
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

        const productData = productResponse.data as Product;
        const variantsFromDb = variantsResponse.data as any[];
        const allColors = colorsResponse.data as any[];
        const allSizes = sizesResponse.data as any[];
        const allCategories = categoriesResponse.data as any[];

        /*
         * =================================================================
         * GỠ LỖI QUAN TRỌNG
         * =================================================================
         */
        console.log(`[DEBUG] API đã trả về ${variantsFromDb.length} biến thể cho sản phẩm này.`, variantsFromDb);

        // BƯỚC 2: TẠO MAPS ĐỂ TRA CỨU NHANH
        // Dùng Number() để đảm bảo ID luôn là số, tránh lỗi không khớp kiểu dữ liệu
        const colorMap = new Map(allColors.map(c => [Number(c.id), c]));
        const sizeMap = new Map(allSizes.map(s => [Number(s.id), s]));
        const categoryMap = new Map(allCategories.map(c => [Number(c.id), c]));

        // Tìm tên category
        const category = categoryMap.get(Number(productData.category_id));

        // BƯỚC 3: XỬ LÝ VÀ "NỐI" DỮ LIỆU
        const uniqueColorsForThisProduct = new Map<number, ColorType>();
        const processedVariants: Variant[] = variantsFromDb.map(variant => {
            // Dùng Number() để đảm bảo tra cứu bằng SỐ
            const foundColor = colorMap.get(Number(variant.color_id));
            const foundSize = sizeMap.get(Number(variant.size_id));

            if (foundColor && !uniqueColorsForThisProduct.has(Number(foundColor.id))) {
                uniqueColorsForThisProduct.set(Number(foundColor.id), {
                    id: Number(foundColor.id),
                    name: foundColor.name,
                    code: foundColor.code,
                    image: variant.image
                });
            }

            return {
                size: foundSize?.name,
                stock: variant.stock,
                color: foundColor?.name,
                image: variant.image,
                sku: variant.sku
            };
        });
        
        // BƯỚC 4: TỔNG HỢP VÀ TRẢ VỀ SẢN PHẨM HOÀN CHỈNH
        const finalProduct: Product = {
            ...productData,
            category: category ? category.name : "Chưa phân loại",
            variants: processedVariants,
            colors: Array.from(uniqueColorsForThisProduct.values())
        };

        return finalProduct;

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi lấy dữ liệu chi tiết sản phẩm:", error);
        throw error;
    }
};

export const getAllProducts = async (): Promise<Product[]> => {
    const { data } = await axios.get(`http://localhost:3000/products`);
    return data as Product[];
};

/*
 * =================================================================
 * HÀM LẤY DANH SÁCH ĐÁNH GIÁ (COMMENTS) CHO SẢN PHẨM
 * =================================================================
 * Mục tiêu: Lấy tất cả đánh giá (comments) của một sản phẩm theo product_id
 */
export const getProductReviews = async (productId: number) => {
    // Trả về promise dữ liệu comments cho sản phẩm
    return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};

/*
 * =================================================================
 * HÀM LẤY DANH SÁCH USER
 * =================================================================
 * Mục tiêu: Lấy tất cả user để join vào đánh giá
 */
export const getAllUsers = async () => {
    // Trả về promise dữ liệu user
    return await axios.get(`http://localhost:3000/users`);
};
