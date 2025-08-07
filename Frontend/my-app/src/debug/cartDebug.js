// Debug script để kiểm tra Cart API
// Chạy script này trong browser console

console.log("=== CART API DEBUG ===");

const testToken = localStorage.getItem("token") || localStorage.getItem("user_token");
if (!testToken) {
    console.log("❌ NO TOKEN FOUND!");
} else {
    console.log("Using token:", testToken);
    
    // Test GET cart
    console.log("\n=== TESTING GET CART ===");
    fetch('http://localhost:8000/api/cart', {
        headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("GET Cart Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("GET Cart Response data:", data);
        console.log("Cart items structure:", JSON.stringify(data, null, 2));
        
        // Kiểm tra các đường dẫn có thể có
        console.log("\n=== CHECKING POSSIBLE PATHS ===");
        console.log("data.cartItems:", data.cartItems);
        console.log("data.cart_items:", data.cart_items);
        console.log("data.cart:", data.cart);
        if (data.cart) {
            console.log("data.cart.cartItems:", data.cart.cartItems);
            console.log("data.cart.cart_items:", data.cart.cart_items);
        }
    })
    .catch(error => {
        console.error("GET Cart Error:", error);
    });
}
