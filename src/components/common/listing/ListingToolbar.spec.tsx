import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ListingToolbar from "./ListingToolbar";

/**
 * Larguras de tela no jsdom, que não implementa `matchMedia`.
 *
 * As consultas do MUI chegam como texto; basta responder se a largura simulada
 * está abaixo do ponto de corte declarado na consulta.
 */
function mockViewport(width: number): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList => {
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
    },
  );
}

const filtros = [
  {
    id: "situacao",
    label: "Situação",
    value: "",
    options: [
      { value: "", label: "Todos" },
      { value: "true", label: "Publicados" },
    ],
    onChange: () => {},
  },
];

const renderToolbar = () =>
  render(
    <ListingToolbar
      searchValue=""
      searchPlaceholder="Buscar..."
      onSearchChange={() => {}}
      filters={filtros}
      onRefresh={() => {}}
      action={<button type="button">Novo documento</button>}
    />,
  );

describe("ListingToolbar", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("mantém a ação principal visível no celular, sem abrir os filtros", () => {
    // Os filtros ficam recolhidos no celular; a ação principal não pode ficar
    // escondida junto com eles.
    mockViewport(390);

    renderToolbar();

    expect(
      screen.getByRole("button", { name: "Novo documento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
  });

  it("mostra a ação e os filtros abertos no desktop", () => {
    mockViewport(1440);

    renderToolbar();

    expect(
      screen.getByRole("button", { name: "Novo documento" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Situação")).toBeInTheDocument();
  });
});
