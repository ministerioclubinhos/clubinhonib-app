import type { PagelaViewerScope } from "./types";

/** Quantos itens cada painel carrega por vez. */
export { CLUBS_PAGE_LIMIT, CHILDREN_PAGE_LIMIT } from "@/features/pagelas/constants";

/** Espera antes de buscar enquanto se digita. */
export { SEARCH_DEBOUNCE_MS } from "@/features/pagelas/constants";

/** Altura mínima de um item tocável, por tamanho de tela. */
export const TOUCH_TARGET_MOBILE = 56;
export const TOUCH_TARGET_DESKTOP = 48;

/** Texto do painel de clubinhos, conforme o alcance de quem olha. */
export const CLUBS_SUBTITLE: Record<PagelaViewerScope, string> = {
  all: "Selecione um clubinho para ver as crianças",
  own: "Clubinhos que você coordena",
};

/** Mesmo texto, na versão curta que cabe no celular. */
export const CLUBS_SUBTITLE_MOBILE: Record<PagelaViewerScope, string> = {
  all: "Toque em um clubinho para avançar",
  own: "Seus clubinhos — toque para avançar",
};

/** Vazio da lista de clubinhos, que muda de sentido conforme o papel. */
export const CLUBS_EMPTY_MESSAGE: Record<PagelaViewerScope, string> = {
  all: "Nenhum clubinho cadastrado.",
  own: "Você ainda não coordena nenhum clubinho.",
};
