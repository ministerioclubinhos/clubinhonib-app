import { useMemo } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/slices";

import { PROFILE_REQUIRED_PERSONAL_DATA, PROFILE_REQUIRED_PREFERENCES } from "./constants";
import type { MyProfile, PersonalData, UserPreferences } from "./types";

/** Pendência do perfil, com o atalho para onde resolvê-la. */
export interface ProfileAlert {
  id: string;
  message: string;
  to?: string;
  action?: () => void;
}

/** Um bloco está incompleto quando falta qualquer um dos campos exigidos. */
function isIncomplete<T extends PersonalData | UserPreferences>(
  block: T | undefined,
  requiredFields: readonly (keyof T)[],
): boolean {
  if (!block) return true;
  return requiredFields.some((field) => !block[field]);
}

/** A conta está incompleta quando falta nome completo, contato ou CPF. */
function accountIsIncomplete(profile: MyProfile): boolean {
  const nameParts = profile.name?.trim().split(/\s+/) ?? [];

  return (
    nameParts.length < 3 ||
    !profile.email ||
    !profile.phone ||
    !profile.cpf
  );
}

/**
 * O que ainda falta no perfil de quem está logado.
 *
 * A navegação mostra estes avisos; cada um leva à aba que resolve a pendência.
 */
export function useProfileAlerts(): ProfileAlert[] {
  const emailVerificationAlert = useSelector(
    (state: RootState) => state.auth.emailVerificationAlert,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  return useMemo(() => {
    const alerts: ProfileAlert[] = [];

    if (emailVerificationAlert?.verificationEmailSent) {
      alerts.push({
        id: "email-verification",
        message: "Confirme seu e-mail para ativar a conta.",
      });
    }

    if (!user) return alerts;

    if (!user.image?.url) {
      alerts.push({
        id: "missing-photo",
        message: "Adicione uma foto ao seu perfil.",
        to: "/meu-perfil#foto",
      });
    }

    if (accountIsIncomplete(user)) {
      alerts.push({
        id: "incomplete-account-info",
        message: "Complete 'Informações da sua conta'.",
        to: "/meu-perfil",
      });
    }

    if (isIncomplete(user.personalData, PROFILE_REQUIRED_PERSONAL_DATA)) {
      alerts.push({
        id: "missing-personaldata",
        message: "Complete seus dados pessoais.",
        to: "/meu-perfil#pessoais",
      });
    }

    if (isIncomplete(user.preferences, PROFILE_REQUIRED_PREFERENCES)) {
      alerts.push({
        id: "missing-preferences",
        message: "Complete suas preferências.",
        to: "/meu-perfil#preferencias",
      });
    }

    return alerts;
  }, [user, emailVerificationAlert]);
}
