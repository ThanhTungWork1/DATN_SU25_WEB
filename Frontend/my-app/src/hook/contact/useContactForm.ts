import { useState } from "react";
import { sendContact, ContactFormData } from "./useContactApi";
import { toast } from "sonner";

export function useContactForm() {
  const [form, setForm] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendContact(form);
      toast.success(
        "Thông tin của bạn đã được gửi, chúng tôi sẽ phản hồi vào email của bạn. Xin cảm ơn !!"
      );
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
    setLoading(false);
  };

  return { form, loading, handleChange, handleSubmit };
}
