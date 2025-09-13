import api from "@/config/axiosConfig";
import { TeacherProfile, ClubSimple, Page, TeacherQuery } from "./types";

export async function apiListTeachers(params: TeacherQuery) {
  const { data } = await api.get<Page<TeacherProfile>>("/teacher-profiles", { params });
  return data;
}

export async function apiGetTeacher(teacherId: string) {
  const { data } = await api.get<TeacherProfile>(`/teacher-profiles/${teacherId}`);
  return data;
}

export async function apiAssignTeacherToClub(teacherId: string, clubId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/assign-club`, { clubId });
}

export async function apiUnassignTeacherFromClub(teacherId: string, clubId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/unassign-club`, { clubId });
}

export async function apiListClubsSimple() {
  const { data } = await api.get<ClubSimple[]>("/clubs/all");
  return data;
}
