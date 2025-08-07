// Advanced Cart Debug - Kiểm tra tất cả nguồn dữ liệu giỏ hàng
console.log("=== ADVANCED CART DEBUG ===");

// 1. Check localStorage cart data
console.log("1. LocalStorage Cart Data:");
const cartItems = localStorage.getItem("cartItems");
console.log("- cartItems:", cartItems);
if (cartItems) {
  try {
    const parsed = JSON.parse(cartItems);
    console.log("- parsed cartItems:", parsed);
    parsed.forEach((item, index) => {
      console.log(`  [${index}] ID: ${item.id} - Name: ${item.name} - Variant ID: ${item.variant_id}`);
    });
  } catch (error) {
    console.error("Error parsing cartItems:", error);
  }
}

// 2. Check current user token
const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token") || localStorage.getItem("token");
console.log("2. Current token:", token ? "EXISTS" : "NOT FOUND");

// 3. API call to get cart from backend
if (token) {
  console.log("3. Fetching cart from backend...");
  
  fetch("http://localhost:8000/api/cart", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    console.log("- API Response status:", response.status);
    return response.json();
  })
  .then(data => {
    console.log("- API Response data:", data);
    
    if (data.cartItems && Array.isArray(data.cartItems)) {
      console.log("- Cart items from backend:");
      data.cartItems.forEach((item, index) => {
        console.log(`  [${index}]`, {
          id: item.id,
          cart_id: item.cart_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          variant: item.variant ? {
            id: item.variant.id,
            product_name: item.variant.product?.name,
            color_name: item.variant.color?.name,
            size_name: item.variant.size?.name
          } : 'NO VARIANT DATA'
        });
      });
    }
  })
  .catch(error => {
    console.error("- API Error:", error);
  });
} else {
  console.log("3. No token found - skipping API call");
}

// 4. Check if there are any stored product IDs that shouldn't be there
console.log("4. Checking for unexpected product IDs...");
setTimeout(() => {
  // This will log after API call completes
  console.log("=== DEBUG COMPLETE - Check the logs above ===");
}, 2000);
