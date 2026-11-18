import { MediaTargetType } from '@/store/slices/types';

/** Prefixo do endereço de cada página de conteúdo (`<prefixo>/:id`). */
export const TEACHER_PAGE_BASE_PATH = {
  [MediaTargetType.WeekMaterialsPage]: '/materiais-semanais',
  [MediaTargetType.IdeasPage]: '/area-do-professor/ideias',
  [MediaTargetType.VideosPage]: '/area-do-professor/videos',
} as const;

/** Listagem de origem de cada tipo: destino da seta de voltar e item ativo do menu. */
export const TEACHER_LIST_PATH = {
  [MediaTargetType.WeekMaterialsPage]: '/lista-materias-semanais',
  [MediaTargetType.IdeasPage]: '/area-do-professor/ideias',
  [MediaTargetType.VideosPage]: '/area-do-professor/videos',
} as const;

export const TEACHER_NESTED_PAGES = [
  MediaTargetType.WeekMaterialsPage,
  MediaTargetType.IdeasPage,
  MediaTargetType.VideosPage,
] as const;

export type NestedEntityType = keyof typeof TEACHER_PAGE_BASE_PATH;

const stripSlashes = (path: string): string => path.replace(/^\/+|\/+$/g, '');

export const isTeacherNestedEntity = (entityType: string): entityType is NestedEntityType =>
  entityType in TEACHER_PAGE_BASE_PATH;

/**
 * Endereço público da página de uma rota dinâmica. Materiais semanais, ideias e
 * vídeos abrem dentro da Área do Professor, por id (`/<listagem>/:id`); os demais
 * tipos mantêm o endereço raiz por slug.
 */
export function getRoutePagePath(route: {
  entityType: string;
  path: string;
  idToFetch: string;
}): string {
  return isTeacherNestedEntity(route.entityType)
    ? `${TEACHER_PAGE_BASE_PATH[route.entityType]}/${route.idToFetch}`
    : `/${stripSlashes(route.path)}`;
}
