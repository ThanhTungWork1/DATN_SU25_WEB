// Validate query tìm kiếm (có thể mở rộng thêm logic nâng cao)
export function validateSearchQuery(query: string): boolean {
  // Không được rỗng, không toàn khoảng trắng
  return query.trim().length > 0;
  // TODO: Thêm kiểm tra ký tự đặc biệt, độ dài tối đa, ...
} 