import { EMPTY_VALUE, NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "./constants";
import type {
  ChangePasswordRequest,
  MyProfile,
  PersonalDataInput,
  ProfileBirthday,
  ProfileClub,
  UpdateCompleteProfileRequest,
  UpdateMyAccountRequest,
  UserPreferencesInput,
} from "./types";

/**
 * Data `YYYY-MM-DD` em `dd/mm/aaaa`.
 *
 * Lida por componentes, e não por `new Date(texto)`: a string vira meia-noite
 * UTC e, em fuso negativo, a tela mostrava o dia anterior.
 */
export function formatDateOnly(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return EMPTY_VALUE;

  const [year, month, day] = raw.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return raw;

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** Clubinhos a que o perfil está vinculado, em qualquer um dos dois papéis. */
export function profileClubs(profile?: MyProfile | null): ProfileClub[] {
  if (!profile) return [];

  const teacherClub = profile.teacherProfile?.club;

  return [
    ...(teacherClub ? [teacherClub] : []),
    ...(profile.coordinatorProfile?.clubs ?? []),
  ];
}

/** O usuário entrou com senha, e por isso precisa informar a atual para trocá-la. */
export function requiresCurrentPassword(profile?: MyProfile | null): boolean {
  return Boolean(profile?.commonUser);
}

/** Remove o que está em branco, para não gravar string vazia por descuido. */
function withoutBlanks<T extends Record<string, string | undefined>>(
  source: T,
): Partial<T> {
  const result: Partial<T> = {};

  (Object.keys(source) as Array<keyof T>).forEach((key) => {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim() as T[keyof T];
    }
  });

  return result;
}

/**
 * Corpo de `PATCH /profile`.
 *
 * Só vai o que mudou: a API aceita os quatro campos como opcionais, e reenviar
 * o e-mail atual dispararia a checagem de duplicidade à toa.
 */
export function buildUpdateAccountRequest(
  values: UpdateMyAccountRequest,
  current?: MyProfile | null,
): UpdateMyAccountRequest {
  const cleaned = withoutBlanks({
    name: values.name,
    email: values.email,
    phone: values.phone,
    cpf: values.cpf,
  });

  if (!current) return cleaned;

  const changed: UpdateMyAccountRequest = {};
  if (cleaned.name && cleaned.name !== current.name) changed.name = cleaned.name;
  if (cleaned.email && cleaned.email !== current.email) {
    changed.email = cleaned.email;
  }
  if (cleaned.phone && cleaned.phone !== current.phone) {
    changed.phone = cleaned.phone;
  }
  if (cleaned.cpf && cleaned.cpf !== (current.cpf ?? "")) {
    changed.cpf = cleaned.cpf;
  }

  return changed;
}

/** Corpo de `PUT /profiles/me` com apenas os blocos preenchidos. */
export function buildCompleteProfileRequest(args: {
  personalData?: PersonalDataInput;
  preferences?: UserPreferencesInput;
}): UpdateCompleteProfileRequest {
  const request: UpdateCompleteProfileRequest = {};

  if (args.personalData) request.personalData = args.personalData;
  if (args.preferences) request.preferences = args.preferences;

  return request;
}

/** Erros do formulário da conta. Vazio significa que dá para enviar. */
export function validateAccountForm(
  values: UpdateMyAccountRequest,
): Partial<Record<keyof UpdateMyAccountRequest, string>> {
  const errors: Partial<Record<keyof UpdateMyAccountRequest, string>> = {};

  if (values.name !== undefined && values.name.trim().length < NAME_MIN_LENGTH) {
    errors.name = `O nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres.`;
  }

  if (values.email !== undefined && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  return errors;
}

/** Erros do formulário de senha. */
export function validatePasswordForm(
  values: ChangePasswordRequest & { confirmPassword?: string },
  needsCurrentPassword: boolean,
): Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>> {
  const errors: Partial<
    Record<"currentPassword" | "newPassword" | "confirmPassword", string>
  > = {};

  if (needsCurrentPassword && !values.currentPassword?.trim()) {
    errors.currentPassword = "Informe a senha atual.";
  }

  if ((values.newPassword ?? "").length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (
    values.confirmPassword !== undefined &&
    values.confirmPassword !== values.newPassword
  ) {
    errors.confirmPassword = "As senhas não conferem.";
  }

  return errors;
}

/**
 * Corpo de `PATCH /profile/password`.
 *
 * A senha atual só vai quando é exigida: mandá-la vazia no login social
 * reprovaria na validação.
 */
export function buildChangePasswordRequest(
  values: ChangePasswordRequest,
  needsCurrentPassword: boolean,
): ChangePasswordRequest {
  const request: ChangePasswordRequest = { newPassword: values.newPassword };

  if (needsCurrentPassword && values.currentPassword?.trim()) {
    request.currentPassword = values.currentPassword;
  }

  return request;
}

/* ------------------------------------------------------------------ *
 * Aniversários
 * ------------------------------------------------------------------ */

export type BirthdayStatus = 'today' | 'this-week' | 'this-month' | null;

/**
 * Get initials from a person's name
 * Returns first and last name initials, or just first initial if single name
 */
export const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
};

/**
 * Determine if a birthday is today, this week, or this month
 */
export const getBirthdayStatus = (birthDateStr?: string): BirthdayStatus => {
    if (!birthDateStr) return null;

    try {
        const today = new Date();
        const [, month, day] = birthDateStr.split('-').map(Number);

        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

        if (birthdayThisYear < today &&
            !(birthdayThisYear.getDate() === today.getDate() &&
                birthdayThisYear.getMonth() === today.getMonth())) {
            birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birthdayThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (birthdayThisYear.getDate() === today.getDate() &&
            birthdayThisYear.getMonth() === today.getMonth()) {
            return 'today';
        }

        if (diffDays > 0 && diffDays <= 7) {
            return 'this-week';
        }

        if (birthdayThisYear.getMonth() === today.getMonth() &&
            birthdayThisYear.getFullYear() === today.getFullYear()) {
            return 'this-month';
        }

        return null;
    } catch {
        return null;
    }
};

/**
 * Calculate days until next birthday
 */
export const getDaysUntilBirthday = (birthDateStr?: string): number | null => {
    if (!birthDateStr) return null;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [, month, day] = birthDateStr.split('-').map(Number);

        const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
        birthdayThisYear.setHours(0, 0, 0, 0);

        if (birthdayThisYear < today) {
            birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birthdayThisYear.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
};

/**
 * Format birth date as "DD de Month"
 */
export const formatBirthDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const [, month, day] = dateStr.split('-').map(Number);
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return `${day} de ${months[month - 1]}`;
    } catch {
        return dateStr;
    }
};

/**
 * Format birth date as "DD Mon"
 */
export const formatBirthDateShort = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
        const [, month, day] = dateStr.split('-').map(Number);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${day} ${months[month - 1]}`;
    } catch {
        return dateStr;
    }
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    try {
        const birthDate = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
};

/**
 * Aniversariantes do mês separados por proximidade.
 *
 * A tela montava isto varrendo mil perfis completos; agora a API devolve só
 * quem faz aniversário no mês e a separação acontece aqui.
 */
export const splitBirthdaysByProximity = (
    birthdays: ProfileBirthday[],
): {
    today: ProfileBirthday[];
    week: ProfileBirthday[];
    month: ProfileBirthday[];
} => {
    const today: ProfileBirthday[] = [];
    const week: ProfileBirthday[] = [];
    const month: ProfileBirthday[] = [];

    birthdays.forEach((profile) => {
        const status = getBirthdayStatus(profile.birthDate);
        if (status === 'today') today.push(profile);
        else if (status === 'this-week') week.push(profile);
        else if (status === 'this-month') month.push(profile);
    });

    const byProximity = (a: ProfileBirthday, b: ProfileBirthday) =>
        (getDaysUntilBirthday(a.birthDate) ?? Number.MAX_SAFE_INTEGER) -
        (getDaysUntilBirthday(b.birthDate) ?? Number.MAX_SAFE_INTEGER);

    week.sort(byProximity);
    month.sort(byProximity);

    return { today, week, month };
};
