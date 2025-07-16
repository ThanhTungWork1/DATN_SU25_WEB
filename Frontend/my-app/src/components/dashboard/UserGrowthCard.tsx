import { Card, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useUserGrowth } from "../../hook/analytics/useUserGrowth";

const UserGrowthCard = () => {
  const { data, isLoading } = useUserGrowth();

  if (isLoading || !data) return <Card loading />;

  const isPositive = data.growthPercent >= 0;
  const suffix = data.lastCount === 0
    ? data.thisCount > 0 ? "(+100%)" : "(0%)"
    : `(${data.growthPercent.toFixed(1)}%)`;

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
      <p style={{ marginTop: 8 }}>
        Tháng trước: {data.lastCount} người
      </p>
    </Card>
  );
};
export default UserGrowthCard;

