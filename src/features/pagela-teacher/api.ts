import api from "@/config/axiosConfig";
import type {
  AcceptedChristResponse,
  CreateAcceptedChristRequest,
} from "@/features/children/types";

import { apiFetchPagelas } from "@/features/pagelas/api";
import type {
  PagelaFilters,
  PagelaResponse,
  Paginated,
} from "@/features/pagelas/types";

import type { CreatePagelaPayload, UpdatePagelaPayload } from "./types";

export {
  apiCreatePagela,
  apiUpdatePagela,
  apiDeletePagela,
} from "@/features/pagelas/api";

export type { CreatePagelaPayload, UpdatePagelaPayload };

/** Lista as pagelas de uma criança, com os filtros da área do professor. */
export async function apiListPagelasPaginated(
  params: {
    childId: string;
    searchString?: string;
    year?: number;
    week?: number;
    present?: boolean;
    didMeditation?: boolean;
    recitedVerse?: boolean;
    page?: number;
    limit?: number;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<PagelaResponse>> {
  const filters: PagelaFilters = {
    searchString: params.searchString,
    year: params.year,
    week: params.week,
    present: params.present,
    didMeditation: params.didMeditation,
    recitedVerse: params.recitedVerse,
  };

  return apiFetchPagelas(
    {
      childId: params.childId,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      filters,
    },
    options,
  );
}

/**
 * Registra a decisão de uma criança.
 *
 * A rota exige sessão e confere o clubinho: um professor só registra decisão de
 * criança da turma dele. Criança fora do alcance responde 404, igual ao que
 * responderia se não existisse.
 */
export async function apiCreateAcceptedChrist(
  payload: CreateAcceptedChristRequest,
): Promise<AcceptedChristResponse> {
  const { data } = await api.post<AcceptedChristResponse>(
    "/accepted-christs",
    payload,
  );
  return data;
}
