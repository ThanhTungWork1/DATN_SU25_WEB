
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card } from "antd";
import { useUserByMonth } from "../../hook/analytics/useUserByMonth";

const UserChart = () => {
  const { data, isLoading } = useUserByMonth();

  return (
    <Card title="Biểu đồ người dùng mới theo tháng">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#1890ff" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default UserChart;
