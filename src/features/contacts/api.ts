import api from '@/config/axiosConfig';
import { Contact } from './types';

export async function apiListContacts() {
  const { data } = await api.get<Contact[]>('/contact');
  return data;
}

export async function apiDeleteContact(id: string) {
  await api.delete(`/contact/${id}`);
}

export async function apiMarkAsRead(id: string) {
  await api.patch(`/contact/${id}/read`);
}
