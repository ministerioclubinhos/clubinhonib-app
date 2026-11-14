import { CLUB_TIME_PATTERN, EMPTY_VALUE, WEEKDAY_LABELS } from "./constants";
import type {
  ClubAddress,
  ClubAddressInput,
  ClubFormValues,
  ClubResponse,
  ClubUserMini,
  CreateClubRequest,
  UpdateClubRequest,
} from "./types";

/** Nome do dia da semana, ou o próprio valor quando vier algo inesperado. */
export function formatWeekday(weekday: string): string {
  return WEEKDAY_LABELS[weekday as keyof typeof WEEKDAY_LABELS] ?? weekday;
}

/** Horário em `HH:mm`, ou traço quando não há. */
export function formatClubTime(time?: string | null): string {
  return time?.trim() ? time.slice(0, 5) : EMPTY_VALUE;
}

/** Nome de quem está por trás do perfil, com o e-mail como segunda opção. */
export function formatUserLabel(user?: ClubUserMini | null): string {
  return user?.name?.trim() || user?.email?.trim() || EMPTY_VALUE;
}

/** Endereço em uma linha, pulando o que estiver vazio. */
export function formatClubAddress(address?: ClubAddress | null): string {
  if (!address) return EMPTY_VALUE;

  const street = [address.street, address.number].filter(Boolean).join(", ");
  const city = [address.city, address.state].filter(Boolean).join(" - ");
  const parts = [street, address.district, city, address.postalCode].filter(
    (part) => Boolean(part && String(part).trim()),
  );

  return parts.length ? parts.join(" · ") : EMPTY_VALUE;
}

/**
 * Endereço pronto para a entrada da API.
 *
 * O `id` chega na resposta mas é recusado pela validação da API, que rejeita
 * propriedade desconhecida: reenviá-lo na edição devolveria 400.
 */
export function toClubAddressInput(
  address?: ClubAddress | ClubAddressInput | null,
): ClubAddressInput {
  if (!address) return {};

  const source = address as Partial<ClubAddress>;

  return {
    street: source.street ?? undefined,
    number: source.number ?? undefined,
    district: source.district ?? undefined,
    city: source.city ?? undefined,
    state: source.state ?? undefined,
    postalCode: source.postalCode ?? undefined,
    complement: source.complement ?? undefined,
  };
}

/** Verdadeiro quando nenhum campo do endereço foi preenchido. */
export function isEmptyAddress(address: ClubAddressInput): boolean {
  return Object.values(address).every((value) => !value?.trim());
}

/** Lista de ids sem vazios e sem repetição. */
export function sanitizeIds(ids: ReadonlyArray<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      ids.filter((id): id is string => typeof id === "string" && id.trim() !== ""),
    ),
  );
}

/** Formulário preenchido a partir de um clubinho existente. */
export function toClubFormValues(club: ClubResponse): ClubFormValues {
  return {
    number: club.number,
    weekday: club.weekday,
    time: club.time ?? null,
    isActive: club.isActive,
    address: toClubAddressInput(club.address),
    coordinatorProfileId: club.coordinator?.id ?? null,
    teacherProfileIds: (club.teachers ?? []).map((teacher) => teacher.id),
  };
}

/**
 * Erros do formulário por campo. Vazio significa que dá para enviar.
 *
 * A mesma checagem vale para criação e edição; o número é o único obrigatório
 * além do dia, que já vem preenchido.
 */
export function validateClubForm(
  values: ClubFormValues,
): Partial<Record<keyof ClubFormValues, string>> {
  const errors: Partial<Record<keyof ClubFormValues, string>> = {};

  if (values.number === null || !Number.isInteger(values.number) || values.number < 1) {
    errors.number = "Informe o número do clubinho.";
  }

  if (values.time && !CLUB_TIME_PATTERN.test(values.time)) {
    errors.time = "Horário deve estar entre 0:00 e 23:59.";
  }

  return errors;
}

/**
 * Corpo do POST.
 *
 * Campo vazio é omitido em vez de enviado como `null`: a criação não tem o que
 * limpar, e `null` em `time` ou `coordinatorProfileId` reprovaria na validação.
 */
export function buildCreateClubRequest(values: ClubFormValues): CreateClubRequest {
  const address = toClubAddressInput(values.address);
  const teacherProfileIds = sanitizeIds(values.teacherProfileIds);

  const request: CreateClubRequest = {
    number: values.number ?? 0,
    weekday: values.weekday,
    isActive: values.isActive,
  };

  if (values.time?.trim()) request.time = values.time.trim();
  if (!isEmptyAddress(address)) request.address = address;
  if (values.coordinatorProfileId) {
    request.coordinatorProfileId = values.coordinatorProfileId;
  }
  if (teacherProfileIds.length) request.teacherProfileIds = teacherProfileIds;

  return request;
}

/**
 * Corpo do PATCH.
 *
 * Aqui `null` é informação: limpa o horário e desvincula o coordenador. A lista
 * de professores vai sempre, porque lista vazia significa "sem professores".
 */
export function buildUpdateClubRequest(values: ClubFormValues): UpdateClubRequest {
  const address = toClubAddressInput(values.address);

  const request: UpdateClubRequest = {
    weekday: values.weekday,
    time: values.time?.trim() ? values.time.trim() : null,
    isActive: values.isActive,
    coordinatorProfileId: values.coordinatorProfileId ?? null,
    teacherProfileIds: sanitizeIds(values.teacherProfileIds),
  };

  if (values.number !== null) request.number = values.number;
  if (!isEmptyAddress(address)) request.address = address;

  return request;
}
