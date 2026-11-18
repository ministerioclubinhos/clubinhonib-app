import type { ReactNode } from "react";

/**
 * Contratos da listagem administrativa.
 *
 * As telas de avaliações, contatos e comentários mostram a mesma coisa — uma
 * grade de cards com busca, filtros e paginação —, então compartilham a casca
 * e entram apenas com o conteúdo de cada card.
 */

/** Opção de um filtro de seleção única. */
export type ListingFilterOption = {
  value: string;
  label: string;
};

/** Filtro exibido na barra de ferramentas. */
export type ListingFilter = {
  id: string;
  label: string;
  value: string;
  options: ListingFilterOption[];
  onChange: (value: string) => void;
};

/** Estado da paginação, tal como a API a devolve. */
export type ListingPagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

/** Selo colorido exibido no canto do card. */
export type ListingBadge = {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
};

/** Uma informação curta na faixa de metadados do card. */
export type ListingMeta = {
  icon?: ReactNode;
  label: string;
};
