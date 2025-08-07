// d:\DATN_SU25_WEB\DATN_SU25_WEB\Frontend\my-app\src\utils\tokenUtils.ts

export class TokenManager {
    private static USER_TOKEN_KEY = 'user_token';
    private static ADMIN_TOKEN_KEY = 'admin_token';
    private static LEGACY_TOKEN_KEY = 'token';

    /**
     * Lấy token hiện tại, ưu tiên admin > user > legacy.
     */
    static getToken(): string | null {
        return localStorage.getItem(this.ADMIN_TOKEN_KEY) || localStorage.getItem(this.USER_TOKEN_KEY) || localStorage.getItem(this.LEGACY_TOKEN_KEY);
    }

    /**
     * Lưu token và thông báo cho ứng dụng về sự thay đổi.
     */
    static setToken(token: string, role: 'admin' | 'user'): void {
        this.clearAllTokens(); // Xóa tất cả các token cũ để đảm bảo sạch sẽ
        const key = role === 'admin' ? this.ADMIN_TOKEN_KEY : this.USER_TOKEN_KEY;
        localStorage.setItem(key, token);
        
        // **DÒNG QUAN TRỌNG NHẤT:** Phát ra sự kiện để CartProvider lắng nghe
        window.dispatchEvent(new Event('token-changed'));
    }

    /**
     * Xóa tất cả các loại token và thông báo thay đổi.
     */
    static clearAllTokens(): void {
        localStorage.removeItem(this.ADMIN_TOKEN_KEY);
        localStorage.removeItem(this.USER_TOKEN_KEY);
        localStorage.removeItem(this.LEGACY_TOKEN_KEY);
        
        // Phát ra sự kiện để CartProvider lắng nghe
        window.dispatchEvent(new Event('token-changed'));
    }

    /**
     * Lấy vai trò dựa trên token nào đang tồn tại.
     */
    static getRole(): 'admin' | 'user' | null {
        if (localStorage.getItem(this.ADMIN_TOKEN_KEY)) {
            return 'admin';
        }
        if (localStorage.getItem(this.USER_TOKEN_KEY)) {
            return 'user';
        }
        return null;
    }
}