# 🔐 Fix Simultaneous Login - StrideX

## 🎯 Vấn đề đã fix
- **TRƯỚC:** Đăng nhập admin → logout client, đăng nhập client → logout admin
- **SAU:** Admin và client có thể đăng nhập đồng thời, không bị logout lẫn nhau

## 🔧 Những gì đã sửa

### 1. **TokenManager.setToken()** - Core fix
```typescript
// TRƯỚC: Xóa token của loại khác
if (role === 'admin') {
    localStorage.removeItem(this.USER_TOKEN_KEY); // ❌ XÓA user token
} else {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY); // ❌ XÓA admin token  
}

// SAU: Giữ nguyên token của loại khác
if (role === 'admin') {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token); // ✅ CHỈ set admin
} else {
    localStorage.setItem(this.USER_TOKEN_KEY, token); // ✅ CHỈ set user
}
```

### 2. **Context-aware token selection**
```typescript
static getToken(): string | null {
    const currentPath = window.location.pathname;
    const isAdminContext = currentPath.startsWith('/admin');
    
    if (isAdminContext) {
        return adminToken || userToken; // Ưu tiên admin token
    } else {
        return userToken || adminToken; // Ưu tiên user token
    }
}
```

### 3. **Separate logout methods**
```typescript
TokenManager.clearAllTokens()    // Logout tất cả
TokenManager.clearAdminToken()   // Logout chỉ admin
TokenManager.clearUserToken()    // Logout chỉ user
```

## 🧪 Cách test

### Test 1: Debug script
```javascript
// Mở browser console, chạy:
testSimultaneousLogin()
```

### Test 2: Manual testing
1. **Đăng nhập admin:** `/admin/login`
2. **Mở tab mới:** Đăng nhập user `/login`  
3. **Chuyển qua lại:** Cả 2 tab đều không bị logout
4. **Check localStorage:** Có cả `admin_token` và `user_token`

### Test 3: API calls
1. **Admin tab:** Gọi API admin → dùng admin token
2. **Client tab:** Gọi API client → dùng user token
3. **Không conflict**

## 📊 Kết quả mong đợi

### ✅ Trước khi fix:
```
Admin login → User logout ❌
User login → Admin logout ❌
```

### ✅ Sau khi fix:
```
Admin login → User vẫn login ✅
User login → Admin vẫn login ✅
Context-aware token selection ✅
Separate logout options ✅
```

## 🔍 Debug tools

### Check tokens:
```javascript
console.log('Admin token:', TokenManager.getAdminToken());
console.log('User token:', TokenManager.getUserToken());
console.log('Context token:', TokenManager.getToken());
```

### Manual token management:
```javascript
// Set tokens
TokenManager.setToken('token123', 'admin');
TokenManager.setToken('token456', 'user');

// Clear specific
TokenManager.clearAdminToken();
TokenManager.clearUserToken();

// Clear all
TokenManager.clearAllTokens();
```

## 🎯 Use cases hỗ trợ

1. **Developer workflow:** Admin panel + Client testing
2. **Customer support:** Support vào admin, user vẫn dùng bình thường
3. **Multi-role users:** Cùng người có thể vào cả admin và client
4. **Testing:** Không cần logout/login liên tục

## ⚠️ Lưu ý

- **URL-based context:** `/admin/*` = admin context, còn lại = client context
- **Token priority:** Admin context ưu tiên admin token, client context ưu tiên user token
- **Fallback:** Nếu không có token ưu tiên, sử dụng token còn lại
- **Role synchronization:** Cần đảm bảo `role` trong localStorage đúng với token đang dùng

## 🚀 Status

**✅ HOÀN THÀNH** - Admin và Client có thể đăng nhập đồng thời không bị conflict!
