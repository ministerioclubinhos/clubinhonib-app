import { ProfileImage, PersonalData, UserPreferences, UserRole, Address } from "@/types/shared";

export type { ProfileImage, PersonalData, UserPreferences };

export type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  cpf?: string | null;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  createdAt: string;
  updatedAt: string;
  image: ProfileImage | null;
  mediaItems?: ProfileImage[];
  memberProfile?: {
    id: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    team?: {
      id: string;
      numberTeam: number;
      description: string | null;
      createdAt: string;
      updatedAt: string;
      shelter?: {
        id: string;
        name: string;
        description: string;
        teamsQuantity: number;
        createdAt: string;
        updatedAt: string;
        address?: Address;
      };
    };
  } | null;
  leaderProfile?: any | null;
};

export type UpdateProfileDto = {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
};

export type ChangePasswordDto = {
  currentPassword?: string;
  newPassword: string;
};

export type UpdateProfileImageDto = {
  uploadType: 'UPLOAD' | 'LINK';
  url?: string;
  title?: string;
  description?: string;
  isLocalFile?: boolean;
};

export type CompleteProfile = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role?: string;
  personalData?: PersonalData;
  preferences?: UserPreferences;
};

export type CompleteProfileListItem = CompleteProfile & {
  role: string;
};

export type CreatePersonalDataDto = {
  birthDate?: string;
  gender?: string;
  gaLeaderName?: string;
  gaLeaderContact?: string;
};

export type UpdatePersonalDataDto = CreatePersonalDataDto;

export type CreateUserPreferencesDto = {
  loveLanguages?: string;
  temperaments?: string;
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteMusic?: string;
  whatMakesYouSmile?: string;
  skillsAndTalents?: string;
};

export type UpdateUserPreferencesDto = CreateUserPreferencesDto;

export type CreateCompleteProfileDto = {
  personalData?: CreatePersonalDataDto;
  preferences?: CreateUserPreferencesDto;
};

export type UpdateCompleteProfileDto = {
  personalData?: UpdatePersonalDataDto;
  preferences?: UpdateUserPreferencesDto;
};

export type QueryProfilesDto = {

  page?: number;
  limit?: number;

  q?: string;
  name?: string;
  email?: string;
  role?: string;

  loveLanguages?: string;
  temperaments?: string;
  favoriteColor?: string;

  sortBy?: 'name' | 'email' | 'createdAt' | 'birthDate';
  order?: 'ASC' | 'DESC';
};

export type PaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedProfilesResponse = {
  items: CompleteProfileListItem[];
  meta: PaginationMeta;
};
