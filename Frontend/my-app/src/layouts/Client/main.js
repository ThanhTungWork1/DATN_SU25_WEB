// Chuyển đổi giao diện sáng/tối
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("theme-icon");

// Tải giao diện từ localStorage
const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.toggle("dark-mode", savedTheme === "dark");
themeIcon.className =
  savedTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
});
