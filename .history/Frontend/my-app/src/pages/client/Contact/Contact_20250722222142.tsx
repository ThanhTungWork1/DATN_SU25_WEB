import { useState } from "react";
import "../../../assets/styles/contact.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ContactClient = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gửi thất bại");
      toast.success(
        "Thông tin của bạn đã được gửi, chúng tôi sẽ phản hồi vào email của bạn. Xin cảm ơn !!",
        {
          autoClose: 5000,
          style: {
            fontSize: "1.15rem",
            fontWeight: 600,
            padding: "24px 32px",
          },
        }
      );
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", {
        autoClose: 5000,
      });
    }
    setLoading(false);
  };

  return (
    <main className="contact-page">
      <section className="contact-box">
        <div className="contact-header">
          <h2>Liên hệ với chúng tôi</h2>
          <p>Hãy để lại thông tin nếu bạn có thắc mắc hoặc cần hỗ trợ.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <p>
              <strong>🏬 Cửa hàng:</strong> StrideX - Thời trang thể thao hiện
              đại
            </p>
            <p>
              <strong>📍 Địa chỉ:</strong> 123 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội
            </p>
            <p>
              <strong>📞 Số điện thoại:</strong> 0901 234 567
            </p>
            <p>
              <strong>📧 Email:</strong> StrideX@example.com
            </p>
            <p>
              <strong>🕐 Giờ làm việc:</strong> 8:00 - 21:00 (Thứ 2 - CN)
            </p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Nội dung</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi liên hệ"}
            </button>
          </form>
        </div>
      </section>
      <ToastContainer position="top-right" newestOnTop />
    </main>
  );
};
