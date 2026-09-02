import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchClubs = vi.fn();
const fetchChildren = vi.fn();
const fetchPagelas = vi.fn();

vi.mock("@/features/clubs/api", () => ({
  apiFetchClubs: (...args: unknown[]) => fetchClubs(...args),
}));
vi.mock("@/features/children/api", () => ({
  apiFetchChildren: (...args: unknown[]) => fetchChildren(...args),
}));
vi.mock("@/features/pagelas/api", () => ({
  apiFetchPagelas: (...args: unknown[]) => fetchPagelas(...args),
}));

import { useClubsBrowser, usePagelasBrowser } from "./hooks";

const emptyPage = { data: [], total: 0, page: 1, limit: 10, pageCount: 0 };

describe("navegação de pagelas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchClubs.mockResolvedValue(emptyPage);
    fetchChildren.mockResolvedValue({ data: [], meta: { totalItems: 0 } });
    fetchPagelas.mockResolvedValue(emptyPage);
  });

  it("busca uma vez só, sem se refazer a cada renderização", async () => {
    // O efeito de busca dependia de um objeto recriado a cada render, então
    // ele se cancelava e se repetia em laço — o console enchia de "canceled".
    const { rerender } = renderHook(() => useClubsBrowser());

    await waitFor(() => expect(fetchClubs).toHaveBeenCalledTimes(1));

    // Cada rerender é seguido do esvaziamento dos efeitos pendentes: sem isso
    // a contagem podia ser lida antes de o efeito repetido rodar, e o teste
    // passava mesmo com o laço presente.
    for (let i = 0; i < 5; i += 1) {
      rerender();
      await act(async () => {});
    }

    expect(fetchClubs).toHaveBeenCalledTimes(1);
  });

  it("não busca pagela alguma enquanto não há criança escolhida", async () => {
    renderHook(() => usePagelasBrowser(null));

    await waitFor(() => expect(fetchPagelas).not.toHaveBeenCalled());
  });

  it("cancela a busca ao desmontar", async () => {
    const { unmount } = renderHook(() => useClubsBrowser());

    await waitFor(() => expect(fetchClubs).toHaveBeenCalledTimes(1));

    const [args] = fetchClubs.mock.calls[0] as [{ signal: AbortSignal }];
    expect(args.signal.aborted).toBe(false);

    unmount();
    expect(args.signal.aborted).toBe(true);
  });
});
