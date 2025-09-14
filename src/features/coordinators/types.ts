export const TZ = "America/Manaus";

export type MinimalUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  completed?: boolean;
  commonUser?: boolean;
};

export type MinimalTeacher = {
  id: string;
  active?: boolean;
  user?: MinimalUser;
};

export type ClubSimple = {
  id: string;
  number?: number;
  weekday?: string;
};

export type ClubWithTeachers = ClubSimple & {
  teachers?: MinimalTeacher[];
};

export type CoordinatorProfile = {
  id: string;
  active?: boolean;
  user: MinimalUser;
  clubs?: ClubWithTeachers[];
  createdAt?: string;
  updatedAt?: string;
};

export type PageDto<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type CoordinatorFilters = {
  searchString: string;
  active: "all" | "active" | "inactive";
  hasClubs: "all" | "yes" | "no";
  clubNumber?: number | "";
};
