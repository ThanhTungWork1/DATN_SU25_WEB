import { config as axios } from "./axios";

export const getContacts = (page = 1, token: string) => {
  return axios.get(`/admin/contacts?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const replyContact = (
  id: number,
  replyMessage: string,
  token: string
) => {
  return axios.post(
    `/admin/contacts/${id}/reply`,
    { reply_message: replyMessage },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
