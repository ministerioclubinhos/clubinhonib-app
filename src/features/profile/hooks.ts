import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useAbortController, useDebouncedValue } from "@/hooks";
import type { RootState } from "@/store/slices";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import { apiFetchProfileBirthdays, apiFetchProfiles } from "./api";
import {
  PROFILES_DEFAULT_LIMIT,
  PROFILES_DEFAULT_SORT,
  PROFILE_REQUIRED_PERSONAL_DATA,
  PROFILE_REQUIRED_PREFERENCES,
} from "./constants";
import { splitBirthdaysByProximity } from "./utils";
import type {
  CompleteProfile,
  MyProfile,
  PersonalData,
  ProfileBirthday,
  ProfilesPaginationMeta,
  ProfilesQueryParams,
  UserPreferences,
} from "./types";

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

/** Filtros da listagem administrativa de perfis. */
export type ProfilesFilters = Pick<
  ProfilesQueryParams,
  "role" | "loveLanguages" | "temperaments" | "favoriteColor"
>;

/** Ordenação da listagem administrativa de perfis. */
export type ProfilesSort = Pick<ProfilesQueryParams, "sortBy" | "order">;

/** Página de perfis, com busca e filtros resolvidos pela API. */
export function useProfiles() {
  const [items, setItems] = useState<CompleteProfile[]>([]);
  const [meta, setMeta] = useState<ProfilesPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PROFILES_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProfilesFilters>({});
  const [sort, setSort] = useState<ProfilesSort>({
    sortBy: PROFILES_DEFAULT_SORT,
    order: "ASC",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  useEffect(() => setPage(1), [debouncedSearch, filters, sort, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchProfiles(
          {
            page,
            limit: pageSize,
            q: debouncedSearch || undefined,
            ...filters,
            ...sort,
          },
          { signal: controller.signal },
        );
        setItems(data.items);
        setMeta(data.meta);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar os perfis"));
        setItems([]);
        setMeta(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [
    page,
    pageSize,
    debouncedSearch,
    filters,
    sort,
    reloadToken,
    nextController,
  ]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    meta,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    loading,
    error,
    setError,
    refresh,
  };
}

/**
 * Aniversariantes do mês, já separados por proximidade.
 *
 * A faixa é acessória: se a chamada falhar, a listagem segue sem ela.
 */
export function useProfileBirthdays(reloadToken = 0) {
  const [birthdays, setBirthdays] = useState<ProfileBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await apiFetchProfileBirthdays();
        if (active) setBirthdays(data);
      } catch {
        if (active) setBirthdays([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const groups = useMemo(
    () => splitBirthdaysByProximity(birthdays),
    [birthdays],
  );

  return { ...groups, loading };
}
