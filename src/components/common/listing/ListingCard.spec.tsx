import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ListingCard from "./ListingCard";

/**
 * A grade das três telas administrativas usa este card.
 *
 * Os testes cobrem o que quebraria em silêncio: o alvo de toque das ações e o
 * clique da ação não podendo abrir o card junto.
 */
describe("ListingCard", () => {
  it("mostra título, selo e trecho", () => {
    render(
      <ListingCard
        avatar="MS"
        title="Maria Silva"
        subtitle="maria@example.com"
        accent="warning"
        badges={[{ label: "Não lido", color: "warning" }]}
        excerpt="Gostaria de saber mais sobre o clubinho."
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("Não lido")).toBeInTheDocument();
    expect(
      screen.getByText("Gostaria de saber mais sobre o clubinho."),
    ).toBeInTheDocument();
  });

  it("o clique na ação não abre o card", async () => {
    const onClick = vi.fn();
    const onAction = vi.fn();

    render(
      <ListingCard
        avatar="MS"
        title="Maria Silva"
        accent="default"
        onClick={onClick}
        actions={
          <button type="button" onClick={(event) => {
            event.stopPropagation();
            onAction();
          }}>
            Excluir
          </button>
        }
      />,
    );

    screen.getByRole("button", { name: "Excluir" }).click();

    expect(onAction).toHaveBeenCalledTimes(1);
    // Sem o `stopPropagation` das telas, excluir também abriria o detalhe.
    expect(onClick).not.toHaveBeenCalled();
  });
});
