import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ClubSelectOption } from "@/features/clubs/types";

import CoordinatorClubsDialog from "./CoordinatorClubsDialog";
import type { CoordinatorResponse } from "../types";

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
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const clubs: ClubSelectOption[] = [
  { id: "club-1", label: "Clubinho 12 : Centro", coordinator: true },
  { id: "club-2", label: "Clubinho 13 : Aleixo", coordinator: false },
  { id: "club-3", label: "Clubinho 14 : Cidade Nova", coordinator: true },
];

const onAssign = vi.fn();
const onUnassign = vi.fn();
const onClose = vi.fn();

const renderDialog = (
  props: Partial<React.ComponentProps<typeof CoordinatorClubsDialog>> = {},
) =>
  render(
    <CoordinatorClubsDialog
      open
      coordinator={coordinator}
      clubs={clubs}
      clubsLoading={false}
      loading={false}
      error=""
      canManage
      onAssign={onAssign}
      onUnassign={onUnassign}
      onClose={onClose}
      {...props}
    />,
  );

describe("CoordinatorClubsDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista os clubinhos já vinculados com a contagem de professores", () => {
    renderDialog();

    expect(screen.getByText("Clubinho 12 · Sábado")).toBeInTheDocument();
    expect(screen.getByText("1 professor(es)")).toBeInTheDocument();
  });

  /** O clubinho já vinculado a este coordenador sai das opções. */
  it("não oferece o clubinho que já é dele", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Vincular clubinho"));

    expect(screen.queryByText("Clubinho 12 : Centro")).not.toBeInTheDocument();
    expect(await screen.findByText("Clubinho 13 : Aleixo")).toBeInTheDocument();
  });

  /**
   * Um clubinho tem um coordenador só. Escolher um que já tem tiraria o
   * clubinho de outra pessoa, e a API recusa — então a opção fica visível e
   * desabilitada, explicando o porquê.
   */
  it("desabilita o clubinho que já tem outro coordenador", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Vincular clubinho"));

    expect(
      await screen.findByText("Já tem coordenador — remova-o de lá primeiro"),
    ).toBeInTheDocument();

    // A opção existe na lista, mas não aceita clique.
    const blocked = screen
      .getByText("Clubinho 14 : Cidade Nova")
      .closest('li[role="option"]');

    expect(blocked).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Vincular" })).toBeDisabled();
    expect(onAssign).not.toHaveBeenCalled();
  });

  it("vincula um clubinho livre", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Vincular clubinho"));
    await userEvent.click(await screen.findByText("Clubinho 13 : Aleixo"));
    await userEvent.click(screen.getByRole("button", { name: "Vincular" }));

    expect(onAssign).toHaveBeenCalledWith("club-2");
  });

  /** Desvincular não age direto: quem decide é a confirmação da tela. */
  it("delega o desvínculo para quem chamou", async () => {
    renderDialog();

    await userEvent.click(
      screen.getByRole("button", { name: "Desvincular Clubinho 12 · Sábado" }),
    );

    expect(onUnassign).toHaveBeenCalledWith(coordinator.clubs[0]);
  });

  /** Só um administrador altera os clubinhos de um coordenador. */
  it("sem permissão, mostra os vínculos e esconde os controles", () => {
    renderDialog({ canManage: false });

    expect(screen.getByText("Clubinho 12 · Sábado")).toBeInTheDocument();
    expect(
      screen.getByText(/Somente um administrador altera/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Desvincular/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Vincular clubinho"),
    ).not.toBeInTheDocument();
  });

  it("mostra a falha devolvida pela API", () => {
    renderDialog({
      error: "Este Clubinho já tem coordenador.",
    });

    expect(
      screen.getByText("Este Clubinho já tem coordenador."),
    ).toBeInTheDocument();
  });
});
