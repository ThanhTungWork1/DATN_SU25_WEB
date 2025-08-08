/**
 * 🛒 Check Payment Authentication Status
 * 
 * Script to debug payment authentication issues
 */

function checkPaymentAuth() {
    console.log('🛒 Payment Authentication Debug');
    console.log('==============================\n');
    
    // Check TokenManager
    const { TokenManager } = window;
    if (!TokenManager) {
        console.error('❌ TokenManager not found!');
        return;
    }
    
    console.log('🔍 Current Authentication State:');
    console.log('--------------------------------');
    
    // Check tokens
    const userToken = TokenManager.getUserToken();
    const adminToken = TokenManager.getAdminToken();
    const contextToken = TokenManager.getToken();
    
    console.log('🔑 Tokens:');
    console.log('- User token:', userToken ? '✅ exists' : '❌ none');
    console.log('- Admin token:', adminToken ? '✅ exists' : '❌ none');
    console.log('- Context token:', contextToken ? '✅ exists' : '❌ none');
    console.log('');
    
    // Check localStorage data
    const userStr = localStorage.getItem('user');
    const adminUserStr = localStorage.getItem('admin_user');
    const role = localStorage.getItem('role');
    
    console.log('💾 LocalStorage:');
    console.log('- user data:', userStr ? '✅ exists' : '❌ none');
    console.log('- admin_user data:', adminUserStr ? '✅ exists' : '❌ none');
    console.log('- role:', role || 'none');
    console.log('');
    
    // Parse user data
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log('👤 User Data:');
            console.log('- Name:', user.name || user.username || 'N/A');
            console.log('- Email:', user.email || 'N/A');
            console.log('- Role:', user.role || 'N/A');
            console.log('');
        } catch (e) {
            console.error('❌ Error parsing user data:', e);
        }
    }
    
    // Check current page context
    const currentPath = window.location.pathname;
    const isAdminContext = currentPath.startsWith('/admin');
    const isCheckoutPage = currentPath.includes('/checkout');
    
    console.log('🌐 Current Context:');
    console.log('- Path:', currentPath);
    console.log('- Admin context:', isAdminContext ? 'Yes' : 'No');
    console.log('- Checkout page:', isCheckoutPage ? 'Yes' : 'No');
    console.log('');
    
    // Payment auth logic simulation
    console.log('🛒 Payment Auth Logic Check:');
    console.log('-----------------------------');
    
    const canProceedPayment = userToken && userStr;
    
    if (canProceedPayment) {
        console.log('✅ PAYMENT ALLOWED');
        console.log('- User is properly authenticated');
        console.log('- Has user token');
        console.log('- Has user data');
    } else {
        console.log('❌ PAYMENT BLOCKED');
        console.log('- Missing user token:', !userToken);
        console.log('- Missing user data:', !userStr);
        console.log('- Would redirect to /login');
    }
    
    console.log('');
    
    // Recommendations
    console.log('💡 Recommendations:');
    console.log('------------------');
    
    if (!userToken && adminToken) {
        console.log('⚠️  You are logged in as admin but trying to make user payment');
        console.log('   Solution: Login as user for shopping');
    } else if (!userToken && !adminToken) {
        console.log('⚠️  No authentication found');
        console.log('   Solution: Login as user');
    } else if (userToken && !userStr) {
        console.log('⚠️  User token exists but no user data');
        console.log('   Solution: Clear tokens and login again');
    } else if (userToken && userStr) {
        console.log('✅ Authentication looks good for payment');
    }
    
    console.log('');
    console.log('🔧 Quick fixes:');
    console.log('- Clear all: TokenManager.clearAllTokens()');
    console.log('- Clear user only: TokenManager.clearUserToken()');
    console.log('- Clear admin only: TokenManager.clearAdminToken()');
}

// Export to window for easy access
window.checkPaymentAuth = checkPaymentAuth;

console.log('🛒 Payment Auth Checker loaded!');
console.log('📞 Run: checkPaymentAuth()');

// Auto-run if called directly
if (typeof module === 'undefined') {
    checkPaymentAuth();
}
