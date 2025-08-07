// Debug script to check current user info
console.log("=== USER DEBUG INFO ===");

// Check localStorage
console.log("1. LocalStorage:");
console.log("- user_token:", localStorage.getItem("user_token"));
console.log("- admin_token:", localStorage.getItem("admin_token")); 
console.log("- token (legacy):", localStorage.getItem("token"));
console.log("- role:", localStorage.getItem("role"));
console.log("- user:", localStorage.getItem("user"));
console.log("- admin_user:", localStorage.getItem("admin_user"));

// Check TokenManager
try {
  const { TokenManager } = await import("../utils/tokenUtils.js");
  console.log("2. TokenManager:");
  console.log("- Current token:", TokenManager.getToken());
  console.log("- Current role:", TokenManager.getRole());
} catch (error) {
  console.error("TokenManager error:", error);
}

// Test API call to /me
try {
  const response = await fetch("http://localhost:8000/api/me", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("user_token") || localStorage.getItem("admin_token") || localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    }
  });
  
  if (response.ok) {
    const userData = await response.json();
    console.log("3. API /me response:", userData);
    console.log("- User ID:", userData.id);
    console.log("- User Name:", userData.name);
    console.log("- User Email:", userData.email);
    console.log("- User Role:", userData.role);
  } else {
    console.error("API /me failed:", response.status, response.statusText);
  }
} catch (error) {
  console.error("API call error:", error);
}

console.log("=== END DEBUG ===");
