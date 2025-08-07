// Clear cart from frontend và backend
console.log("=== CLEARING CART (Frontend + Backend) ===");

// 1. Clear localStorage cart data
localStorage.removeItem("cartItems");
console.log("✅ Cleared localStorage cartItems");

// 2. Call backend API to clear cart
const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token") || localStorage.getItem("token");

if (token) {
  console.log("🔄 Calling backend clearCart API...");
  
  fetch("http://localhost:8000/api/cart", {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    console.log("Backend clearCart response status:", response.status);
    return response.json();
  })
  .then(data => {
    console.log("✅ Backend clearCart response:", data);
  })
  .catch(error => {
    console.error("❌ Backend clearCart error:", error);
  });
} else {
  console.log("⚠️ No token found - skipping backend call");
}

// 3. Refresh page after 2 seconds
setTimeout(() => {
  console.log("🔄 Refreshing page...");
  window.location.reload();
}, 2000);

console.log("=== CLEAR INITIATED ===");
