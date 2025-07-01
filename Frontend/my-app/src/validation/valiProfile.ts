// validationSchema.ts
import * as yup from "yup";

export const userProfileSchema = yup.object({
  name: yup
    .string()
    .required("Tên không được để trống")
    .min(2, "Tên phải có ít nhất 2 ký tự"),

  email: yup
    .string()
    .required("Email không được để trống")
    .email("Email không hợp lệ"),

  phone: yup
    .string()
    .matches(/^\d{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),

  gender: yup
    .string()
    .oneOf(["male", "female", "other"], "Giới tính không hợp lệ"),

  birthdate: yup
    .date()
    .nullable()
    .typeError("Ngày sinh không hợp lệ"),
});
