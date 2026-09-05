import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/types/shared";

import type { ClubResponse } from "./types";

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

const club: ClubResponse = {
  id: "club-1",
  number: 12,
  weekday: "saturday",
  time: "15:00",
  isActive: true,
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
  coordinator: {
    id: "coord-1",
    active: true,
    user: {
      id: "user-1",
      name: "Marta Souza",
      email: "marta@exemplo.com",
      phone: "92999990000",
      active: true,
      completed: true,
      commonUser: false,
    },
  },
  teachers: [
    {
      id: "teacher-1",
      active: true,
      user: {
        id: "user-2",
        name: "João Lima",
        email: "joao@exemplo.com",
        phone: "92988880000",
        active: true,
        completed: true,
        commonUser: false,
      },
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const listState = {
  rows: [club] as ClubResponse[],
  total: 1,
  loading: false,
  error: "",
};

/** Papel de quem está na tela; cada teste ajusta antes de renderizar. */
const sessao = { role: UserRole.ADMIN as string | undefined };

vi.mock("./hooks", () => ({
  useClubs: () => ({
    ...listState,
    setError: () => {},
    fetchPage: async () => {},
  }),
  useClubDetails: () => ({
    viewing: null,
    setViewing: () => {},
    loading: false,
    fetchClub: async () => {},
  }),
  useClubFormOptions: () => ({
    coordinators: [{ coordinatorProfileId: "coord-2", name: "Rita Alves" }],
    teachers: [
      {
        teacherProfileId: "teacher-2",
        name: "Paulo Dias",
        vinculado: false,
        clubId: null,
        clubNumber: null,
      },
    ],
    reachableClubIds: new Set<string>(),
    reloadOptions: async () => {},
  }),
  useClubMutations: () => ({
    dialogLoading: false,
    dialogError: "",
    setDialogError: () => {},
    createClub: async () => true,
    updateClub: async () => true,
    deleteClub: async () => true,
    toggleActive: async () => true,
  }),
}));

vi.mock("react-redux", () => ({
  useSelector: () => sessao.role,
}));

import ClubsManager from "./ClubsManager";

const renderManager = () =>
  render(
    <MemoryRouter>
      <ClubsManager />
    </MemoryRouter>,
  );

describe("ClubsManager", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    listState.rows = [club];
    listState.total = 1;
    listState.loading = false;
    listState.error = "";
    sessao.role = UserRole.ADMIN;
  });

  it("mostra o clubinho e a contagem devolvidas pela API", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Clubinho 12")).toBeInTheDocument();
    expect(screen.getByText("1 clubinho(s) encontrado(s)")).toBeInTheDocument();
  });

  it("resume dia, horário e coordenação no card", () => {
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(screen.getByText("Marta Souza")).toBeInTheDocument();
    expect(screen.getByText("1 professor(es)")).toBeInTheDocument();
  });

  it("expõe as ações do card com nome acessível", () => {
    // Eram dez botões só com ícone, anunciados como "botão" pelo leitor de
    // tela; `CardActionButton` resolve rótulo e tooltip de uma vez.
    mockViewport(1280);
    renderManager();

    for (const nome of [
      "Ver detalhes",
      "Professores",
      "Coordenador",
      "Editar",
      "Inativar",
      "Excluir",
    ]) {
      expect(screen.getByRole("button", { name: nome })).toBeInTheDocument();
    }
  });

  it("esconde a ação de coordenador de quem não é administrador", () => {
    // Espelha `clubLinkPermissionsOf`: coordenador não altera coordenação.
    // Esconder não é autorização — a API barra de novo —, mas oferecer uma
    // ação que sempre responde 403 é um convite ao erro.
    sessao.role = UserRole.COORDINATOR;
    mockViewport(1280);
    renderManager();

    expect(
      screen.getByRole("button", { name: "Professores" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Coordenador" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando a busca não devolve nada", () => {
    listState.rows = [];
    listState.total = 0;
    mockViewport(1280);
    renderManager();

    expect(screen.getByText("Nenhum clubinho encontrado")).toBeInTheDocument();
  });
});
