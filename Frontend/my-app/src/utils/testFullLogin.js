// Test Full Login Flow
console.log("🧪 Test Full Login Script Loaded");

// Test complete login flow
async function testFullLogin() {
    console.log("🧪 === TESTING FULL LOGIN FLOW ===");
    
    try {
        // Step 1: Clear localStorage
        localStorage.clear();
        console.log("1️⃣ Cleared localStorage");
        
        // Step 2: Test CSRF cookie
        console.log("2️⃣ Testing CSRF cookie...");
        const csrfResponse = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'include'
        });
        console.log("CSRF Response status:", csrfResponse.status);
        
        // Step 3: Test login API directly
        console.log("3️⃣ Testing login API directly...");
        const loginData = {
            login: "user@gmail.com",
            password: "password"
        };
        
        const loginResponse = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        console.log("Login Response status:", loginResponse.status);
        
        if (loginResponse.ok) {
            const data = await loginResponse.json();
            console.log("✅ Login successful:", data);
            
            // Step 4: Test token storage
            console.log("4️⃣ Testing token storage...");
            
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
            
            // Step 5: Test RequireAuth logic
            console.log("5️⃣ Testing RequireAuth logic...");
            testRequireAuth();
            
        } else {
            const errorData = await loginResponse.json();
            console.log("❌ Login failed:", errorData);
        }
        
    } catch (error) {
        console.error("❌ Test error:", error);
    }
    
    console.log("🧪 === END TEST ===");
}

// Test axios login
async function testAxiosLogin() {
    console.log("🌐 === TESTING AXIOS LOGIN ===");
    
    try {
        // Clear localStorage
        localStorage.clear();
        console.log("1️⃣ Cleared localStorage");
        
        // Import axios if available
        if (window.axios) {
            console.log("2️⃣ Using window.axios");
            
            const loginData = {
                login: "user@gmail.com",
                password: "password"
            };
            
            const response = await window.axios.post('http://127.0.0.1:8000/api/login', loginData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log("✅ Axios login successful:", response.data);
            
        } else {
            console.log("❌ window.axios not available");
        }
        
    } catch (error) {
        console.error("❌ Axios login error:", error);
        console.error("Error response:", error.response?.data);
    }
    
    console.log("🌐 === END TEST ===");
}

// Export to window
window.testFullLogin = testFullLogin;
window.testAxiosLogin = testAxiosLogin;

console.log("🧪 Full login test functions available:");
console.log("  - testFullLogin() - Test complete login flow");
console.log("  - testAxiosLogin() - Test axios login");

