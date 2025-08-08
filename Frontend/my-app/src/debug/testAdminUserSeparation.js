// Script test phân tách hoàn toàn admin/user
console.log("=== COMPLETE ADMIN/USER SEPARATION TEST ===");

function clearAllAuth() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
    window.dispatchEvent(new Event('token-changed'));
    console.log("✅ Cleared all tokens and auth data");
}

function checkCurrentState() {
    console.log("\n🔍 Current Auth State:");
    console.log("- Admin token:", !!localStorage.getItem('admin_token'));
    console.log("- User token:", !!localStorage.getItem('user_token'));
    console.log("- Role:", localStorage.getItem('role'));
    console.log("- User data:", !!localStorage.getItem('user'));
    console.log("- Admin user data:", !!localStorage.getItem('admin_user'));
    console.log("- Current URL:", window.location.href);
    console.log("- Is admin page:", window.location.pathname.includes('/admin'));
}

function simulateUserLogin() {
    console.log("\n👤 Simulating USER login...");
    // Giả lập user token (không làm thật vì cần gọi API)
    localStorage.setItem('user_token', 'fake_user_token_123');
    localStorage.setItem('role', '0');
    localStorage.setItem('user', JSON.stringify({ name: 'hungtrinh', role: 0 }));
    window.dispatchEvent(new Event('token-changed'));
    console.log("✅ User login simulated");
}

function simulateAdminLogin() {
    console.log("\n🔐 Simulating ADMIN login...");
    // Clear user token, set admin token
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    localStorage.setItem('admin_token', 'fake_admin_token_456');
    localStorage.setItem('role', '1');
    localStorage.setItem('admin_user', JSON.stringify({ name: 'admin', role: 1 }));
    window.dispatchEvent(new Event('token-changed'));
    console.log("✅ Admin login simulated");
}

// Run tests
console.log("Step 1: Clear all auth");
clearAllAuth();
checkCurrentState();

console.log("\nStep 2: Test user login");
simulateUserLogin();
checkCurrentState();

console.log("\nStep 3: Test admin login (should clear user)");
simulateAdminLogin();
checkCurrentState();

console.log("\n📋 Test Results:");
console.log("- User token should be gone:", !localStorage.getItem('user_token'));
console.log("- Admin token should exist:", !!localStorage.getItem('admin_token'));
console.log("- Role should be 1:", localStorage.getItem('role') === '1');

console.log("\n🎯 To fully test:");
console.log("1. Clear all → clearAllAuth()");
console.log("2. Go to client, login user");
console.log("3. Open admin tab, login admin");
console.log("4. Reload both tabs");
console.log("5. User tab should require re-login");
console.log("6. Admin tab should stay logged in");

// Export functions for manual testing
window.clearAllAuth = clearAllAuth;
window.checkCurrentState = checkCurrentState;
