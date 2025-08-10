// Vietnam Address API Integration
export interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
}

export interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  district_code: number;
  province_code: number;
}

const API_BASE_URL = 'https://provinces.open-api.vn/api';

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/p/`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    const data = await response.json();
    console.log('Provinces API response:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching provinces:', error);
    // Extended fallback data if API fails
    return [
      { code: 1, name: "Hà Nội", name_en: "Ha Noi", full_name: "Thành phố Hà Nội", full_name_en: "Ha Noi City", code_name: "ha_noi" },
      { code: 79, name: "TP Hồ Chí Minh", name_en: "Ho Chi Minh", full_name: "Thành phố Hồ Chí Minh", full_name_en: "Ho Chi Minh City", code_name: "ho_chi_minh" },
      { code: 48, name: "Đà Nẵng", name_en: "Da Nang", full_name: "Thành phố Đà Nẵng", full_name_en: "Da Nang City", code_name: "da_nang" },
      { code: 92, name: "Cần Thơ", name_en: "Can Tho", full_name: "Thành phố Cần Thơ", full_name_en: "Can Tho City", code_name: "can_tho" },
      { code: 20, name: "Thái Bình", name_en: "Thai Binh", full_name: "Tỉnh Thái Bình", full_name_en: "Thai Binh Province", code_name: "thai_binh" },
      { code: 2, name: "Hà Giang", name_en: "Ha Giang", full_name: "Tỉnh Hà Giang", full_name_en: "Ha Giang Province", code_name: "ha_giang" },
      { code: 4, name: "Cao Bằng", name_en: "Cao Bang", full_name: "Tỉnh Cao Bằng", full_name_en: "Cao Bang Province", code_name: "cao_bang" },
      { code: 6, name: "Bắc Kạn", name_en: "Bac Kan", full_name: "Tỉnh Bắc Kạn", full_name_en: "Bac Kan Province", code_name: "bac_kan" },
      { code: 8, name: "Tuyên Quang", name_en: "Tuyen Quang", full_name: "Tỉnh Tuyên Quang", full_name_en: "Tuyen Quang Province", code_name: "tuyen_quang" },
      { code: 10, name: "Lào Cai", name_en: "Lao Cai", full_name: "Tỉnh Lào Cai", full_name_en: "Lao Cai Province", code_name: "lao_cai" }
    ];
  }
};

export const getDistrictsByProvince = async (provinceCode: number): Promise<District[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    const data = await response.json();
    console.log(`Districts API response for province ${provinceCode}:`, data);
    
    if (data && data.districts && Array.isArray(data.districts)) {
      return data.districts;
    }
    
    // Return fallback districts based on province
    return getFallbackDistricts(provinceCode);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return getFallbackDistricts(provinceCode);
  }
};

const getFallbackDistricts = (provinceCode: number): District[] => {
  const fallbackData: { [key: number]: District[] } = {
    1: [ // Hà Nội - 30 quận/huyện
      // 12 Quận nội thành
      { code: 1, name: "Ba Đình", name_en: "Ba Dinh", full_name: "Quận Ba Đình", full_name_en: "Ba Dinh District", code_name: "ba_dinh", province_code: 1 },
      { code: 2, name: "Hoàn Kiếm", name_en: "Hoan Kiem", full_name: "Quận Hoàn Kiếm", full_name_en: "Hoan Kiem District", code_name: "hoan_kiem", province_code: 1 },
      { code: 3, name: "Tây Hồ", name_en: "Tay Ho", full_name: "Quận Tây Hồ", full_name_en: "Tay Ho District", code_name: "tay_ho", province_code: 1 },
      { code: 4, name: "Long Biên", name_en: "Long Bien", full_name: "Quận Long Biên", full_name_en: "Long Bien District", code_name: "long_bien", province_code: 1 },
      { code: 5, name: "Cầu Giấy", name_en: "Cau Giay", full_name: "Quận Cầu Giấy", full_name_en: "Cau Giay District", code_name: "cau_giay", province_code: 1 },
      { code: 6, name: "Đống Đa", name_en: "Dong Da", full_name: "Quận Đống Đa", full_name_en: "Dong Da District", code_name: "dong_da", province_code: 1 },
      { code: 7, name: "Hai Bà Trưng", name_en: "Hai Ba Trung", full_name: "Quận Hai Bà Trưng", full_name_en: "Hai Ba Trung District", code_name: "hai_ba_trung", province_code: 1 },
      { code: 8, name: "Hoàng Mai", name_en: "Hoang Mai", full_name: "Quận Hoàng Mai", full_name_en: "Hoang Mai District", code_name: "hoang_mai", province_code: 1 },
      { code: 9, name: "Thanh Xuân", name_en: "Thanh Xuan", full_name: "Quận Thanh Xuân", full_name_en: "Thanh Xuan District", code_name: "thanh_xuan", province_code: 1 },
      { code: 10, name: "Bắc Từ Liêm", name_en: "Bac Tu Liem", full_name: "Quận Bắc Từ Liêm", full_name_en: "Bac Tu Liem District", code_name: "bac_tu_liem", province_code: 1 },
      { code: 11, name: "Nam Từ Liêm", name_en: "Nam Tu Liem", full_name: "Quận Nam Từ Liêm", full_name_en: "Nam Tu Liem District", code_name: "nam_tu_liem", province_code: 1 },
      { code: 12, name: "Hà Đông", name_en: "Ha Dong", full_name: "Quận Hà Đông", full_name_en: "Ha Dong District", code_name: "ha_dong", province_code: 1 },
      
      // 1 Thị xã
      { code: 13, name: "Sơn Tây", name_en: "Son Tay", full_name: "Thị xã Sơn Tây", full_name_en: "Son Tay Town", code_name: "son_tay", province_code: 1 },
      
      // 17 Huyện
      { code: 14, name: "Ba Vì", name_en: "Ba Vi", full_name: "Huyện Ba Vì", full_name_en: "Ba Vi District", code_name: "ba_vi", province_code: 1 },
      { code: 15, name: "Phúc Thọ", name_en: "Phuc Tho", full_name: "Huyện Phúc Thọ", full_name_en: "Phuc Tho District", code_name: "phuc_tho", province_code: 1 },
      { code: 16, name: "Đan Phượng", name_en: "Dan Phuong", full_name: "Huyện Đan Phượng", full_name_en: "Dan Phuong District", code_name: "dan_phuong", province_code: 1 },
      { code: 17, name: "Hoài Đức", name_en: "Hoai Duc", full_name: "Huyện Hoài Đức", full_name_en: "Hoai Duc District", code_name: "hoai_duc", province_code: 1 },
      { code: 18, name: "Quốc Oai", name_en: "Quoc Oai", full_name: "Huyện Quốc Oai", full_name_en: "Quoc Oai District", code_name: "quoc_oai", province_code: 1 },
      { code: 19, name: "Thạch Thất", name_en: "Thach That", full_name: "Huyện Thạch Thất", full_name_en: "Thach That District", code_name: "thach_that", province_code: 1 },
      { code: 20, name: "Chương Mỹ", name_en: "Chuong My", full_name: "Huyện Chương Mỹ", full_name_en: "Chuong My District", code_name: "chuong_my", province_code: 1 },
      { code: 21, name: "Thanh Oai", name_en: "Thanh Oai", full_name: "Huyện Thanh Oai", full_name_en: "Thanh Oai District", code_name: "thanh_oai", province_code: 1 },
      { code: 22, name: "Thường Tín", name_en: "Thuong Tin", full_name: "Huyện Thường Tín", full_name_en: "Thuong Tin District", code_name: "thuong_tin", province_code: 1 },
      { code: 23, name: "Phú Xuyên", name_en: "Phu Xuyen", full_name: "Huyện Phú Xuyên", full_name_en: "Phu Xuyen District", code_name: "phu_xuyen", province_code: 1 },
      { code: 24, name: "Ứng Hòa", name_en: "Ung Hoa", full_name: "Huyện Ứng Hòa", full_name_en: "Ung Hoa District", code_name: "ung_hoa", province_code: 1 },
      { code: 25, name: "Mỹ Đức", name_en: "My Duc", full_name: "Huyện Mỹ Đức", full_name_en: "My Duc District", code_name: "my_duc", province_code: 1 },
      { code: 26, name: "Đông Anh", name_en: "Dong Anh", full_name: "Huyện Đông Anh", full_name_en: "Dong Anh District", code_name: "dong_anh", province_code: 1 },
      { code: 27, name: "Gia Lâm", name_en: "Gia Lam", full_name: "Huyện Gia Lâm", full_name_en: "Gia Lam District", code_name: "gia_lam", province_code: 1 },
      { code: 28, name: "Sóc Sơn", name_en: "Soc Son", full_name: "Huyện Sóc Sơn", full_name_en: "Soc Son District", code_name: "soc_son", province_code: 1 },
      { code: 29, name: "Mê Linh", name_en: "Me Linh", full_name: "Huyện Mê Linh", full_name_en: "Me Linh District", code_name: "me_linh", province_code: 1 },
      { code: 30, name: "Thanh Trì", name_en: "Thanh Tri", full_name: "Huyện Thanh Trì", full_name_en: "Thanh Tri District", code_name: "thanh_tri", province_code: 1 },
    ],
    79: [ // TP.HCM - 24 quận/huyện
      // 12 Quận nội thành
      { code: 760, name: "Quận 1", name_en: "District 1", full_name: "Quận 1", full_name_en: "District 1", code_name: "quan_1", province_code: 79 },
      { code: 761, name: "Quận 3", name_en: "District 3", full_name: "Quận 3", full_name_en: "District 3", code_name: "quan_3", province_code: 79 },
      { code: 762, name: "Quận 4", name_en: "District 4", full_name: "Quận 4", full_name_en: "District 4", code_name: "quan_4", province_code: 79 },
      { code: 763, name: "Quận 5", name_en: "District 5", full_name: "Quận 5", full_name_en: "District 5", code_name: "quan_5", province_code: 79 },
      { code: 764, name: "Quận 6", name_en: "District 6", full_name: "Quận 6", full_name_en: "District 6", code_name: "quan_6", province_code: 79 },
      { code: 765, name: "Quận 8", name_en: "District 8", full_name: "Quận 8", full_name_en: "District 8", code_name: "quan_8", province_code: 79 },
      { code: 766, name: "Quận 10", name_en: "District 10", full_name: "Quận 10", full_name_en: "District 10", code_name: "quan_10", province_code: 79 },
      { code: 767, name: "Quận 11", name_en: "District 11", full_name: "Quận 11", full_name_en: "District 11", code_name: "quan_11", province_code: 79 },
      { code: 768, name: "Quận 12", name_en: "District 12", full_name: "Quận 12", full_name_en: "District 12", code_name: "quan_12", province_code: 79 },
      { code: 769, name: "Quận Gò Vấp", name_en: "Go Vap District", full_name: "Quận Gò Vấp", full_name_en: "Go Vap District", code_name: "go_vap", province_code: 79 },
      { code: 770, name: "Quận Tân Bình", name_en: "Tan Binh District", full_name: "Quận Tân Bình", full_name_en: "Tan Binh District", code_name: "tan_binh", province_code: 79 },
      { code: 771, name: "Quận Tân Phú", name_en: "Tan Phu District", full_name: "Quận Tân Phú", full_name_en: "Tan Phu District", code_name: "tan_phu", province_code: 79 },
      { code: 772, name: "Quận Bình Thạnh", name_en: "Binh Thanh District", full_name: "Quận Bình Thạnh", full_name_en: "Binh Thanh District", code_name: "binh_thanh", province_code: 79 },
      { code: 773, name: "Quận Phú Nhuận", name_en: "Phu Nhuan District", full_name: "Quận Phú Nhuận", full_name_en: "Phu Nhuan District", code_name: "phu_nhuan", province_code: 79 },
      { code: 774, name: "Thành phố Thủ Đức", name_en: "Thu Duc City", full_name: "Thành phố Thủ Đức", full_name_en: "Thu Duc City", code_name: "thu_duc", province_code: 79 },
      
      // 7 Huyện
      { code: 775, name: "Huyện Bình Chánh", name_en: "Binh Chanh District", full_name: "Huyện Bình Chánh", full_name_en: "Binh Chanh District", code_name: "binh_chanh", province_code: 79 },
      { code: 776, name: "Huyện Hóc Môn", name_en: "Hoc Mon District", full_name: "Huyện Hóc Môn", full_name_en: "Hoc Mon District", code_name: "hoc_mon", province_code: 79 },
      { code: 777, name: "Huyện Củ Chi", name_en: "Cu Chi District", full_name: "Huyện Củ Chi", full_name_en: "Cu Chi District", code_name: "cu_chi", province_code: 79 },
      { code: 778, name: "Huyện Nhà Bè", name_en: "Nha Be District", full_name: "Huyện Nhà Bè", full_name_en: "Nha Be District", code_name: "nha_be", province_code: 79 },
      { code: 779, name: "Huyện Cần Giờ", name_en: "Can Gio District", full_name: "Huyện Cần Giờ", full_name_en: "Can Gio District", code_name: "can_gio", province_code: 79 },
    ],
    48: [ // Đà Nẵng - 8 quận/huyện
      // 6 Quận
      { code: 490, name: "Hải Châu", name_en: "Hai Chau", full_name: "Quận Hải Châu", full_name_en: "Hai Chau District", code_name: "hai_chau", province_code: 48 },
      { code: 491, name: "Thanh Khê", name_en: "Thanh Khe", full_name: "Quận Thanh Khê", full_name_en: "Thanh Khe District", code_name: "thanh_khe", province_code: 48 },
      { code: 492, name: "Sơn Trà", name_en: "Son Tra", full_name: "Quận Sơn Trà", full_name_en: "Son Tra District", code_name: "son_tra", province_code: 48 },
      { code: 493, name: "Ngũ Hành Sơn", name_en: "Ngu Hanh Son", full_name: "Quận Ngũ Hành Sơn", full_name_en: "Ngu Hanh Son District", code_name: "ngu_hanh_son", province_code: 48 },
      { code: 494, name: "Liên Chiểu", name_en: "Lien Chieu", full_name: "Quận Liên Chiểu", full_name_en: "Lien Chieu District", code_name: "lien_chieu", province_code: 48 },
      { code: 495, name: "Cẩm Lệ", name_en: "Cam Le", full_name: "Quận Cẩm Lệ", full_name_en: "Cam Le District", code_name: "cam_le", province_code: 48 },
      
      // 2 Huyện
      { code: 496, name: "Huyện Hòa Vang", name_en: "Hoa Vang District", full_name: "Huyện Hòa Vang", full_name_en: "Hoa Vang District", code_name: "hoa_vang", province_code: 48 },
      { code: 497, name: "Huyện Hoàng Sa", name_en: "Hoang Sa District", full_name: "Huyện Hoàng Sa", full_name_en: "Hoang Sa District", code_name: "hoang_sa", province_code: 48 },
    ]
  };
  
  return fallbackData[provinceCode] || [];
};

export const getWardsByDistrict = async (districtCode: number): Promise<Ward[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    if (!response.ok) {
      throw new Error('Failed to fetch wards');
    }
    const data = await response.json();
    console.log(`Wards API response for district ${districtCode}:`, data);
    
    if (data && data.wards && Array.isArray(data.wards)) {
      return data.wards;
    }
    
    // Return fallback wards based on district
    return getFallbackWards(districtCode);
  } catch (error) {
    console.error('Error fetching wards:', error);
    return getFallbackWards(districtCode);
  }
};

const getFallbackWards = (districtCode: number): Ward[] => {
  const fallbackData: { [key: number]: Ward[] } = {
    // HÀ NỘI - Các quận chính
    1: [ // Ba Đình - 14 phường
      { code: 1, name: "Phúc Xá", name_en: "Phuc Xa", full_name: "Phường Phúc Xá", full_name_en: "Phuc Xa Ward", code_name: "phuc_xa", district_code: 1, province_code: 1 },
      { code: 4, name: "Trúc Bạch", name_en: "Truc Bach", full_name: "Phường Trúc Bạch", full_name_en: "Truc Bach Ward", code_name: "truc_bach", district_code: 1, province_code: 1 },
      { code: 7, name: "Vĩnh Phúc", name_en: "Vinh Phuc", full_name: "Phường Vĩnh Phúc", full_name_en: "Vinh Phuc Ward", code_name: "vinh_phuc", district_code: 1, province_code: 1 },
      { code: 10, name: "Cống Vị", name_en: "Cong Vi", full_name: "Phường Cống Vị", full_name_en: "Cong Vi Ward", code_name: "cong_vi", district_code: 1, province_code: 1 },
      { code: 13, name: "Liễu Giai", name_en: "Lieu Giai", full_name: "Phường Liễu Giai", full_name_en: "Lieu Giai Ward", code_name: "lieu_giai", district_code: 1, province_code: 1 },
      { code: 16, name: "Nguyễn Trung Trực", name_en: "Nguyen Trung Truc", full_name: "Phường Nguyễn Trung Trực", full_name_en: "Nguyen Trung Truc Ward", code_name: "nguyen_trung_truc", district_code: 1, province_code: 1 },
      { code: 19, name: "Quán Thánh", name_en: "Quan Thanh", full_name: "Phường Quán Thánh", full_name_en: "Quan Thanh Ward", code_name: "quan_thanh", district_code: 1, province_code: 1 },
      { code: 22, name: "Ngọc Hà", name_en: "Ngoc Ha", full_name: "Phường Ngọc Hà", full_name_en: "Ngoc Ha Ward", code_name: "ngoc_ha", district_code: 1, province_code: 1 },
      { code: 25, name: "Điện Biên", name_en: "Dien Bien", full_name: "Phường Điện Biên", full_name_en: "Dien Bien Ward", code_name: "dien_bien", district_code: 1, province_code: 1 },
      { code: 28, name: "Đội Cấn", name_en: "Doi Can", full_name: "Phường Đội Cấn", full_name_en: "Doi Can Ward", code_name: "doi_can", district_code: 1, province_code: 1 },
      { code: 31, name: "Ngọc Khánh", name_en: "Ngoc Khanh", full_name: "Phường Ngọc Khánh", full_name_en: "Ngoc Khanh Ward", code_name: "ngoc_khanh", district_code: 1, province_code: 1 },
      { code: 34, name: "Kim Mã", name_en: "Kim Ma", full_name: "Phường Kim Mã", full_name_en: "Kim Ma Ward", code_name: "kim_ma", district_code: 1, province_code: 1 },
      { code: 37, name: "Giảng Võ", name_en: "Giang Vo", full_name: "Phường Giảng Võ", full_name_en: "Giang Vo Ward", code_name: "giang_vo", district_code: 1, province_code: 1 },
      { code: 40, name: "Thành Công", name_en: "Thanh Cong", full_name: "Phường Thành Công", full_name_en: "Thanh Cong Ward", code_name: "thanh_cong", district_code: 1, province_code: 1 },
    ],
    
    2: [ // Hoàn Kiếm - 18 phường
      { code: 43, name: "Phúc Tân", name_en: "Phuc Tan", full_name: "Phường Phúc Tân", full_name_en: "Phuc Tan Ward", code_name: "phuc_tan", district_code: 2, province_code: 1 },
      { code: 46, name: "Đồng Xuân", name_en: "Dong Xuan", full_name: "Phường Đồng Xuân", full_name_en: "Dong Xuan Ward", code_name: "dong_xuan", district_code: 2, province_code: 1 },
      { code: 49, name: "Hàng Mã", name_en: "Hang Ma", full_name: "Phường Hàng Mã", full_name_en: "Hang Ma Ward", code_name: "hang_ma", district_code: 2, province_code: 1 },
      { code: 52, name: "Hàng Buồm", name_en: "Hang Buom", full_name: "Phường Hàng Buồm", full_name_en: "Hang Buom Ward", code_name: "hang_buom", district_code: 2, province_code: 1 },
      { code: 55, name: "Hàng Đào", name_en: "Hang Dao", full_name: "Phường Hàng Đào", full_name_en: "Hang Dao Ward", code_name: "hang_dao", district_code: 2, province_code: 1 },
      { code: 58, name: "Hàng Bồ", name_en: "Hang Bo", full_name: "Phường Hàng Bồ", full_name_en: "Hang Bo Ward", code_name: "hang_bo", district_code: 2, province_code: 1 },
      { code: 61, name: "Cửa Đông", name_en: "Cua Dong", full_name: "Phường Cửa Đông", full_name_en: "Cua Dong Ward", code_name: "cua_dong", district_code: 2, province_code: 1 },
      { code: 64, name: "Lý Thái Tổ", name_en: "Ly Thai To", full_name: "Phường Lý Thái Tổ", full_name_en: "Ly Thai To Ward", code_name: "ly_thai_to", district_code: 2, province_code: 1 },
      { code: 67, name: "Hàng Bạc", name_en: "Hang Bac", full_name: "Phường Hàng Bạc", full_name_en: "Hang Bac Ward", code_name: "hang_bac", district_code: 2, province_code: 1 },
      { code: 70, name: "Hàng Gai", name_en: "Hang Gai", full_name: "Phường Hàng Gai", full_name_en: "Hang Gai Ward", code_name: "hang_gai", district_code: 2, province_code: 1 },
      { code: 73, name: "Chương Dương", name_en: "Chuong Duong", full_name: "Phường Chương Dương", full_name_en: "Chuong Duong Ward", code_name: "chuong_duong", district_code: 2, province_code: 1 },
      { code: 76, name: "Hàng Trống", name_en: "Hang Trong", full_name: "Phường Hàng Trống", full_name_en: "Hang Trong Ward", code_name: "hang_trong", district_code: 2, province_code: 1 },
      { code: 79, name: "Cửa Nam", name_en: "Cua Nam", full_name: "Phường Cửa Nam", full_name_en: "Cua Nam Ward", code_name: "cua_nam", district_code: 2, province_code: 1 },
      { code: 82, name: "Hàng Bài", name_en: "Hang Bai", full_name: "Phường Hàng Bài", full_name_en: "Hang Bai Ward", code_name: "hang_bai", district_code: 2, province_code: 1 },
      { code: 85, name: "Tràng Tiền", name_en: "Trang Tien", full_name: "Phường Tràng Tiền", full_name_en: "Trang Tien Ward", code_name: "trang_tien", district_code: 2, province_code: 1 },
      { code: 88, name: "Trần Hưng Đạo", name_en: "Tran Hung Dao", full_name: "Phường Trần Hưng Đạo", full_name_en: "Tran Hung Dao Ward", code_name: "tran_hung_dao", district_code: 2, province_code: 1 },
      { code: 91, name: "Phan Chu Trinh", name_en: "Phan Chu Trinh", full_name: "Phường Phan Chu Trinh", full_name_en: "Phan Chu Trinh Ward", code_name: "phan_chu_trinh", district_code: 2, province_code: 1 },
      { code: 94, name: "Hàng Bông", name_en: "Hang Bong", full_name: "Phường Hàng Bông", full_name_en: "Hang Bong Ward", code_name: "hang_bong", district_code: 2, province_code: 1 },
    ],

    9: [ // Thanh Xuân - 11 phường
      { code: 400, name: "Nhân Chính", name_en: "Nhan Chinh", full_name: "Phường Nhân Chính", full_name_en: "Nhan Chinh Ward", code_name: "nhan_chinh", district_code: 9, province_code: 1 },
      { code: 403, name: "Thượng Đình", name_en: "Thuong Dinh", full_name: "Phường Thượng Đình", full_name_en: "Thuong Dinh Ward", code_name: "thuong_dinh", district_code: 9, province_code: 1 },
      { code: 406, name: "Khương Thượng", name_en: "Khuong Thuong", full_name: "Phường Khương Thượng", full_name_en: "Khuong Thuong Ward", code_name: "khuong_thuong", district_code: 9, province_code: 1 },
      { code: 409, name: "Khương Đình", name_en: "Khuong Dinh", full_name: "Phường Khương Đình", full_name_en: "Khuong Dinh Ward", code_name: "khuong_dinh", district_code: 9, province_code: 1 },
      { code: 412, name: "Thanh Xuân Trung", name_en: "Thanh Xuan Trung", full_name: "Phường Thanh Xuân Trung", full_name_en: "Thanh Xuan Trung Ward", code_name: "thanh_xuan_trung", district_code: 9, province_code: 1 },
      { code: 415, name: "Thanh Xuân Bắc", name_en: "Thanh Xuan Bac", full_name: "Phường Thanh Xuân Bắc", full_name_en: "Thanh Xuan Bac Ward", code_name: "thanh_xuan_bac", district_code: 9, province_code: 1 },
      { code: 418, name: "Thanh Xuân Nam", name_en: "Thanh Xuan Nam", full_name: "Phường Thanh Xuân Nam", full_name_en: "Thanh Xuan Nam Ward", code_name: "thanh_xuan_nam", district_code: 9, province_code: 1 },
      { code: 421, name: "Kim Giang", name_en: "Kim Giang", full_name: "Phường Kim Giang", full_name_en: "Kim Giang Ward", code_name: "kim_giang", district_code: 9, province_code: 1 },
      { code: 424, name: "Khương Mai", name_en: "Khuong Mai", full_name: "Phường Khương Mai", full_name_en: "Khuong Mai Ward", code_name: "khuong_mai", district_code: 9, province_code: 1 },
      { code: 427, name: "Hạ Đình", name_en: "Ha Dinh", full_name: "Phường Hạ Đình", full_name_en: "Ha Dinh Ward", code_name: "ha_dinh", district_code: 9, province_code: 1 },
      { code: 430, name: "Phương Liệt", name_en: "Phuong Liet", full_name: "Phường Phương Liệt", full_name_en: "Phuong Liet Ward", code_name: "phuong_liet", district_code: 9, province_code: 1 },
    ],

    // TP.HCM - Các quận chính
    760: [ // Quận 1 - 10 phường
      { code: 26734, name: "Tân Định", name_en: "Tan Dinh", full_name: "Phường Tân Định", full_name_en: "Tan Dinh Ward", code_name: "tan_dinh", district_code: 760, province_code: 79 },
      { code: 26737, name: "Đa Kao", name_en: "Da Kao", full_name: "Phường Đa Kao", full_name_en: "Da Kao Ward", code_name: "da_kao", district_code: 760, province_code: 79 },
      { code: 26740, name: "Bến Nghé", name_en: "Ben Nghe", full_name: "Phường Bến Nghé", full_name_en: "Ben Nghe Ward", code_name: "ben_nghe", district_code: 760, province_code: 79 },
      { code: 26743, name: "Bến Thành", name_en: "Ben Thanh", full_name: "Phường Bến Thành", full_name_en: "Ben Thanh Ward", code_name: "ben_thanh", district_code: 760, province_code: 79 },
      { code: 26746, name: "Nguyễn Thái Bình", name_en: "Nguyen Thai Binh", full_name: "Phường Nguyễn Thái Bình", full_name_en: "Nguyen Thai Binh Ward", code_name: "nguyen_thai_binh", district_code: 760, province_code: 79 },
      { code: 26749, name: "Phạm Ngũ Lão", name_en: "Pham Ngu Lao", full_name: "Phường Phạm Ngũ Lão", full_name_en: "Pham Ngu Lao Ward", code_name: "pham_ngu_lao", district_code: 760, province_code: 79 },
      { code: 26752, name: "Cầu Ông Lãnh", name_en: "Cau Ong Lanh", full_name: "Phường Cầu Ông Lãnh", full_name_en: "Cau Ong Lanh Ward", code_name: "cau_ong_lanh", district_code: 760, province_code: 79 },
      { code: 26755, name: "Cô Giang", name_en: "Co Giang", full_name: "Phường Cô Giang", full_name_en: "Co Giang Ward", code_name: "co_giang", district_code: 760, province_code: 79 },
      { code: 26758, name: "Nguyễn Cư Trinh", name_en: "Nguyen Cu Trinh", full_name: "Phường Nguyễn Cư Trinh", full_name_en: "Nguyen Cu Trinh Ward", code_name: "nguyen_cu_trinh", district_code: 760, province_code: 79 },
      { code: 26761, name: "Cầu Kho", name_en: "Cau Kho", full_name: "Phường Cầu Kho", full_name_en: "Cau Kho Ward", code_name: "cau_kho", district_code: 760, province_code: 79 },
    ]
  };
  
  return fallbackData[districtCode] || [
    { code: 99999, name: "Phường mẫu", name_en: "Sample Ward", full_name: "Phường mẫu", full_name_en: "Sample Ward", code_name: "sample_ward", district_code: districtCode, province_code: 0 }
  ];
};

// Helper functions to get names by code
export const getProvinceNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/p/${code}`);
    if (!response.ok) return `Province ${code}`;
    const data = await response.json();
    return data.name || `Province ${code}`;
  } catch (error) {
    return `Province ${code}`;
  }
};

export const getDistrictNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/d/${code}`);
    if (!response.ok) return `District ${code}`;
    const data = await response.json();
    return data.name || `District ${code}`;
  } catch (error) {
    return `District ${code}`;
  }
};

export const getWardNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/w/${code}`);
    if (!response.ok) return `Ward ${code}`;
    const data = await response.json();
    return data.name || `Ward ${code}`;
  } catch (error) {
    return `Ward ${code}`;
  }
};
