// Utility để test authentication
export const testAuth = () => {
  const adminToken = localStorage.getItem("admin_token");
  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");

  console.log("=== AUTH TEST ===");
  console.log("Admin Token:", adminToken ? "✅ Present" : "❌ Missing");
  console.log("Role:", role || "❌ Missing");
  console.log("User:", user ? "✅ Present" : "❌ Missing");
  
  if (adminToken) {
    console.log("Token preview:", adminToken.substring(0, 20) + "...");
  }
  
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log("User role:", userObj.role);
    } catch (e) {
      console.log("Invalid user data");
    }
  }
  
  console.log("==================");
  
  return {
    hasToken: !!adminToken,
    hasRole: !!role,
    hasUser: !!user,
    role: role
  };
};

export const clearAuth = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  console.log("Auth data cleared");
};

// Thêm vào window để có thể gọi từ console
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuth;
  (window as any).clearAuth = clearAuth;
} 