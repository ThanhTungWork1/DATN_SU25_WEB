// Test script cho admin login
export const testAdminLogin = () => {
  console.log("🧪 Testing Admin Login Flow...");

  // Test 1: Kiểm tra localStorage hiện tại
  console.log("📋 Current localStorage:");
  console.log(
    "  - admin_token:",
    localStorage.getItem("admin_token") ? "Có" : "Không"
  );
  console.log(
    "  - user_token:",
    localStorage.getItem("user_token") ? "Có" : "Không"
  );
  console.log("  - role:", localStorage.getItem("role"));
  console.log(
    "  - admin_user:",
    localStorage.getItem("admin_user") ? "Có" : "Không"
  );
  console.log("  - user:", localStorage.getItem("user") ? "Có" : "Không");

  // Test 2: Kiểm tra URL hiện tại
  console.log("🌐 Current URL:", window.location.pathname);

  // Test 3: Kiểm tra TokenManager
  const { TokenManager } = require("./tokenUtils");
  console.log(
    "🔐 TokenManager.getToken():",
    TokenManager.getToken() ? "Có token" : "Không có token"
  );
  console.log(
    "🔐 TokenManager.getAdminToken():",
    TokenManager.getAdminToken() ? "Có admin token" : "Không có admin token"
  );
  console.log(
    "🔐 TokenManager.getUserToken():",
    TokenManager.getUserToken() ? "Có user token" : "Không có user token"
  );

  // Test 4: Kiểm tra routing
  console.log("🛣️  Available routes:");
  console.log("  - /login (admin & user login)");
  console.log("  - /admin/dashboard (should be protected)");

  return {
    hasAdminToken: !!localStorage.getItem("admin_token"),
    hasUserToken: !!localStorage.getItem("user_token"),
    role: localStorage.getItem("role"),
    currentPath: window.location.pathname,
    isAdminContext: window.location.pathname.startsWith("/admin"),
  };
};

// Function để clear localStorage và test từ đầu
export const clearAndTestAdminLogin = () => {
  console.log("🧹 Clearing localStorage...");
  localStorage.clear();
  console.log("✅ localStorage đã được clear");

  console.log("🧪 Bây giờ hãy:");
  console.log("1. Truy cập /login");
  console.log("2. Đăng nhập với tài khoản admin");
  console.log("3. Chạy testAdminLogin() để kiểm tra");
};

// Export to window for console access
if (typeof window !== "undefined") {
  (window as any).testAdminLogin = testAdminLogin;
  (window as any).clearAndTestAdminLogin = clearAndTestAdminLogin;
}
