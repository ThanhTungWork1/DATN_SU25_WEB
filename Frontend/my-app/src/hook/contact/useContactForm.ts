import { useState } from "react";
import { sendContact, ContactFormData } from "./useContactApi";
// import { toast } from "react-toastify";

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
      
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      
    }
    setLoading(false);
  };

  return { form, loading, handleChange, handleSubmit };
} 