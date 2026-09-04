import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TeacherResponse } from "./types";

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

const user = {
  id: "user-1",
  name: "João Lima",
  email: "joao@example.com",
  phone: "92999990000",
  active: true,
  completed: true,
  commonUser: false,
};

const withClub: TeacherResponse = {
  id: "teacher-1",
  active: true,
  user,
  club: {
    id: "club-1",
    number: 12,
    weekday: "saturday",
    coordinator: {
      id: "coord-1",
      active: true,
      user: { ...user, id: "user-2", name: "Marta Reis" },
    },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const withoutClub: TeacherResponse = {
  ...withClub,
  id: "teacher-2",
  user: { ...user, id: "user-3", name: "Ana Paz" },
  club: null,
};

const listState = {
  items: [withClub, withoutClub] as TeacherResponse[],
  total: 2,
  loading: false,
  error: "",
};

vi.mock("./hooks", () => ({
  useTeachers: () => ({
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
  useTeacherMutations: () => ({
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
}));

vi.mock("react-redux", () => ({
  useSelector: () => "admin",
}));

import TeacherProfilesManager from "./TeacherProfilesManager";

const renderManager = () =>
  render(
    <MemoryRouter>
      <TeacherProfilesManager />
    </MemoryRouter>,
  );

describe("TeacherProfilesManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    listState.items = [withClub, withoutClub];
    listState.total = 2;
    listState.error = "";
  });

  it("mostra os professores e o clubinho de cada um", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("João Lima")).toBeInTheDocument();
    expect(screen.getByText("Ana Paz")).toBeInTheDocument();
    expect(screen.getByTitle("Clubinho 12 · Sábado")).toBeInTheDocument();
    expect(screen.getByTitle("Sem clubinho")).toBeInTheDocument();
  });

  it("mostra o coordenador do clubinho no card", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByTitle("Coord.: Marta Reis")).toBeInTheDocument();
  });

  /** Sem clubinho não há o que desvincular; o botão fica desabilitado. */
  it("desabilita o desvínculo de quem não tem clubinho", () => {
    mockViewport(1280);
    renderManager();

    const buttons = screen.getAllByRole("button", {
      name: "Desvincular clubinho",
    });

    expect(buttons[0]).toBeEnabled();
    expect(buttons[1]).toBeDisabled();
  });

  it("mostra o estado vazio quando os filtros não trazem ninguém", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;

    renderManager();

    expect(screen.getByText("Nenhum professor encontrado")).toBeInTheDocument();
  });

  // Com erro, o vazio não aparece: "nada encontrado" e "não deu para buscar"
  // são estados diferentes e não podem se confundir na tela.
  it("mostra a falha da API no lugar do estado vazio", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;
    listState.error = "Erro ao carregar os professores";

    renderManager();

    expect(screen.getByText("Erro ao carregar os professores")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum professor encontrado")).not.toBeInTheDocument();
  });
});
