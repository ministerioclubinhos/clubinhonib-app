import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/types/shared";

import type { UserResponse } from "./types";

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

const user: UserResponse = {
  id: "user-1",
  name: "Maria da Silva",
  email: "maria@example.com",
  phone: "92999990000",
  cpf: null,
  role: UserRole.TEACHER,
  active: true,
  completed: false,
  commonUser: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const listState = {
  items: [user] as UserResponse[],
  total: 1,
  loading: false,
  error: "",
};

const deleteUser = vi.fn(async () => true);

vi.mock("./hooks", () => ({
  useUsers: () => ({
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
  useUserMutations: () => ({
    actionLoading: false,
    actionError: "",
    setActionError: () => {},
    createUser: async () => true,
    updateUser: async () => true,
    deleteUser,
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => ({ name: "Admin" }),
}));

import UsersManager from "./UsersManager";

const renderManager = () =>
  render(
    <MemoryRouter>
      <UsersManager />
    </MemoryRouter>,
  );

describe("UsersManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    listState.items = [user];
    listState.total = 1;
    listState.loading = false;
    listState.error = "";
  });

  it("mostra o usuário e a contagem devolvidos pela API", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Maria da Silva")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(screen.getByText("1 usuário(s) encontrado(s)")).toBeInTheDocument();
  });

  it("expõe as ações do card com nome acessível", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("mantém a ação principal à mão no celular", () => {
    mockViewport(390);
    renderManager();

    expect(
      screen.getByRole("button", { name: /novo usuário/i }),
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio quando a busca não traz ninguém", () => {
    mockViewport(1280);
    listState.items = [];
    listState.total = 0;

    renderManager();

    expect(screen.getByText("Nenhum usuário encontrado")).toBeInTheDocument();
  });

  it("mostra a falha da API sem apagar a tela", () => {
    mockViewport(1280);
    listState.error = "Erro ao carregar os usuários";

    renderManager();

    expect(screen.getByText("Erro ao carregar os usuários")).toBeInTheDocument();
  });

  it("só exclui depois da confirmação", async () => {
    mockViewport(1280);
    renderManager();

    await userEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(deleteUser).not.toHaveBeenCalled();

    // Com o diálogo aberto, o resto da página sai da árvore de acessibilidade:
    // o único "Excluir" alcançável é o da confirmação.
    await userEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith("user-1"));
  });
});
