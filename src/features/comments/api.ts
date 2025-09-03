import api from "@/config/axiosConfig";
import { CommentData } from "store/slices/comment/commentsSlice";

export async function apiGetComments() {
  const { data } = await api.get<CommentData[]>("/comments");
  return data;
}

export async function apiDeleteComment(id: string) {
  await api.delete(`/comments/${id}`);
}

export async function apiPublishComment(c: CommentData) {
  // mantém o comportamento atual: PUT com todos os campos + published=true
  await api.put(`/comments/${c.id}`, {
    name: c.name,
    comment: c.comment,
    clubinho: c.clubinho,
    neighborhood: c.neighborhood,
    published: true,
  });
}

export async function apiUpdateComment(c: CommentData, payload: {
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
  published?: boolean; // default true (como seu botão "Salvar e Publicar")
}) {
  await api.put(`/comments/${c.id}`, {
    name: payload.name,
    comment: payload.comment,
    clubinho: payload.clubinho,
    neighborhood: payload.neighborhood,
    published: payload.published ?? true,
  });
}
