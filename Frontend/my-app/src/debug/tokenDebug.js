// Debug script để kiểm tra token trong localStorage
// Chạy script này trong browser console

console.log("=== TOKEN DEBUG ===");
console.log("token:", localStorage.getItem("token"));
console.log("user_token:", localStorage.getItem("user_token"));
console.log("admin_token:", localStorage.getItem("admin_token"));
console.log("role:", localStorage.getItem("role"));
console.log("user:", localStorage.getItem("user"));

// Kiểm tra tất cả keys trong localStorage
console.log("\n=== ALL LOCALSTORAGE KEYS ===");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
}

// Test API call với token hiện tại
const testToken = localStorage.getItem("token") || localStorage.getItem("user_token");
if (testToken) {
    console.log("\n=== TESTING API CALL ===");
    console.log("Using token:", testToken);
    
    fetch('http://localhost:8000/api/auth-test', {
        headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("API Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("API Response data:", data);
    })
    .catch(error => {
        console.error("API Error:", error);
    });
} else {
    console.log("❌ NO TOKEN FOUND!");
}
