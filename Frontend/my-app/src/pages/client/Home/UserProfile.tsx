import { useEffect } from "react";
import { Form, Input, Radio, DatePicker, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import useOne from "../../../hook/useOne";
import useProfile from "../../../hook/useProfile";

const UserProfile = () => {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading } = useOne({
    resource: "users",
    id: userId,
  });

  const { mutate, isPending } = useProfile({
    resource: "users",
    id: userId,
  });

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({
        ...data.data,
        // birthdate: data.data.birthdate ? dayjs(data.data.birthdate) : undefined,
      });
    }
  }, [data, form]);

  const onFinish = (values: any) => {
    const formData = {
      ...values,
      birthdate: values.birthdate?.format("YYYY-MM-DD"),
    };

    mutate(formData, {
      onSuccess: () => {
        messageApi.success("Cập nhật hồ sơ thành công");
        window.location.reload();
      },
      onError: (error: any) => {
        messageApi.error("Cập nhật thất bại");
        console.error("Update Error:", error?.response?.data || error.message);
      },
    });
  };

  if (isLoading) return <p>Đang tải dữ liệu người dùng...</p>;

  return (
    <div className="profile-container">
      {contextHolder}
      <div className="profile-left">
        <div className="profile-title">Hồ Sơ Của Tôi</div>
        <div className="profile-subtitle">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </div>

        <Button
          type="default"
          className="order-history-btn"
          onClick={() => navigate(`/order-history/${userId}`)}
        >
          Lịch sử đơn hàng
        </Button>

        <div className="field-static">
          <div className="field-static-label">Tên đăng nhập</div>
          {/* <div className="field-static-value">{data?.data?.username || "Không có"}</div> */}
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Tên không được để trống" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email không được để trống" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Giới tính" name="gender">
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Ngày sinh" name="birthdate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending}>
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="profile-right">
        <img
          src="https://i.imgur.com/KDIDiSE.png"
          alt="avatar"
          className="avatar"
        />
        <Button>Chọn Ảnh</Button>
        <p>Dung lượng file tối đa 1 MB</p>
        <p>Định dạng: .JPEG, .PNG</p>
      </div>
    </div>
  );
};

export default UserProfile;
