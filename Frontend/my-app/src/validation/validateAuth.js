export function validateUserForm(values) {
  const errors = {};

  if (!values.name || values.name.trim() === '') {
    errors.name = 'Tên không được bỏ trống';
  }

  if (!values.email) {
    errors.email = 'Email không được bỏ trống';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!values.phone) {
    errors.phone = 'Số điện thoại không được bỏ trống';
  } else if (!/^\d{9,11}$/.test(values.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (!values.gender) {
    errors.gender = 'Vui lòng chọn giới tính';
  }

  if (!values.birthdate) {
    errors.birthdate = 'Vui lòng nhập ngày sinh';
  }

  return errors;
}
