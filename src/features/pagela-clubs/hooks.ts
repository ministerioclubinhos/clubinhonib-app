import { useCallback, useEffect, useRef, useState } from "react";

import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";
import { apiFetchClubs } from "@/features/clubs/api";
import type { ClubResponse } from "@/features/clubs/types";
import { apiFetchChildren } from "@/features/children/api";
import type { ChildResponseDto, Paginated as ChildrenPage } from "@/features/children/types";
import { apiFetchPagelas } from "@/features/pagelas/api";
import type { PagelaResponse } from "@/features/pagelas/types";
import {
  PAGELAS_DEFAULT_LIMIT,
  PAGELAS_LIMIT_STEP,
  PAGELAS_MAX_LIMIT,
  PAGELAS_MIN_LIMIT,
} from "@/features/pagelas/constants";

import { CHILDREN_PAGE_LIMIT, CLUBS_PAGE_LIMIT } from "./constants";
import { useDebouncedValue } from "./utils";

/** Estado comum dos três painéis. */
type BrowserState<T> = {
  rows: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  error: string;
  reload: () => void;
};

/**
 * Cancela a busca anterior quando outra começa.
 *
 * Os painéis buscam a cada tecla digitada; sem o cancelamento, a resposta de
 * uma busca antiga podia chegar depois e sobrescrever a lista atual.
 *
 * Devolve só a função, que é estável entre renderizações: devolver um objeto
 * novo a cada render colocaria uma dependência sempre diferente no efeito de
 * busca, e ele se cancelaria e se refaria em laço.
 */
function useAbortController(): () => AbortController {
  const ref = useRef<AbortController | null>(null);

  useEffect(() => () => ref.current?.abort(), []);

  return useCallback(() => {
    ref.current?.abort();
    const controller = new AbortController();
    ref.current = controller;
    return controller;
  }, []);
}

/** Clubinhos que quem está olhando alcança. */
export function useClubsBrowser(): BrowserState<ClubResponse> {
  const [rows, setRows] = useState<ClubResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  useEffect(() => setPage(1), [debouncedSearch]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchClubs({
          page,
          limit: CLUBS_PAGE_LIMIT,
          filters: { searchString: debouncedSearch || undefined },
          sort: { id: "number", desc: false },
          signal: controller.signal,
        });
        setRows(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao listar clubinhos"));
        setRows([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [page, debouncedSearch, reloadToken, nextController]);

  return {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload: () => setReloadToken((token) => token + 1),
  };
}

/**
 * Total de crianças da página.
 *
 * `/children` responde com `meta.totalItems`, mas o tipo do front admite as
 * duas formas históricas; ler nos dois lugares evita um total zerado.
 */
function childrenTotalOf(page: ChildrenPage<ChildResponseDto>): number {
  return Number(page?.meta?.totalItems ?? page?.total ?? 0);
}

/** Crianças do clubinho selecionado. */
export function useChildrenBrowser(
  club: ClubResponse | null,
): BrowserState<ChildResponseDto> {
  const [rows, setRows] = useState<ChildResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();
  const clubId = club?.id ?? null;

  useEffect(() => setPage(1), [clubId, debouncedSearch]);

  useEffect(() => {
    if (!clubId) {
      setRows([]);
      setTotal(0);
      setError("");
      return;
    }

    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchChildren({
          page,
          limit: CHILDREN_PAGE_LIMIT,
          // Pelo id, e não pelo número do clubinho: o número é rótulo.
          filters: { clubId, searchString: debouncedSearch || undefined },
          sort: { id: "name", desc: false },
          signal: controller.signal,
        });
        setRows(Array.isArray(data?.data) ? data.data : []);
        setTotal(childrenTotalOf(data));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao listar crianças"));
        setRows([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [clubId, page, debouncedSearch, reloadToken, nextController]);

  return {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    reload: () => setReloadToken((token) => token + 1),
  };
}

/** Pagelas da criança selecionada, com o tamanho de página ajustável. */
export function usePagelasBrowser(child: ChildResponseDto | null) {
  const [rows, setRows] = useState<PagelaResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGELAS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();
  const childId = child?.id ?? null;

  useEffect(() => {
    setPage(1);
    setLoaded(false);
  }, [childId, debouncedSearch]);

  useEffect(() => {
    if (!childId) {
      setRows([]);
      setTotal(0);
      setError("");
      return;
    }

    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchPagelas(
          {
            childId,
            page,
            limit,
            filters: { searchString: debouncedSearch || undefined },
          },
          { signal: controller.signal },
        );
        setRows(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
        setLoaded(true);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao listar pagelas"));
        setRows([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [childId, page, limit, debouncedSearch, nextController]);

  /** Mais ou menos pagelas por página, dentro dos limites da tela. */
  const stepLimit = useCallback((direction: 1 | -1) => {
    setLimit((current) =>
      Math.min(
        PAGELAS_MAX_LIMIT,
        Math.max(PAGELAS_MIN_LIMIT, current + direction * PAGELAS_LIMIT_STEP),
      ),
    );
    setPage(1);
  }, []);

  return {
    rows,
    total,
    page,
    setPage,
    limit,
    stepLimit,
    search,
    setSearch,
    loading,
    error,
    /** Já houve uma resposta para esta criança — separa "vazio" de "ainda não buscou". */
    loaded,
  };
}
