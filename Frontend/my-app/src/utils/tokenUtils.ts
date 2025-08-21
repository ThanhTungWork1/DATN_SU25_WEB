export class TokenManager {
  private static USER_TOKEN_KEY = "user_token";
  private static ADMIN_TOKEN_KEY = "admin_token";
  private static LEGACY_TOKEN_KEY = "token";

  /**
   * Lấy token dành cho request API theo context
   * **FIX: Sử dụng URL để xác định context admin/client**
   */
  static getToken(): string | null {
    // Kiểm tra URL hiện tại để xác định context
    const currentPath = window.location.pathname;
    const isAdminContext = currentPath.startsWith("/admin");

    if (isAdminContext) {
      // Trong admin context: ưu tiên admin token
      const adminToken = localStorage.getItem(this.ADMIN_TOKEN_KEY);

      return (
        adminToken ||
        localStorage.getItem(this.USER_TOKEN_KEY) ||
        localStorage.getItem(this.LEGACY_TOKEN_KEY)
      );
    } else {
      // Trong client context: ưu tiên user token
      const userToken =
        localStorage.getItem(this.USER_TOKEN_KEY) ||
        localStorage.getItem(this.LEGACY_TOKEN_KEY);

      return userToken || localStorage.getItem(this.ADMIN_TOKEN_KEY);
    }
  }

  /**
   * Lấy token chỉ dành cho USER (client side)
   */
  static getUserToken(): string | null {
    return (
      localStorage.getItem(this.USER_TOKEN_KEY) ||
      localStorage.getItem(this.LEGACY_TOKEN_KEY)
    );
  }

  /**
   * Lấy token chỉ dành cho ADMIN
   */
  static getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Lưu token và thông báo cho ứng dụng về sự thay đổi.
   * **FIX: Không xóa token của loại khác để cho phép đăng nhập đồng thời**
   */
  static setToken(token: string, role: "admin" | "user"): void {
    console.log("🔐 TokenManager - setToken được gọi với:", {
      token: token.substring(0, 20) + "...",
      role,
    });

    // **FIX CHÍNH: Chỉ set token cho role hiện tại, KHÔNG xóa token của role khác**
    if (role === "admin") {
      // Chỉ set admin token, GIỮ NGUYÊN user token
      localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
      localStorage.setItem("role", "1"); // Lưu role admin
      console.log(
        "🔐 TokenManager - Đã lưu admin token vào:",
        this.ADMIN_TOKEN_KEY
      );
    } else {
      // Chỉ set user token, GIỮ NGUYÊN admin token
      localStorage.setItem(this.USER_TOKEN_KEY, token);
      localStorage.setItem("role", "0"); // Lưu role user
      console.log(
        "🔐 TokenManager - Đã lưu user token vào:",
        this.USER_TOKEN_KEY
      );
    }

    // Chỉ xóa legacy token (cũ)
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    console.log("🔐 TokenManager - Đã xóa legacy token");

    // **DÒNG QUAN TRỌNG NHẤT:** Phát ra sự kiện để CartProvider lắng nghe
    window.dispatchEvent(new Event("token-changed"));
    console.log("🔐 TokenManager - Đã phát event token-changed");

    // Log để debug
    console.log("🔐 TokenManager - Token hiện tại trong localStorage:");
    console.log(
      "   - admin_token:",
      localStorage.getItem(this.ADMIN_TOKEN_KEY) ? "Có" : "Không"
    );
    console.log(
      "   - user_token:",
      localStorage.getItem(this.USER_TOKEN_KEY) ? "Có" : "Không"
    );
  }

  /**
   * Xóa tất cả các loại token và thông báo thay đổi.
   */
  static clearAllTokens(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.USER_TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);

    // Phát ra sự kiện để CartProvider lắng nghe
    window.dispatchEvent(new Event("token-changed"));
  }

  /**
   * **NEW: Xóa chỉ user token (logout user, giữ admin session)**
   */
  static clearUserToken(): void {
    localStorage.removeItem(this.USER_TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Thông báo thay đổi
    window.dispatchEvent(new Event("token-changed"));
  }

  /**
   * **NEW: Xóa chỉ admin token (logout admin, giữ user session)**
   */
  static clearAdminToken(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem("admin_user");

    // Kiểm tra xem có user token không, nếu không có thì xóa role
    const userToken = localStorage.getItem(this.USER_TOKEN_KEY);
    if (!userToken) {
      localStorage.removeItem("role");
    }

    // Thông báo thay đổi
    window.dispatchEvent(new Event("token-changed"));
  }

  /**
   * Lấy vai trò dựa trên token nào đang tồn tại.
   */
  static getRole(): "admin" | "user" | null {
    if (localStorage.getItem(this.ADMIN_TOKEN_KEY)) {
      return "admin";
    }
    if (localStorage.getItem(this.USER_TOKEN_KEY)) {
      return "user";
    }
    return null;
  }
}

// Export TokenManager to window for debugging
if (typeof window !== "undefined") {
  (window as any).TokenManager = TokenManager;
}
