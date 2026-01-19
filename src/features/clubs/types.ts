import { UserRole } from "@/types/shared";

export type Weekday =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export type UserPublicDto = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
};

export type CoordinatorMiniDto = { id: string; user: UserPublicDto };
export type TeacherMiniDto = { id: string; user: UserPublicDto };

export type AddressResponseDto = {
  id: string;
  street: string;
  number?: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClubSimpleResponseDto = {
  id: string;
  number: number;
  weekday: Weekday;
  time?: string | null;
  isActive: boolean;
  address: AddressResponseDto;
  createdAt: string;
  updatedAt: string;
};

export type ClubResponseDto = {
  id: string;
  number: number;
  weekday: Weekday;
  time?: string | null;
  isActive: boolean;
  address: AddressResponseDto;
  coordinator?: CoordinatorMiniDto | null;
  teachers: TeacherMiniDto[];
  createdAt: string;
  updatedAt: string;
};

export type SimpleClubResponseDto = {
  id: string,
  detalhe: string,
  coordinator: boolean
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type CreateClubForm = {
  number: number;
  weekday: Weekday;
  time?: string | null;
  isActive?: boolean;
  address: Partial<AddressResponseDto> & {
    street: string; district: string; city: string; state: string; postalCode: string;
  };
  coordinatorProfileId?: string | null;
  teacherProfileIds?: string[];
};

export type EditClubForm = Partial<CreateClubForm> & { id: string };
export type UserLite = { id: string; name?: string; email?: string };

export type ClubFilters = {
  searchString?: string;
  isActive?: boolean;
};

export type ClubSort =
  | { id: "number" | "weekday" | "time" | "createdAt" | "updatedAt" | "city" | "state"; desc: boolean }
  | null;

export type CoordinatorOption = { coordinatorProfileId: string; name: string };
export type TeacherOption = { teacherProfileId: string; name: string, vinculado: boolean };
