import React from "react";

interface NoDataProps {
  text?: string;
  iconUrl?: string;
}

const NoData: React.FC<NoDataProps> = ({
  text = "Không có dữ liệu.",
  iconUrl = "https://cdn-icons-png.flaticon.com/512/6134/6134065.png",
}) => (
  <div style={{ textAlign: "center", padding: "40px 0", color: "#bbb" }}>
    <img src={iconUrl} alt="No data" style={{ width: 120, marginBottom: 16, opacity: 0.7 }} />
    <p style={{ fontSize: 18 }}>{text}</p>
  </div>
);

export default NoData; 