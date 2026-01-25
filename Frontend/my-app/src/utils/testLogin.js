// Test Login Flow
console.log("🧪 Test Login Script Loaded");

// Test login function
async function testLogin() {
    console.log("🧪 === TESTING LOGIN FLOW ===");
    
    try {
        // Clear any existing tokens
        localStorage.clear();
        console.log("🧹 Cleared localStorage");
        
        // Test login API call
        const loginData = {
            login: "user@gmail.com",
            password: "password"
        };
        
        console.log("🔐 Testing login with:", loginData);
        
        // Make API call
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        console.log("📡 Response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Login successful:", data);
            
            // Test token storage
            console.log("💾 Testing token storage...");
            
            // Simulate TokenManager.setToken
            if (data.user.role === 1) {
                localStorage.setItem("admin_token", data.token);
                localStorage.setItem("role", "1");
            } else {
                localStorage.setItem("user_token", data.token);
                localStorage.setItem("role", "0");
            }
            
            localStorage.setItem("user", JSON.stringify(data.user));
            
            console.log("📦 localStorage after login:");
            console.log("  - user_token:", localStorage.getItem("user_token") ? "Có" : "Không");
            console.log("  - admin_token:", localStorage.getItem("admin_token") ? "Có" : "Không");
            console.log("  - role:", localStorage.getItem("role"));
            console.log("  - user:", localStorage.getItem("user") ? "Có" : "Không");
            
        } else {
            const errorData = await response.json();
            console.log("❌ Login failed:", errorData);
        }
        
    } catch (error) {
        console.error("❌ Test login error:", error);
    }
    
    console.log("🧪 === END TEST ===");
}

// Test RequireAuth logic
function testRequireAuth() {
    console.log("🔒 === TESTING REQUIRE AUTH LOGIC ===");
    
    const currentPath = window.location.pathname;
    const isAdminContext = currentPath.startsWith("/admin");
    const role = localStorage.getItem("role");
    const userToken = localStorage.getItem("user_token");
    const adminToken = localStorage.getItem("admin_token");
    
    console.log("Current path:", currentPath);
    console.log("Is admin context:", isAdminContext);
    console.log("Role:", role);
    console.log("User token:", userToken ? "Có" : "Không");
    console.log("Admin token:", adminToken ? "Có" : "Không");
    
    if (isAdminContext) {
        if (role === "1" && adminToken) {
            console.log("✅ Should allow admin access");
        } else {
            console.log("❌ Should redirect to admin login");
        }
    } else {
        if (userToken) {
            console.log("✅ Should allow user access");
        } else {
            console.log("❌ Should redirect to login");
        }
    }
    
    console.log("🔒 === END TEST ===");
}

// Export to window
window.testLogin = testLogin;
window.testRequireAuth = testRequireAuth;

console.log("🧪 Test functions available:");
console.log("  - testLogin() - Test login API and token storage");
console.log("  - testRequireAuth() - Test RequireAuth logic");
