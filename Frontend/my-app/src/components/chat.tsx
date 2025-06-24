import React, { useState, useEffect } from "react";
import { Button, Input, List, Drawer } from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
// import { v4 as uuidv4 } from "uuid";
import axios from "axios";

<link rel="stylesheet" href="chat.css" />

export const clearChatHistory = async () => {
  await axios.get("http://localhost:3001/chats").then(async (res) => {
    const chatIds = res.data.map((chat: { id: string }) => chat.id);
    await Promise.all(chatIds.map((id: string) => axios.delete(`http://localhost:3001/chats/${id}`)));
  });
};


const Chat: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<{ id: string; user: string; message: string; timestamp: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // Lấy lịch sử tin nhắn từ db.json
  useEffect(() => {
    axios.get("http://localhost:3001/chats").then((res) => {
      setMessages(res.data.slice(2)); // Bỏ hai dòng đầu tiên
    });
  }, []);

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: uuidv4(),
      user: "Khách hàng",
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    // Lưu vào db.json
    await axios.post("http://localhost:3000/chats", newMessage);

    // Phản hồi tự động từ tổng đài
    setTimeout(async () => {
      const botResponse = {
        id: uuidv4(),
        user: "Tổng đài",
        message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedMessages, botResponse]);
      await axios.post("http://localhost:3000/chats", botResponse);
    }, 1000);
  };

  return (
    <>
      {/* Nút mở chat */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        onClick={() => setVisible(true)}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
      />

      {/* Hộp chat */}
      <Drawer title="Hỗ trợ trực tuyến" placement="right" onClose={() => setVisible(false)} open={visible}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item>
              <strong>{msg.user}:</strong> {msg.message}
            </List.Item>
          )}
        />
        <Input
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={sendMessage}
          suffix={<SendOutlined onClick={sendMessage} style={{ cursor: "pointer" }} />}
        />
      </Drawer>
    </>
  );
};

export default Chat;