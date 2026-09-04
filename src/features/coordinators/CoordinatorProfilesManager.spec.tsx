import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CoordinatorResponse } from "./types";

/** Larguras de tela no jsdom, que não implementa `matchMedia`. */
function mockViewport(width: number): void {
  vi.stubGlobal("matchMedia", (query: string): MediaQueryList => {
    const maxWidth = /max-width:\s*([\d.]+)px/.exec(query);
    const minWidth = /min-width:\s*([\d.]+)px/.exec(query);
    const matches = maxWidth
      ? width <= Number(maxWidth[1])
      : minWidth
        ? width >= Number(minWidth[1])
        : false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  });
}

const person = (id: string, name: string) => ({
  id,
  name,
  email: `${id}@example.com`,
  phone: "92999990000",
  active: true,
  completed: true,
  commonUser: false,
});

const coordinator: CoordinatorResponse = {
  id: "coord-1",
  active: true,
  user: person("user-1", "Marta Reis"),
  clubs: [
    {
      id: "club-1",
      number: 12,
      weekday: "saturday",
      teachers: [
        { id: "teacher-1", active: true, user: person("user-2", "João Lima") },
      ],
    },
    {
      id: "club-2",
      number: 13,
      weekday: "friday",
      // O mesmo professor dos dois clubinhos não pode ser contado duas vezes.
      teachers: [
        { id: "teacher-1", active: true, user: person("user-2", "João Lima") },
      ],
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const listState = {
  items: [coordinator] as CoordinatorResponse[],
  total: 1,
  loading: false,
  error: "",
};

vi.mock("./hooks", () => ({
  useCoordinators: () => ({
    ...listState,
    page: 1,
    setPage: () => {},
    pageSize: 12,
    setPageSize: () => {},
    search: "",
    setSearch: () => {},
    filters: {},
    setFilters: () => {},
    setError: () => {},
    refresh: () => {},
  }),
  useCoordinatorMutations: () => ({
    actionLoading: false,
    actionError: "",
    setActionError: () => {},
    assignClub: async () => true,
    unassignClub: async () => true,
  }),
  useClubOptions: () => ({
    clubs: [],
    loading: false,
    error: "",
    refresh: async () => {},
  }),
  useCoordinatorDetails: () => ({
    loading: false,
    fetchOne: async () => null,
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => "admin",
}));

import CoordinatorProfilesManager from "./CoordinatorProfilesManager";

const renderManager = () =>
  render(
    <MemoryRouter>
      <CoordinatorProfilesManager />
    </MemoryRouter>,
  );

describe("CoordinatorProfilesManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    listState.items = [coordinator];
    listState.total = 1;
    listState.error = "";
  });

  it("mostra o coordenador e a contagem devolvidos pela API", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Marta Reis")).toBeInTheDocument();
    expect(
      screen.getByText("1 coordenador(es) encontrado(s)"),
    ).toBeInTheDocument();
  });

  it("conta os clubinhos e os professores sem repetir quem atende dois", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByTitle("2 clubinho(s)")).toBeInTheDocument();
    expect(screen.getByTitle("1 professor(es)")).toBeInTheDocument();
  });

  it("expõe as ações do card com nome acessível", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gerenciar clubinhos" }),
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio quando os filtros não trazem ninguém", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;

    renderManager();

    expect(screen.getByText("Nenhum coordenador encontrado")).toBeInTheDocument();
  });

  // Com erro, o vazio não aparece: "nada encontrado" e "não deu para buscar"
  // são estados diferentes e não podem se confundir na tela.
  it("mostra a falha da API no lugar do estado vazio", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;
    listState.error = "Erro ao carregar os coordenadores";

    renderManager();

    expect(screen.getByText("Erro ao carregar os coordenadores")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum coordenador encontrado")).not.toBeInTheDocument();
  });
});
