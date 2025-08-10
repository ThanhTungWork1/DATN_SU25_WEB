// Test script để kiểm tra phân tách token admin/user
console.log("=== TEST TOKEN SEPARATION ===");

// Import TokenManager (giả sử có sẵn)
console.log("Current tokens in localStorage:");
console.log("- admin_token:", localStorage.getItem('admin_token'));
console.log("- user_token:", localStorage.getItem('user_token'));
console.log("- legacy token:", localStorage.getItem('token'));

console.log("\nCurrent URL:", window.location.href);

// Kiểm tra context hiện tại
const isAdminPage = window.location.pathname.includes('/admin');
console.log("Is admin page:", isAdminPage);

if (isAdminPage) {
    console.log("📋 ADMIN CONTEXT - Should use admin_token only");
    console.log("- Admin token available:", !!localStorage.getItem('admin_token'));
    console.log("- User token (should be ignored):", !!localStorage.getItem('user_token'));
} else {
    console.log("👤 CLIENT CONTEXT - Should use user_token only");
    console.log("- User token available:", !!localStorage.getItem('user_token'));
    console.log("- Admin token (should be ignored):", !!localStorage.getItem('admin_token'));
}

// Test script để clear conflict
console.log("\n🔧 To fix conflicts, run:");
console.log("// Clear all tokens:");
console.log("localStorage.removeItem('admin_token');");
console.log("localStorage.removeItem('user_token');");
console.log("localStorage.removeItem('token');");
console.log("window.location.reload();");




