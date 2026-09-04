import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Gender } from "./constants";
import type { ChildResponse } from "./types";

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

const child: ChildResponse = {
  id: "child-1",
  name: "Ana Souza",
  birthDate: "2018-05-20",
  guardianName: "Marta Souza",
  gender: Gender.FEMALE,
  guardianPhone: "92999990000",
  joinedAt: "2024-02-01",
  isActive: true,
  club: { id: "club-1", number: 12, weekday: "saturday" },
  address: {
    id: "addr-1",
    street: "Rua das Flores",
    number: "10",
    district: "Centro",
    city: "Manaus",
    state: "AM",
    postalCode: "69000000",
    complement: null,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const listState = {
  items: [child] as ChildResponse[],
  total: 1,
  loading: false,
  error: "",
};

vi.mock("./hooks", () => ({
  useChildren: () => ({
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
  useChildMutations: () => ({
    actionLoading: false,
    actionError: "",
    setActionError: () => {},
    createChild: async () => true,
    updateChild: async () => true,
    deleteChild: async () => true,
    toggleActive: async () => true,
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => null,
}));

import ChildrenManager from "./ChildrenManager";

const renderManager = () =>
  render(
    <MemoryRouter>
      <ChildrenManager />
    </MemoryRouter>,
  );

describe("ChildrenManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    listState.items = [child];
    listState.total = 1;
    listState.loading = false;
    listState.error = "";
  });

  it("mostra a criança e a contagem devolvidas pela API", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("Responsável: Marta Souza")).toBeInTheDocument();
    expect(screen.getByText("1 criança(s) encontrada(s)")).toBeInTheDocument();
  });

  /**
   * A data vem como dia de calendário; lê-la como UTC mostraria o dia anterior
   * num fuso a oeste.
   */
  it("mostra a data de nascimento no dia certo", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByTitle(/20\/05\/2018/)).toBeInTheDocument();
  });

  it("expõe as ações do card com nome acessível", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inativar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("mantém a ação principal à mão no celular", () => {
    mockViewport(390);
    renderManager();

    expect(
      screen.getByRole("button", { name: /nova criança/i }),
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio quando os filtros não trazem ninguém", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;

    renderManager();

    expect(screen.getByText("Nenhuma criança encontrada")).toBeInTheDocument();
  });

  it("mostra a falha da API", () => {
    mockViewport(1280);
    listState.error = "Erro ao carregar as crianças";

    renderManager();

    expect(screen.getByText("Erro ao carregar as crianças")).toBeInTheDocument();
  });
});
