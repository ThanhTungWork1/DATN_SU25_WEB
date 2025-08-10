import { contactChannels } from "./contactChannels";
import "../assets/styles/mess-fb-phone.css";

export const ContactFloating = () => {
  const toggleChatWidget = () => {
    const event = new CustomEvent("toggleChatWidget");
    window.dispatchEvent(event);
  };

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "zalo":
        return (
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>zalo</span>
        );
      case "messenger":
        return <i className="fa-brands fa-facebook-messenger"></i>;
      case "facebook":
        return <i className="fa-brands fa-facebook-f"></i>;
      case "ai":
        return <span style={{ fontSize: "16px" }}>🤖</span>;
      default:
        return label.charAt(0).toUpperCase();
    }
  };

  return (
    <div className="contact-floating">
      {contactChannels.map((channel) => (
        <button
          key={channel.label}
          title={channel.label}
          className="contact-btn"
          style={{ backgroundColor: channel.color }}
          onClick={() => {
            if (channel.label.toLowerCase() === "ai") {
              toggleChatWidget();
            } else {
              window.open(channel.href, "_blank");
            }
          }}
        >
          {getIcon(channel.label)}
        </button>
      ))}
    </div>
  );
};
