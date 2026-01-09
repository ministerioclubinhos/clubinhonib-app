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
  await api.put(`/comments/${c.id}`, {
    published: true,
  });
}

export async function apiUpdateComment(c: CommentData, payload: {
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
  published?: boolean; 
}) {
  await api.put(`/comments/${c.id}`, {
    name: payload.name,
    comment: payload.comment,
    clubinho: payload.clubinho,
    neighborhood: payload.neighborhood,
    published: payload.published ?? true,
  });
}
