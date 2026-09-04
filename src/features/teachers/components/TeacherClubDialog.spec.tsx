import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ClubSelectOption } from "@/features/clubs/types";

import TeacherClubDialog from "./TeacherClubDialog";
import type { TeacherResponse } from "../types";

const user = {
  id: "user-1",
  name: "João Lima",
  email: "joao@example.com",
  phone: "92999990000",
  active: true,
  completed: true,
  commonUser: false,
};

const teacher: TeacherResponse = {
  id: "teacher-1",
  active: true,
  user,
  club: { id: "club-1", number: 12, weekday: "saturday", coordinator: null },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const clubs: ClubSelectOption[] = [
  { id: "club-1", label: "Clubinho 12 : Centro", coordinator: true },
  { id: "club-2", label: "Clubinho 13 : Aleixo", coordinator: false },
];

const onAssign = vi.fn();
const onUnassign = vi.fn();
const onClose = vi.fn();

const renderDialog = (props: Partial<React.ComponentProps<typeof TeacherClubDialog>> = {}) =>
  render(
    <TeacherClubDialog
      open
      teacher={teacher}
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

describe("TeacherClubDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra o vínculo atual", () => {
    renderDialog();

    expect(screen.getByText("Clubinho 12 · Sábado")).toBeInTheDocument();
    expect(screen.getByText("João Lima")).toBeInTheDocument();
  });

  /**
   * O clubinho já vinculado vem selecionado, e trocar por ele mesmo não é uma
   * mudança — o botão só libera com outro clubinho.
   */
  it("não deixa confirmar o mesmo clubinho", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Trocar" })).toBeDisabled();
  });

  it("libera a troca depois de escolher outro clubinho", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Clubinho"));
    await userEvent.click(await screen.findByText("Clubinho 13 : Aleixo"));

    const submit = screen.getByRole("button", { name: "Trocar" });
    expect(submit).toBeEnabled();

    await userEvent.click(submit);
    expect(onAssign).toHaveBeenCalledWith("club-2");
  });

  it("chama Vincular, e não Trocar, para quem não tem clubinho", () => {
    renderDialog({ teacher: { ...teacher, club: null } });

    expect(screen.getByRole("button", { name: "Vincular" })).toBeInTheDocument();
    expect(screen.getByText("Sem clubinho")).toBeInTheDocument();
  });

  /** Desvincular não age direto: quem decide é a confirmação da tela. */
  it("delega o desvínculo para quem chamou", async () => {
    renderDialog();

    await userEvent.click(
      screen.getByRole("button", { name: "Desvincular clubinho" }),
    );

    expect(onUnassign).toHaveBeenCalledTimes(1);
    expect(onAssign).not.toHaveBeenCalled();
  });

  it("trava os botões enquanto grava", () => {
    renderDialog({ loading: true });

    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Desvincular clubinho" }),
    ).toBeDisabled();
  });

  /** Esconder o botão não é autorização, mas oferecer um 403 é um convite ao erro. */
  it("sem permissão, mostra o vínculo e esconde os controles", () => {
    renderDialog({ canManage: false });

    expect(screen.getByText("Clubinho 12 · Sábado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Desvincular clubinho" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trocar" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Clubinho")).not.toBeInTheDocument();
  });

  it("mostra a falha devolvida pela API", () => {
    renderDialog({ error: "Sem acesso ao clubinho informado" });

    expect(
      screen.getByText("Sem acesso ao clubinho informado"),
    ).toBeInTheDocument();
  });
});
