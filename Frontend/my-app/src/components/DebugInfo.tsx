import React from 'react';
import { Card, Typography, Button, Space } from 'antd';

const { Text } = Typography;

const DebugInfo = () => {
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("user_token");
  const authToken = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");

  const clearAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Card title="🔍 Debug Info" style={{ margin: 16, maxWidth: 800 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Admin Token: </Text>
          <Text code>{adminToken ? `${adminToken.substring(0, 20)}...` : 'NULL'}</Text>
        </div>
        <div>
          <Text strong>User Token: </Text>
          <Text code>{userToken ? `${userToken.substring(0, 20)}...` : 'NULL'}</Text>
        </div>
        <div>
          <Text strong>Auth Token: </Text>
          <Text code>{authToken ? `${authToken.substring(0, 20)}...` : 'NULL'}</Text>
        </div>
        <div>
          <Text strong>Role: </Text>
          <Text code>{role || 'NULL'}</Text>
        </div>
        <div>
          <Text strong>User: </Text>
          <Text code>{user ? JSON.stringify(JSON.parse(user), null, 2) : 'NULL'}</Text>
        </div>
        <div>
          <Text strong>Current URL: </Text>
          <Text code>{window.location.href}</Text>
        </div>
        <Button danger onClick={clearAll}>
          Clear All Data
        </Button>
      </Space>
    </Card>
  );
};

export default DebugInfo; 