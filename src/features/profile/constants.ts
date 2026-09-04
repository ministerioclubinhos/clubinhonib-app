import { UserRole } from "@/types/shared";

import type { ProfileSortField, ProfileSortOrder } from "./types";

/**
 * Abas da tela `/meu-perfil`, na ordem em que aparecem.
 *
 * O `hash` é o atalho que os avisos de pendência usam para abrir a aba certa;
 * ficam juntos aqui para o rótulo e o link não discordarem.
 */
export const PROFILE_TABS = [
  { id: "account", label: "Informações da Conta", shortLabel: "Conta", hash: "" },
  { id: "personal", label: "Dados Pessoais", shortLabel: "Pessoais", hash: "#pessoais" },
  { id: "preferences", label: "Minhas Preferências", shortLabel: "Preferências", hash: "#preferencias" },
  { id: "password", label: "Alterar Senha", shortLabel: "Senha", hash: "#senha" },
  { id: "photo", label: "Foto de Perfil", shortLabel: "Foto", hash: "#foto" },
] as const;

export type ProfileTabId = (typeof PROFILE_TABS)[number]["id"];

/** Índice da aba correspondente ao hash da URL; zero quando não bate. */
export function profileTabIndexFromHash(hash: string): number {
  const index = PROFILE_TABS.findIndex(
    (tab) => tab.hash !== "" && tab.hash === hash,
  );

  return index >= 0 ? index : 0;
}

/** Tamanho mínimo da senha, igual ao validador da API. */
export const PASSWORD_MIN_LENGTH = 6;

/** Tamanho mínimo do nome, igual ao validador da API. */
export const NAME_MIN_LENGTH = 2;

/** Paginação da listagem administrativa de perfis. */
export const PROFILES_DEFAULT_LIMIT = 12;
export const PROFILES_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial da listagem. */
export const PROFILES_DEFAULT_SORT: ProfileSortField = "name";

/** Papéis oferecidos como filtro rápido; `all` limpa o filtro. */
export const PROFILES_ROLE_FILTERS = [
  "all",
  UserRole.TEACHER,
  UserRole.COORDINATOR,
  UserRole.ADMIN,
] as const;

/** Ordenações oferecidas, no formato `campo-direção` do seletor. */
export const PROFILE_SORT_OPTIONS: ReadonlyArray<{
  value: `${ProfileSortField}-${ProfileSortOrder}`;
  label: string;
}> = [
  { value: "name-ASC", label: "Nome (A-Z)" },
  { value: "name-DESC", label: "Nome (Z-A)" },
  { value: "email-ASC", label: "E-mail (A-Z)" },
  { value: "email-DESC", label: "E-mail (Z-A)" },
  { value: "createdAt-DESC", label: "Mais recentes" },
  { value: "createdAt-ASC", label: "Mais antigos" },
  { value: "birthDate-ASC", label: "Aniversário (jan-dez)" },
  { value: "birthDate-DESC", label: "Aniversário (dez-jan)" },
];

/**
 * Campos que precisam estar preenchidos para o perfil ser considerado completo.
 *
 * São os mesmos que os formulários pedem; ficam aqui para o aviso de pendência
 * e a tela não discordarem sobre o que falta.
 */
export const PROFILE_REQUIRED_PERSONAL_DATA = [
  "birthDate",
  "gender",
  "gaLeaderName",
  "gaLeaderContact",
] as const;

export const PROFILE_REQUIRED_PREFERENCES = [
  "loveLanguages",
  "temperaments",
  "favoriteColor",
  "favoriteFood",
  "favoriteMusic",
  "whatMakesYouSmile",
  "skillsAndTalents",
] as const;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";
