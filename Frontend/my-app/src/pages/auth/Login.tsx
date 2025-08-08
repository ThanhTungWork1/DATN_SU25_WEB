// import { Form, Input, Button, message } from "antd";
// import { useNavigate } from "react-router-dom";
// import useLogin from "../../hook/useLogin";

// const Login = () => {
//   const [form] = Form.useForm();
//   const navigate = useNavigate();
//   const { mutate: login, isPending } = useLogin({ resource: "login" });

//   const onFinish = (values: { login: string; password: string }) => {
//     login(values, {
//       onSuccess: (data: any) => {
//         if (!data?.user) {
//           message.error("Dữ liệu phản hồi không hợp lệ!");
//           return;
//         }

//         // Lưu token và role dùng chung
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("role", data.user.role.toString());
//         localStorage.setItem("user", JSON.stringify(data.user));

//         if (data.user.role === 1) {
//           message.success("Đăng nhập admin thành công!");
//           navigate("/admin/dashboard", { replace: true });
//         } else {
//           message.success("Đăng nhập người dùng thành công!");
//           navigate("/", { replace: true });
//         }
//       },
//       onError: (error: any) => {
//         message.error(
//           error.response?.data?.message || error.message || "Đăng nhập thất bại"
//         );
//       },
//     });
//   };

//   return (
//     <div
//       style={{
//         maxWidth: 400,
//         margin: "100px auto",
//         padding: 24,
//         border: "1px solid #ccc",
//         borderRadius: 8,
//       }}
//     >
//       <h2 style={{ textAlign: "center" }}>Đăng nhập</h2>
//       <Form form={form} layout="vertical" onFinish={onFinish}>
//         <Form.Item
//           label="Email"
//           name="login"
//           rules={[{ required: true, message: "Vui lòng nhập email" }]}
//         >
//           <Input autoComplete="username" />
//         </Form.Item>
//         <Form.Item
//           label="Mật khẩu"
//           name="password"
//           rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
//         >
//           <Input.Password autoComplete="current-password" />
//         </Form.Item>
//         <Form.Item>
//           <Button type="primary" htmlType="submit" loading={isPending} block>
//             Đăng nhập
//           </Button>
//         </Form.Item>
//       </Form>
//     </div>
//   );
// };

// export default Login;
