import { config as axios } from "./axios";

export const getContacts = (page = 1, token: string) => {
  return axios.get(`/admin/contacts?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}; 