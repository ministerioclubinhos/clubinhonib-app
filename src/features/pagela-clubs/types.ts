import type { ChildResponseDto } from "@/features/children/types";
import type { ClubResponse } from "@/features/clubs/types";

/**
 * Tipos da tela `/adm/pagelas`.
 *
 * Os contratos de rede são dos donos: clubinho vem de `features/clubs`,
 * criança de `features/children` e pagela de `features/pagelas`. Aqui ficam
 * apenas os tipos da navegação desta tela.
 */

/** Etapa da navegação no celular, onde os três painéis não cabem lado a lado. */
export type PagelaBrowseStep = "clubs" | "children" | "pagelas";

/** O que a tela tem selecionado no momento. */
export type PagelaSelection = {
  club: ClubResponse | null;
  child: ChildResponseDto | null;
};

/**
 * Alcance de quem está usando a tela.
 *
 * O administrador percorre todos os clubinhos; o coordenador, apenas os que
 * coordena. A API já devolve só o que cada um alcança — isto existe para a
 * tela dizer isso em palavras, e não para filtrar nada.
 */
export type PagelaViewerScope = "all" | "own";
