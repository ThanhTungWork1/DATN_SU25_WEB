import { contactChannels } from "./contactChannels";
import "../assets/styles/mess-fb-phone.css";
import { useEffect, useRef, useState } from "react";

export const ContactFloating = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [offsetForChat, setOffsetForChat] = useState(false);

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
      default:
        return label.charAt(0).toUpperCase();
    }
  };

  useEffect(() => {
    // Detect common external chat widgets to avoid overlap
    const detectExternalChat = () => {
      const selectors = [
        '#fb-customer-chat',
        '.fb_customer_chat_bounce_in',
        '.fb_dialog',
        '.fb_customer_chat_bubble',
        'iframe[src*="tawk.to"]',
        '#tawkchat-container',
        'iframe[src*="zendesk"]',
        '.zEWidget-launcher',
      ];
      const found = selectors.some((s) => !!document.querySelector(s));
      setOffsetForChat(found);
    };
    detectExternalChat();
    const id = window.setInterval(detectExternalChat, 1500);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.clearInterval(id);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`contact-floating ${open ? "open" : ""} ${
        offsetForChat ? "offset-chat" : ""
      }`}
    >
      {offsetForChat && <div className="chat-attention" aria-hidden="true" />}
      <div className="fab-menu">
        {contactChannels.map((channel) => (
          <button
            key={channel.label}
            title={channel.label}
            className="contact-btn"
            style={{ backgroundColor: channel.color }}
            onClick={() => {
              window.open(channel.href, "_blank");
              setOpen(false);
            }}
          >
            {getIcon(channel.label)}
          </button>
        ))}
      </div>

      <button
        aria-label="Liên hệ"
        className="fab-main"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
      >
        {open ? <i className="fa-solid fa-xmark" /> : <i className="fa-solid fa-headset" />}
      </button>
    </div>
  );
};
