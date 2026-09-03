import { UserRole } from "@/types/shared";

/**
 * Contratos de perfil.
 *
 * Espelham `src/core/user/dto/my-profile-response.dto.ts` e
 * `src/core/profile/dto/complete-profile-response.dto.ts` da API, campo a
 * campo. Quando o back mudar, este arquivo muda junto.
 */

/** Foto do perfil (`ProfileImageResponseDto`). */
export type ProfileImage = {
  id: string;
  title: string | null;
  description: string | null;
  url: string;
  uploadType: string;
  mediaType: string;
  isLocalFile: boolean;
  platformType: string | null;
  originalName: string | null;
  size: number | null;
};

/** Dados pessoais (`PersonalDataResponseDto`). */
export type PersonalData = {
  /** `YYYY-MM-DD`, ausente quando não informado. */
  birthDate?: string;
  gender?: string;
  gaLeaderName?: string;
  gaLeaderContact?: string;
};

/** Preferências (`UserPreferencesResponseDto`). */
export type UserPreferences = {
  loveLanguages?: string;
  temperaments?: string;
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteMusic?: string;
  whatMakesYouSmile?: string;
  skillsAndTalents?: string;
};

/** Clubinho no recorte que o perfil mostra (`MyProfileClubDto`). */
export type ProfileClub = {
  id: string;
  number: number;
  weekday: string;
  /** `HH:mm`, ou `null` quando não cadastrado. */
  time: string | null;
  isActive: boolean;
};

/** Vínculo de professor (`MyProfileTeacherDto`). */
export type ProfileTeacherLink = {
  id: string;
  active: boolean;
  club: ProfileClub | null;
};

/** Vínculo de coordenação (`MyProfileCoordinatorDto`). */
export type ProfileCoordinatorLink = {
  id: string;
  active: boolean;
  clubs: ProfileClub[];
};

/**
 * Perfil de quem está logado.
 *
 * É a resposta de `GET /profile`, `PATCH /profile`, `PATCH /profile/image` e
 * também de `GET /auth/me`: os quatro devolvem exatamente isto.
 */
export type MyProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  cpf: string | null;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  createdAt: string;
  updatedAt: string;
  image: ProfileImage | null;
  personalData?: PersonalData;
  preferences?: UserPreferences;
  teacherProfile: ProfileTeacherLink | null;
  coordinatorProfile: ProfileCoordinatorLink | null;
};

/** Perfil no contrato de `/profiles` (`CompleteProfileResponseDto`). */
export type CompleteProfile = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  image: ProfileImage | null;
  personalData?: PersonalData;
  preferences?: UserPreferences;
};

/** Corpo de `PATCH /profile` (`UpdateOwnProfileDto`). */
export type UpdateMyAccountRequest = {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
};

/** Corpo de `PATCH /profile/password` (`ChangePasswordRequest`). */
export type ChangePasswordRequest = {
  /** Obrigatório para quem entrou com senha; ausente no login social. */
  currentPassword?: string;
  newPassword: string;
};

/** Corpo JSON de `PATCH /profile/image` (`UpdateUserImageDto`). */
export type UpdateProfileImageRequest = {
  uploadType: "upload" | "link";
  url?: string;
  title?: string;
  description?: string;
  isLocalFile?: boolean;
};

/** Bloco de dados pessoais na entrada. */
export type PersonalDataInput = {
  birthDate?: string;
  gender?: string;
  gaLeaderName?: string;
  gaLeaderContact?: string;
};

/** Bloco de preferências na entrada. */
export type UserPreferencesInput = {
  loveLanguages?: string;
  temperaments?: string;
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteMusic?: string;
  whatMakesYouSmile?: string;
  skillsAndTalents?: string;
};

/** Corpo de `POST /profiles` e `PUT /profiles/:id` (`*CompleteProfileDto`). */
export type UpdateCompleteProfileRequest = {
  personalData?: PersonalDataInput;
  preferences?: UserPreferencesInput;
};

export type CreateCompleteProfileRequest = UpdateCompleteProfileRequest;

/** Campo de ordenação aceito por `GET /profiles`. */
export type ProfileSortField = "name" | "email" | "createdAt" | "birthDate";
export type ProfileSortOrder = "ASC" | "DESC";

/** Query string de `GET /profiles` (`ProfilesQueryParams`). */
export type ProfilesQueryParams = {
  page?: number;
  limit?: number;
  q?: string;
  name?: string;
  email?: string;
  role?: string;
  loveLanguages?: string;
  temperaments?: string;
  favoriteColor?: string;
  sortBy?: ProfileSortField;
  order?: ProfileSortOrder;
};

/** Paginação de `GET /profiles` (`PaginatedProfilesResponseDto`). */
export type ProfilesPaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedProfilesResponse = {
  items: CompleteProfile[];
  meta: ProfilesPaginationMeta;
};

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
