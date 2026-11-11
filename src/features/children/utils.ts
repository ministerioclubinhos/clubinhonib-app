import { extractPhoneDigits, formatPhone } from "@/utils/phone";

import {
  CHILDREN_DEFAULT_ORDER,
  CHILDREN_DEFAULT_SORT,
  CHILD_NAME_MIN_LENGTH,
  EMPTY_VALUE,
  GENDER_LABELS,
  Gender,
  STATE_LENGTH,
} from "./constants";
import type {
  ChildAddressInput,
  ChildFilters,
  ChildFormErrors,
  ChildFormValues,
  ChildResponse,
  ChildSortField,
  ChildSortOrder,
  ChildrenQueryParams,
  CreateChildRequest,
  UpdateChildRequest,
} from "./types";

/** Iniciais do nome, para o avatar do card. */
export function childInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Rótulo do sexo. */
export function genderLabel(gender: Gender): string {
  return GENDER_LABELS[gender] ?? EMPTY_VALUE;
}

/**
 * Data de calendário no formato do país.
 *
 * A API manda `YYYY-MM-DD`, um dia sem hora. Passar isso por `new Date` seria
 * lê-lo como UTC e, num fuso a oeste, mostrar o dia anterior.
 */
export function formatDateOnly(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Idade em anos completos na data de hoje. */
export function ageInYears(
  birthDate?: string | null,
  today: Date = new Date(),
): number | null {
  const match = birthDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number) as unknown as number[];
  let age = today.getFullYear() - year;

  const hadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!hadBirthday) age -= 1;

  return age >= 0 ? age : null;
}

/** `Clubinho 12`, ou o aviso de que não há vínculo. */
export function clubLabel(child: ChildResponse): string {
  return child.club ? `Clubinho ${child.club.number}` : "Sem clubinho";
}

/** Cidade e UF em uma linha. */
export function cityLabel(child: ChildResponse): string {
  const city = child.address?.city?.trim();
  const state = child.address?.state?.trim();

  if (city && state) return `${city}/${state}`;
  return city || state || EMPTY_VALUE;
}

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export function buildChildrenQuery(args: {
  page: number;
  limit: number;
  filters?: ChildFilters;
  orderBy?: ChildSortField;
  order?: ChildSortOrder;
}): ChildrenQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    clubId: args.filters?.clubId || undefined,
    clubNumber: args.filters?.clubNumber,
    birthDateFrom: args.filters?.birthDateFrom || undefined,
    birthDateTo: args.filters?.birthDateTo || undefined,
    joinedFrom: args.filters?.joinedFrom || undefined,
    joinedTo: args.filters?.joinedTo || undefined,
    isActive: args.filters?.isActive,
    orderBy: args.orderBy ?? CHILDREN_DEFAULT_SORT,
    order: args.order ?? CHILDREN_DEFAULT_ORDER,
  };
}

/** Formulário vazio, para cadastrar uma criança. */
export function emptyChildForm(clubId: string | null = null): ChildFormValues {
  return {
    name: "",
    gender: Gender.MALE,
    birthDate: "",
    guardianName: "",
    guardianPhone: "",
    joinedAt: "",
    clubId,
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    postalCode: "",
    complement: "",
  };
}

/** Formulário preenchido a partir de uma criança existente. */
export function childToForm(child: ChildResponse): ChildFormValues {
  return {
    id: child.id,
    name: child.name,
    gender: child.gender,
    birthDate: child.birthDate,
    guardianName: child.guardianName,
    guardianPhone: child.guardianPhone ?? "",
    joinedAt: child.joinedAt ?? "",
    clubId: child.club?.id ?? null,
    street: child.address?.street ?? "",
    number: child.address?.number ?? "",
    district: child.address?.district ?? "",
    city: child.address?.city ?? "",
    state: child.address?.state ?? "",
    postalCode: child.address?.postalCode ?? "",
    complement: child.address?.complement ?? "",
  };
}

/**
 * O que falta preencher.
 *
 * A validação da tela melhora a experiência, mas não substitui a da API: o
 * mesmo payload é validado de novo no NestJS.
 */
export function validateChildForm(
  values: ChildFormValues,
  options: { requireClub?: boolean } = {},
): ChildFormErrors {
  const errors: ChildFormErrors = {};

  // Sem clubinho, só o administrador cadastra: a criança sem vínculo aparece
  // para todos os papéis.
  if (options.requireClub && !values.clubId) {
    errors.clubId = "Informe o clubinho da criança.";
  }

  if (values.name.trim().length < CHILD_NAME_MIN_LENGTH) {
    errors.name = "Informe o nome da criança.";
  }

  if (!values.birthDate) {
    errors.birthDate = "Informe a data de nascimento.";
  }

  if (values.guardianName.trim().length < CHILD_NAME_MIN_LENGTH) {
    errors.guardianName = "Informe o responsável.";
  }

  if (!values.district.trim()) errors.district = "Informe o bairro.";
  if (!values.city.trim()) errors.city = "Informe a cidade.";

  const state = values.state.trim();
  if (state.length !== STATE_LENGTH) {
    errors.state = "Informe a UF com duas letras.";
  }

  return errors;
}

/**
 * Endereço no formato que a API aceita.
 *
 * Na criação, campo vazio some do corpo. Na edição ele vai como texto vazio:
 * a API mescla o endereço, então omitir um campo apagado o deixava como
 * estava — o complemento apagado voltava depois de salvar.
 */
function toAddressInput(
  values: ChildFormValues,
  emptyAs: "" | undefined = undefined,
): ChildAddressInput {
  return {
    street: values.street.trim() || emptyAs,
    number: values.number.trim() || emptyAs,
    district: values.district.trim(),
    city: values.city.trim(),
    state: values.state.trim().toUpperCase(),
    postalCode: values.postalCode.replace(/\D/g, "") || emptyAs,
    complement: values.complement.trim() || emptyAs,
  };
}

/** Corpo de `POST /children` a partir do formulário. */
export function toCreateChildRequest(
  values: ChildFormValues,
): CreateChildRequest {
  return {
    name: values.name.trim(),
    birthDate: values.birthDate,
    guardianName: values.guardianName.trim(),
    gender: values.gender,
    guardianPhone: extractPhoneDigits(values.guardianPhone) || undefined,
    joinedAt: values.joinedAt || undefined,
    clubId: values.clubId ?? undefined,
    address: toAddressInput(values),
  };
}

/**
 * Corpo de `PUT /children/:id` a partir do formulário.
 *
 * Campo apagado vira `null`, que é como a API distingue "remova isto" de "não
 * mexa nisto" — a ausência da propriedade.
 */
export function toUpdateChildRequest(
  values: ChildFormValues,
): UpdateChildRequest {
  return {
    name: values.name.trim(),
    birthDate: values.birthDate,
    guardianName: values.guardianName.trim(),
    gender: values.gender,
    guardianPhone: extractPhoneDigits(values.guardianPhone),
    joinedAt: values.joinedAt || null,
    clubId: values.clubId,
    address: toAddressInput(values, ""),
  };
}

export { formatPhone };

/**
 * A criança já aceitou a Jesus?
 *
 * Conta `ACCEPTED` e `RECONCILED`, igual ao filtro da API. Registro antigo sem
 * tipo não conta: ele não diz qual foi a decisão.
 */
export function hasAcceptedChrist(
  decisions: readonly { decision: string | null }[] | undefined,
): boolean {
  return (decisions ?? []).some((item) => item.decision !== null);
}
