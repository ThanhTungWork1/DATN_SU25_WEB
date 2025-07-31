import { Card, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useUserGrowth } from "../../hook/analytics/useUserGrowth";

const UserGrowthCard = () => {
  const { data, isLoading } = useUserGrowth();

  // Debug: Log dữ liệu để kiểm tra
  console.log("UserGrowthCard Data:", data);

  if (isLoading || !data) return <Card loading />;

  const isPositive = data.growthPercent >= 0;
  const suffix =
    data.lastCount === 0
      ? data.thisCount > 0
        ? "(+100%)"
        : "(0%)"
<<<<<<< HEAD
      : `(${isPositive ? '+' : ''}${data.growthPercent.toFixed(1)}%)`;
=======
      : `(${data.growthPercent.toFixed(1)}%)`;
>>>>>>> origin/ThanhTung_profile_home_auth

  return (
    <Card>
      <Statistic
        title="Người dùng mới tháng này"
        value={data.thisCount}
        precision={0}
        valueStyle={{ color: isPositive ? "green" : "red" }}
        prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        suffix={suffix}
      />
<<<<<<< HEAD
      <p style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
        Tháng trước: {data.lastCount} người | Tăng trưởng: {data.growthPercent.toFixed(1)}%
      </p>
=======
      <p style={{ marginTop: 8 }}>Tháng trước: {data.lastCount} người</p>
>>>>>>> origin/ThanhTung_profile_home_auth
    </Card>
  );
};
export default UserGrowthCard;
