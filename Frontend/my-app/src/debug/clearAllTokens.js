// Debug script để clear tất cả tokens và reset trạng thái
console.log("=== CLEARING ALL TOKENS ===");

// Clear tất cả tokens
localStorage.removeItem('user_token');
localStorage.removeItem('admin_token'); 
localStorage.removeItem('token');

// Clear user data
localStorage.removeItem('user');
localStorage.removeItem('admin_user');
localStorage.removeItem('role');

// Dispatch event để component update
window.dispatchEvent(new Event('token-changed'));

console.log("✅ Đã clear tất cả tokens và data");
console.log("Current localStorage:", {
  user_token: localStorage.getItem('user_token'),
  admin_token: localStorage.getItem('admin_token'),
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user'),
  admin_user: localStorage.getItem('admin_user'),
  role: localStorage.getItem('role')
});

console.log("🔄 Refresh trang để thấy thay đổi...");
window.location.reload();




