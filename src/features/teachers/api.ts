import api from "@/config/axiosConfig";
import { TeacherProfile, ClubSimple, Page, TeacherQuery } from "./types";

// GET /teacher-profiles (paginado + filtros)
export async function apiListTeachers(params: TeacherQuery) {
  const { data } = await api.get<Page<TeacherProfile>>("/teacher-profiles", { params });
  return data;
}

// GET /teacher-profiles/:id   (id = teacherProfileId)
export async function apiGetTeacher(teacherId: string) {
  const { data } = await api.get<TeacherProfile>(`/teacher-profiles/${teacherId}`);
  return data;
}

// PATCH /teacher-profiles/:teacherId/assign-club  { clubId }
export async function apiAssignTeacherToClub(teacherId: string, clubId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/assign-club`, { clubId });
}

// PATCH /teacher-profiles/:teacherId/unassign-club  { clubId }
export async function apiUnassignTeacherFromClub(teacherId: string, clubId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/unassign-club`, { clubId });
}

// GET /clubs/all  (para mapear number -> id)
export async function apiListClubsSimple() {
  const { data } = await api.get<ClubSimple[]>("/clubs/all");
  return data;
}
