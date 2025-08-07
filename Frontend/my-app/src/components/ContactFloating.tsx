import { contactChannels } from './contactChannels';
import "../assets/styles/mess-fb-phone.css";

export const ContactFloating = () => {
  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "zalo":
        return <span style={{fontWeight: 'bold', fontSize: '12px'}}>zalo</span>;
      case "messenger":
        return <i className="fa-brands fa-facebook-messenger"></i>;
      case "facebook":
        return <i className="fa-brands fa-facebook-f"></i>;
      case "phone":
        return <i className="fa-solid fa-phone"></i>;
      default:
        return label.charAt(0).toUpperCase();
    }
  };

  return (
    <div className="contact-floating">
      {contactChannels.map((channel) => (
        <a 
          key={channel.label}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn"
          title={channel.label}
          style={{ backgroundColor: channel.color }}
        >
          {getIcon(channel.label)}
        </a>
      ))}
    </div>
  );
}; 