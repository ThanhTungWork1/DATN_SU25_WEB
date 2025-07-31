export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function sendContact(form: ContactFormData) {
  const res = await fetch("http://localhost:8000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Gửi thất bại");
  return res.json();
} 