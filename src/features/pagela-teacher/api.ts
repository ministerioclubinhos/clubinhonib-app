import api from "@/config/axiosConfig";
import type { PageDto, Pagela, CreatePagelaPayload, UpdatePagelaPayload } from "./types";

/* Pagelas */
export async function apiListPagelasPaginated(params: {
  childId: string;
  year?: number;
  week?: number;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<PageDto<Pagela>>("/pagelas/paginated", { params });
  return data;
}
export async function apiCreatePagela(payload: CreatePagelaPayload) {
  const { data } = await api.post<Pagela>("/pagelas", payload);
  return data;
}
export async function apiUpdatePagela(id: string, payload: UpdatePagelaPayload) {
  const { data } = await api.patch<Pagela>(`/pagelas/${id}`, payload);
  return data;
}
export async function apiDeletePagela(id: string) {
  await api.delete(`/pagelas/${id}`);
}
