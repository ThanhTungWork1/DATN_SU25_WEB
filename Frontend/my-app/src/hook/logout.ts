// hook/useLogout.ts
const useLogout = () => {
  return () => {
    const role = localStorage.getItem("role");

    if (role === "1") {
      localStorage.removeItem("admin_token");
    } else {
      localStorage.removeItem("user_token");
    }

    localStorage.removeItem("role");
    console.log("✅ Đã đăng xuất");

    // Redirect sau logout nếu muốn
    window.location.href = role === "1" ? "/admin/login" : "/login";
  };
};

export default useLogout;
