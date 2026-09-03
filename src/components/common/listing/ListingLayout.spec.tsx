import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ListingLayout from "./ListingLayout";

const pagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  onPageChange: () => {},
  onPageSizeChange: () => {},
};

const renderLayout = (summary: React.ReactNode) =>
  render(
    <MemoryRouter>
      <ListingLayout
        title="Feature flags"
        summary={summary}
        toolbar={<div />}
        loading={false}
        itemCount={0}
        emptyTitle="Nada aqui"
        emptySubtitle="Ajuste os filtros."
        pagination={pagination}
        pageSizeOptions={[12]}
      >
        {null}
      </ListingLayout>
    </MemoryRouter>,
  );

describe("ListingLayout", () => {
  it("aceita um resumo em texto", () => {
    renderLayout("12 itens");

    expect(screen.getByText("12 itens")).toBeInTheDocument();
  });

  it("aceita um resumo com elementos de bloco, sem aninhar div em p", () => {
    // O resumo já foi um `<p>`: um conjunto de selos dentro dele quebrava a
    // hidratação do React.
    renderLayout(<div data-testid="resumo">selos</div>);

    const summary = screen.getByTestId("resumo");
    expect(summary.closest("p")).toBeNull();
  });
});
