import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiUnsubscribeFromNotices = vi.fn();

vi.mock("./api", () => ({
  apiUnsubscribeFromNotices: (token: string) =>
    apiUnsubscribeFromNotices(token) as Promise<unknown>,
}));

import UnsubscribePage from "./UnsubscribePage";

const renderAt = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/descadastrar${search}`]}>
      <Routes>
        <Route path="/descadastrar" element={<UnsubscribePage />} />
        <Route path="/" element={<p>Início</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("UnsubscribePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiUnsubscribeFromNotices.mockResolvedValue({
      unsubscribed: true,
      message: "Pronto: você não vai mais receber os avisos do Clubinho.",
    });
  });

  /**
   * Os provedores de e-mail visitam os links das mensagens antes de a pessoa
   * clicar. Agir na abertura tiraria da lista quem nunca tocou no link.
   */
  it("não descadastra ao abrir: pede confirmação", () => {
    renderAt("?token=abc.def");

    expect(apiUnsubscribeFromNotices).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /não quero mais receber/i }),
    ).toBeInTheDocument();
  });

  it("explica o que para e o que continua chegando", () => {
    renderAt("?token=abc.def");

    expect(screen.getByText(/novos materiais da semana/i)).toBeInTheDocument();
    expect(
      screen.getByText(/recuperação de senha e de confirmação/i),
    ).toBeInTheDocument();
  });

  it("descadastra com o token da URL quando a pessoa confirma", async () => {
    renderAt("?token=abc.def");

    await userEvent.click(
      screen.getByRole("button", { name: /não quero mais receber/i }),
    );

    await waitFor(() =>
      expect(apiUnsubscribeFromNotices).toHaveBeenCalledWith("abc.def"),
    );
    expect(await screen.findByText("Tudo certo")).toBeInTheDocument();
  });

  it("desabilita a ação quando o link vem sem token", () => {
    renderAt("");

    expect(
      screen.getByRole("button", { name: /não quero mais receber/i }),
    ).toBeDisabled();
  });

  /** Token inválido é a falha que a API devolve; a mensagem dela é a que vale. */
  it("mostra a falha da API sem perder a página", async () => {
    apiUnsubscribeFromNotices.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          success: false,
          error: { message: "Link de descadastro inválido ou incompleto." },
        },
      },
    });
    renderAt("?token=abc.def");

    await userEvent.click(
      screen.getByRole("button", { name: /não quero mais receber/i }),
    );

    expect(
      await screen.findByText("Link de descadastro inválido ou incompleto."),
    ).toBeInTheDocument();
    // A ação segue disponível: a pessoa pode tentar de novo.
    expect(
      screen.getByRole("button", { name: /não quero mais receber/i }),
    ).toBeInTheDocument();
  });

  it("oferece continuar recebendo, sem chamar a API", async () => {
    renderAt("?token=abc.def");

    await userEvent.click(
      screen.getByRole("link", { name: /continuar recebendo/i }),
    );

    expect(apiUnsubscribeFromNotices).not.toHaveBeenCalled();
    expect(await screen.findByText("Início")).toBeInTheDocument();
  });
});
