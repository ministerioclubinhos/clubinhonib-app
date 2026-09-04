import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LinkManagerDialog from "./LinkManagerDialog";
import type { LinkOption, LinkedItem } from "./types";

const options: LinkOption[] = [
  { id: "a", label: "Clubinho 12" },
  { id: "b", label: "Clubinho 13" },
  { id: "c", label: "Clubinho 14", blockedReason: "Já tem coordenador" },
];

const onAdd = vi.fn();
const onUnlink = vi.fn();
const onClose = vi.fn();

const labels = {
  linkedTitle: "Vinculados",
  emptyLinked: "Nenhum vínculo",
  addLabel: "Vincular",
  noOptions: "Nada disponível",
  submit: "Vincular",
  submitReplace: "Trocar",
  unlink: (item: LinkedItem) => `Desvincular ${item.primary}`,
};

const renderDialog = (
  props: Partial<React.ComponentProps<typeof LinkManagerDialog>> = {},
) =>
  render(
    <LinkManagerDialog
      open
      subjectName="Fulano"
      title="Vínculos"
      cardinality="multiple"
      linked={[{ id: "a", primary: "Clubinho 12" }]}
      options={options}
      loading={false}
      labels={labels}
      onAdd={onAdd}
      onUnlink={onUnlink}
      onClose={onClose}
      {...props}
    />,
  );

describe("LinkManagerDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra o assunto e os vínculos atuais", () => {
    renderDialog();

    expect(screen.getByText("Fulano")).toBeInTheDocument();
    expect(screen.getByText("Clubinho 12")).toBeInTheDocument();
  });

  it("anuncia o vazio quando não há vínculo", () => {
    renderDialog({ linked: [] });

    expect(screen.getByText("Nenhum vínculo")).toBeInTheDocument();
  });

  /** No múltiplo, o que já está vinculado sai das opções: não faria nada. */
  it("não oferece o que já está vinculado", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Vincular"));

    expect(await screen.findByText("Clubinho 13")).toBeInTheDocument();
    // "Clubinho 12" aparece só na lista de vinculados, não nas opções.
    expect(screen.getAllByText("Clubinho 12")).toHaveLength(1);
  });

  it("desabilita a opção bloqueada e mostra o motivo", async () => {
    renderDialog();

    await userEvent.click(screen.getByLabelText("Vincular"));

    expect(await screen.findByText("Já tem coordenador")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Clubinho 14/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  /** No vínculo único o atual vem selecionado, e "trocar" por ele não é mudança. */
  it("no vínculo único, trava o botão enquanto a escolha não muda", () => {
    renderDialog({
      cardinality: "single",
      linked: [{ id: "a", primary: "Clubinho 12" }],
    });

    expect(screen.getByRole("button", { name: "Trocar" })).toBeDisabled();
  });

  it("no vínculo único sem vínculo, o botão convida a vincular", () => {
    renderDialog({ cardinality: "single", linked: [] });

    expect(screen.getByRole("button", { name: "Vincular" })).toBeInTheDocument();
  });

  /** Desvincular sobe para quem chamou, que confirma antes. */
  it("delega o desvínculo sem agir", async () => {
    renderDialog();

    await userEvent.click(
      screen.getByRole("button", { name: "Desvincular Clubinho 12" }),
    );

    expect(onUnlink).toHaveBeenCalledWith({ id: "a", primary: "Clubinho 12" });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("sem permissão, mostra os vínculos e esconde os controles", () => {
    renderDialog({ readOnly: true, readOnlyReason: "Somente administrador." });

    expect(screen.getByText("Clubinho 12")).toBeInTheDocument();
    expect(screen.getByText("Somente administrador.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Vincular")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Desvincular/ }),
    ).not.toBeInTheDocument();
  });

  it("trava tudo enquanto grava", () => {
    renderDialog({ loading: true });

    expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Desvincular Clubinho 12" }),
    ).toBeDisabled();
  });

  it("mostra a falha da API", () => {
    renderDialog({ error: "Não deu certo" });

    expect(screen.getByText("Não deu certo")).toBeInTheDocument();
  });
});
