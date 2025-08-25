// Debug Authentication Issues
console.log("🔧 Debug Auth Script Loaded");

// Monitor localStorage changes
function monitorLocalStorage() {
    console.log("🔍 Starting localStorage monitoring...");
    
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    localStorage.setItem = function(key, value) {
        console.log(`💾 localStorage.setItem("${key}", "${value ? value.substring(0, 20) + '...' : 'null'}")`);
        console.trace("Stack trace for setItem");
        originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key) {
        console.log(`🗑️ localStorage.removeItem("${key}")`);
        console.trace("Stack trace for removeItem");
        originalRemoveItem.call(this, key);
    };
    
    localStorage.clear = function() {
        console.log("🧹 localStorage.clear()");
        console.trace("Stack trace for clear");
        originalClear.call(this);
    };
    
    console.log("✅ localStorage monitoring enabled");
}

// Check current authentication state
function debugAuth() {
    console.log("🔍 === AUTHENTICATION DEBUG ===");
    console.log("Current URL:", window.location.href);
    console.log("Current pathname:", window.location.pathname);
    
    console.log("\n📦 localStorage contents:");
    console.log("  - user_token:", localStorage.getItem("user_token") ? "Có" : "Không");
    console.log("  - admin_token:", localStorage.getItem("admin_token") ? "Có" : "Không");
    console.log("  - token:", localStorage.getItem("token") ? "Có" : "Không");
    console.log("  - role:", localStorage.getItem("role"));
    console.log("  - user:", localStorage.getItem("user") ? "Có" : "Không");
    
    console.log("\n🔐 Token details:");
    const userToken = localStorage.getItem("user_token");
    const adminToken = localStorage.getItem("admin_token");
    const legacyToken = localStorage.getItem("token");
    
    if (userToken) {
        console.log("  - user_token:", userToken.substring(0, 50) + "...");
    }
    if (adminToken) {
        console.log("  - admin_token:", adminToken.substring(0, 50) + "...");
    }
    if (legacyToken) {
        console.log("  - legacy token:", legacyToken.substring(0, 50) + "...");
    }
    
    console.log("\n🎭 Role analysis:");
    const role = localStorage.getItem("role");
    const isAdminContext = window.location.pathname.startsWith("/admin");
    
    console.log("  - Current role:", role);
    console.log("  - Is admin context:", isAdminContext);
    console.log("  - Should redirect:", !userToken && !adminToken);
    
    console.log("🔍 === END DEBUG ===");
}

// Monitor page reloads and navigation
function monitorNavigation() {
    console.log("🧭 Starting navigation monitoring...");
    
    // Monitor beforeunload
    window.addEventListener('beforeunload', function(e) {
        console.log("⚠️ Page is about to unload/reload");
        console.log("  - URL:", window.location.href);
        console.log("  - localStorage state:", {
            user_token: localStorage.getItem("user_token") ? "Có" : "Không",
            admin_token: localStorage.getItem("admin_token") ? "Có" : "Không",
            role: localStorage.getItem("role")
        });
    });
    
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', function() {
        console.log("👁️ Page visibility changed:", document.visibilityState);
        if (document.visibilityState === 'hidden') {
            console.log("  - Page became hidden");
        } else {
            console.log("  - Page became visible");
        }
    });
    
    console.log("✅ Navigation monitoring enabled");
}

// Monitor axios requests
function monitorAxios() {
    console.log("🌐 Starting axios monitoring...");
    
    if (window.axios) {
        const originalGet = window.axios.get;
        const originalPost = window.axios.post;
        
        window.axios.get = function(...args) {
            console.log("🌐 GET request:", args[0]);
            console.log("  - Headers:", args[1]?.headers);
            return originalGet.apply(this, args);
        };
        
        window.axios.post = function(...args) {
            console.log("🌐 POST request:", args[0]);
            console.log("  - Data:", args[1]);
            console.log("  - Headers:", args[2]?.headers);
            return originalPost.apply(this, args);
        };
        
        console.log("✅ Axios monitoring enabled");
    } else {
        console.log("❌ Axios not available");
    }
}

// Auto-start monitoring
monitorLocalStorage();
monitorNavigation();
monitorAxios();

// Export functions to window
window.debugAuth = debugAuth;
window.monitorLocalStorage = monitorLocalStorage;
window.monitorNavigation = monitorNavigation;
window.monitorAxios = monitorAxios;

console.log("🔧 Debug functions available:");
console.log("  - debugAuth() - Check authentication state");
console.log("  - monitorLocalStorage() - Monitor localStorage changes");
console.log("  - monitorNavigation() - Monitor navigation");
console.log("  - monitorAxios() - Monitor API requests");
