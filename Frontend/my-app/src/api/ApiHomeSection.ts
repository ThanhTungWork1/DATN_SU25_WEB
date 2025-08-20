import axiosInstance from "../utils/axiosInstance";
import { HomeSectionResponse, HomeSection } from "../types/HomeSection";

const ApiHomeSection = {
  // Lấy tất cả sections cho trang chủ (Public)
  getHomeSections: async (): Promise<HomeSectionResponse> => {
    console.log("🏠 ApiHomeSection - Gọi API /home-sections");
    try {
      const response = await axiosInstance.get("/home-sections");
      console.log("🏠 ApiHomeSection - Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ApiHomeSection - Error:", error);
      throw error;
    }
  },

  // Lấy section theo ID
  getSectionById: async (id: number) => {
    const response = await axiosInstance.get(`/home-sections/${id}`);
    return response.data;
  },

  // Tạo section mới (Admin)
  createSection: async (data: {
    name: string;
    title: string;
    description?: string;
  }) => {
    const response = await axiosInstance.post("/admin/home-sections", data);
    return response.data;
  },

  // Cập nhật section (Admin)
  updateSection: async (
    id: number,
    data: { title: string; description?: string; status?: boolean }
  ) => {
    const response = await axiosInstance.put(
      `/admin/home-sections/${id}`,
      data
    );
    return response.data;
  },

  // Xóa section (Admin)
  deleteSection: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/home-sections/${id}`);
    return response.data;
  },

  // Lấy sản phẩm của section
  getSectionProducts: async (id: number) => {
    const response = await axiosInstance.get(
      `/admin/home-sections/${id}/products`
    );
    return response.data;
  },

  // Thêm sản phẩm vào section (Admin)
  addProductsToSection: async (id: number, productIds: number[]) => {
    const response = await axiosInstance.post(
      `/admin/home-sections/${id}/products`,
      {
        product_ids: productIds,
      }
    );
    return response.data;
  },

  // Xóa sản phẩm khỏi section (Admin)
  removeProductFromSection: async (sectionId: number, productId: number) => {
    const response = await axiosInstance.delete(
      `/admin/home-sections/${sectionId}/products/${productId}`
    );
    return response.data;
  },
};

export { ApiHomeSection };
export default ApiHomeSection;
