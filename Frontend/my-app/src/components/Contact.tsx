import "../assets/styles/mess-fb-phone.css";

export const Contact = () => {
  return (
    <div className="contact-floating">
      <a href="https://m.me/yourid" target="_blank" className="contact-btn" title="Messenger">
        <i className="fa-brands fa-facebook-messenger"></i>
      </a>
      <a href="https://facebook.com/yourpage" target="_blank" className="contact-btn" title="Facebook">
        <i className="fa-brands fa-facebook-f"></i>
      </a>
      <a href="tel:0987654321" className="contact-btn" title="Gọi ngay">
        <i className="fa-solid fa-phone"></i>
      </a>
    </div>
  );
};
