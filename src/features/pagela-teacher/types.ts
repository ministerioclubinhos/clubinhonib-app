import type { PagelaResponse } from "@/features/pagelas/types";

/**
 * Tipos da área do professor.
 *
 * O contrato de `/pagelas` é de `features/pagelas`; aqui ele é reexportado com
 * os nomes que esta área usa, para os componentes não conhecerem dois donos.
 */
export type {
  PagelaResponse as Pagela,
  CreatePagelaRequest as CreatePagelaPayload,
  UpdatePagelaRequest as UpdatePagelaPayload,
  Paginated as PageDto,
  PagelaLaunchWindow,
} from "@/features/pagelas/types";

/** Modos do editor de pagela: lançar uma nova ou corrigir uma existente. */
export enum PagelaEditorMode {
  CREATE = "create",
  EDIT = "edit",
}

/** O que o editor está fazendo agora; `null` quando está fechado. */
export type PagelaEditorState =
  | { mode: PagelaEditorMode.CREATE }
  | {
      mode: PagelaEditorMode.EDIT;
      pagela: PagelaResponse;
    };
