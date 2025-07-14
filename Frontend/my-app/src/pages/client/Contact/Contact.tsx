import "../../../assets/styles/contact.css";

export const Contact = () => {
  return (
    <>
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
                <strong>📍 Địa chỉ:</strong> 123 Trịnh Văn Bô, Nam Từ Liêm, Hà
                Nội
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

            <form action="#" method="post" className="contact-form">
              <label htmlFor="name">Họ và tên</label>
              <input type="text" id="name" name="name" required />

              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />

              <label htmlFor="message">Nội dung</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
              ></textarea>

              <button type="submit">Gửi liên hệ</button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};
