export const TZ = "America/Manaus";

export type MinimalUser = { id: string; name?: string; email?: string; phone?: string };

export type ClubSimple = { id: string; number?: number; weekday?: string };

export type TeacherProfile = {
  id: string;
  user: MinimalUser;
  club?: (ClubSimple & {
    coordinator?: { user?: MinimalUser } | null;
  }) | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  vinculado?: boolean;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type TeacherQuery = {
  searchString?: string; 
  q?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
  page?: number;
  limit?: number;
  sort?: "updatedAt" | "createdAt" | "name" | "clubNumber";
  order?: "asc" | "desc";
};
