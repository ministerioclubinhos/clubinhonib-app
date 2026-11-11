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
