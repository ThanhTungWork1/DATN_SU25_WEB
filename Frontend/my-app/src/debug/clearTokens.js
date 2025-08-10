// Script để xóa tất cả tokens và reset trạng thái
console.log("=== CLEARING ALL TOKENS ===");

// 1. Clear localStorage
const keysToRemove = [
  'user_token',
  'admin_token', 
  'token',
  'role',
  'user',
  'admin_user'
];

keysToRemove.forEach(key => {
  const oldValue = localStorage.getItem(key);
  localStorage.removeItem(key);
  console.log(`Removed ${key}:`, oldValue);
});

// 2. Use TokenManager to clear
try {
  const { TokenManager } = await import("../utils/tokenUtils.js");
  TokenManager.clearAllTokens();
  console.log("TokenManager.clearAllTokens() called");
} catch (error) {
  console.error("TokenManager error:", error);
}

// 3. Verify clean state
console.log("=== VERIFICATION ===");
keysToRemove.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value);
});

console.log("=== TOKENS CLEARED ===");
console.log("Please refresh the page and login again.");

// 4. Redirect to home page
setTimeout(() => {
  window.location.href = "/";
}, 2000);




