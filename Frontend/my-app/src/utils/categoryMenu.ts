// Map tên menu với id danh mục sản phẩm
export const CATEGORY_MENU = {
  NAM: 1, // id danh mục Thời trang nam (tổng)
  NU: 2, // id danh mục Thời trang nữ (tổng)
  PHU_KIEN: [3, 4], // id danh mục Phụ kiện (gồm cả Kính và Mũ)
  PHU_KIEN_KINH: 3, // id danh mục Kính
  PHU_KIEN_MU: 4, // id danh mục Mũ
  // Bổ sung các id thuộc nhóm Nam, Nữ (bao gồm cả áo/quần)
  NAM_IDS: [1, 2], // 1: Áo Nam, 2: Quần Nam
  NU_IDS: [5, 6],  // 5: Áo Nữ, 6: Quần Nữ
};
