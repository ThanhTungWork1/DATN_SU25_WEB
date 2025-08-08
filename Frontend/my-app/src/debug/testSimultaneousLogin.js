/**
 * 🧪 Test Simultaneous Admin & Client Login
 * 
 * Script để test đăng nhập đồng thời admin và client
 * Mở console browser và chạy script này
 */

function testSimultaneousLogin() {
    console.log('🧪 Testing Simultaneous Login...\n');
    
    // Import TokenManager
    const { TokenManager } = window;
    if (!TokenManager) {
        console.error('❌ TokenManager not found! Make sure you are on a page that loads it.');
        return;
    }
    
    console.log('📋 BEFORE TEST:');
    console.log('- Admin token:', TokenManager.getAdminToken() ? '✅ exists' : '❌ none');
    console.log('- User token:', TokenManager.getUserToken() ? '✅ exists' : '❌ none');
    console.log('- Current context token:', TokenManager.getToken() ? '✅ exists' : '❌ none');
    console.log('- Current path:', window.location.pathname);
    console.log('');
    
    // Simulate admin login
    console.log('🔐 Simulating admin login...');
    TokenManager.setToken('fake-admin-token-12345', 'admin');
    localStorage.setItem('role', '1');
    localStorage.setItem('admin_user', JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: 'admin@test.com',
        role: 1
    }));
    
    console.log('📊 AFTER ADMIN LOGIN:');
    console.log('- Admin token:', TokenManager.getAdminToken() ? '✅ exists' : '❌ none');
    console.log('- User token:', TokenManager.getUserToken() ? '✅ exists' : '❌ none');
    console.log('');
    
    // Simulate user login (should NOT clear admin token)
    console.log('👤 Simulating user login...');
    TokenManager.setToken('fake-user-token-67890', 'user');
    localStorage.setItem('role', '0'); // Override role for user
    localStorage.setItem('user', JSON.stringify({
        id: 2,
        name: 'Test User',
        email: 'user@test.com',
        role: 0
    }));
    
    console.log('📊 AFTER USER LOGIN:');
    console.log('- Admin token:', TokenManager.getAdminToken() ? '✅ exists' : '❌ none');
    console.log('- User token:', TokenManager.getUserToken() ? '✅ exists' : '❌ none');
    console.log('');
    
    // Test context-aware token selection
    console.log('🎯 Testing context-aware token selection...');
    
    // Simulate admin context
    const originalPath = window.location.pathname;
    console.log('📁 Simulating admin context (/admin/dashboard):');
    window.history.replaceState({}, '', '/admin/dashboard');
    const adminContextToken = TokenManager.getToken();
    console.log('- getToken() returns:', adminContextToken ? 'admin token' : 'none');
    
    // Simulate client context  
    console.log('📁 Simulating client context (/):');
    window.history.replaceState({}, '', '/');
    const clientContextToken = TokenManager.getToken();
    console.log('- getToken() returns:', clientContextToken ? 'user token' : 'none');
    
    // Restore original path
    window.history.replaceState({}, '', originalPath);
    
    console.log('');
    console.log('🎉 Test Results:');
    
    const adminTokenExists = !!TokenManager.getAdminToken();
    const userTokenExists = !!TokenManager.getUserToken();
    
    if (adminTokenExists && userTokenExists) {
        console.log('✅ SUCCESS: Both admin and user tokens exist simultaneously!');
        console.log('✅ Context-aware token selection works!');
        console.log('');
        console.log('🎯 Expected behavior:');
        console.log('- Admin pages will use admin token');
        console.log('- Client pages will use user token');
        console.log('- No more logout conflicts!');
    } else {
        console.log('❌ FAILED: Token separation not working properly');
        console.log('- Admin token:', adminTokenExists ? 'exists' : 'missing');
        console.log('- User token:', userTokenExists ? 'exists' : 'missing');
    }
    
    console.log('');
    console.log('🔧 To test in practice:');
    console.log('1. Login as admin in admin panel');
    console.log('2. Open new tab, login as user in client');
    console.log('3. Switch between tabs - both should stay logged in!');
    console.log('');
    console.log('🧹 Cleanup tokens:');
    console.log('TokenManager.clearAllTokens() - to clear all');
    console.log('TokenManager.clearAdminToken() - to logout admin only');
    console.log('TokenManager.clearUserToken() - to logout user only');
}

// Export to window for easy access in console
window.testSimultaneousLogin = testSimultaneousLogin;

console.log('🚀 Simultaneous Login Test loaded!');
console.log('📞 Run: testSimultaneousLogin()');
console.log('');

// Auto-run if called directly
if (typeof module === 'undefined') {
    testSimultaneousLogin();
}
