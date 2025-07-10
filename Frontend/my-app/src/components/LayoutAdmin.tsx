import React, { useState } from 'react';
import {
<<<<<<< HEAD
<<<<<<< HEAD
  DesktopOutlined ,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
=======
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
=======
  DesktopOutlined ,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
>>>>>>> df458680 (Trang dashboard tổng số người dùng, sản phẩm, đơn hàng, tỉ lệ tăng giảm người dùng theo tháng)
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
<<<<<<< HEAD
<<<<<<< HEAD
  getItem('Dashboard', 'dashboard', <DesktopOutlined  />),
  getItem('Thành viên', '/admin/users', <UserOutlined />, [
=======
  getItem('User', '/admin/users', <UserOutlined />, [
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
=======
  getItem('Dashboard', 'dashboard', <DesktopOutlined  />),
  getItem('Thành viên', '/admin/users', <UserOutlined />, [
>>>>>>> df458680 (Trang dashboard tổng số người dùng, sản phẩm, đơn hàng, tỉ lệ tăng giảm người dùng theo tháng)
    getItem('Tất cả người dùng', '/admin/users'),
    // getItem('Hồ sơ', '4'),
  ]),
];

const LayoutAdmin: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={({key})=> navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
<<<<<<< HEAD
<<<<<<< HEAD

=======
          <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
=======

>>>>>>> df458680 (Trang dashboard tổng số người dùng, sản phẩm, đơn hàng, tỉ lệ tăng giảm người dùng theo tháng)
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet/>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;