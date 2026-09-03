import { MediaType } from '@/store/slices/types';
import { MEDIA_EDITOR_CONFIG } from '@/components/common/media';

/** Base path of the week material endpoints. */
export const WEEK_MATERIALS_ENDPOINT = '/week-material-pages';

/** Multipart field carrying the JSON payload of create/update requests. */
export const WEEK_MATERIAL_PAYLOAD_FIELD = 'weekMaterialsPageData';

/**
 * The shared Axios instance defaults to `application/json`, which would make
 * Axios serialize a FormData body as JSON. Multipart requests must declare the
 * type explicitly; the browser still appends the boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Maximum characters of the description rendered in a card. */
export const WEEK_MATERIAL_CARD_DESCRIPTION_MAX_CHARS = 100;

/** Rotas administrativas usadas pelas telas de material semanal. */
export const WEEK_MATERIAL_ROUTES = {
  /** O id vai na URL: sem ele um F5 na edição perdia a página carregada. */
  EDIT_PAGE: '/adm/editar-pagina-semana',
  MANAGE_PAGES: '/adm/paginas-materiais-semanais',
} as const;

/** Caminho da edição de uma página específica. */
export const weekMaterialEditPath = (id: string): string =>
  `${WEEK_MATERIAL_ROUTES.EDIT_PAGE}/${id}`;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const WEEK_MATERIALS_DEFAULT_LIMIT = 12;
export const WEEK_MATERIALS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de publicação, na ordem em que aparecem. */
export const WEEK_MATERIAL_CURRENT_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Material da semana' },
  { value: 'false', label: 'Demais páginas' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const WEEK_MATERIAL_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;

/** Multipart field prefix used for each uploaded media type. */
export const WEEK_MATERIAL_FILE_PREFIX: Record<MediaType, string> = {
  [MediaType.VIDEO]: 'video',
  [MediaType.DOCUMENT]: 'document',
  [MediaType.IMAGE]: 'image',
  [MediaType.AUDIO]: 'audio',
};

/** Extension used when an uploaded file has no recognizable one. */
export const WEEK_MATERIAL_FALLBACK_FILE_EXTENSION = 'bin';

/**
 * Configuração do editor de mídia. Reexportada do componente compartilhado
 * para que material semanal e página de ideias usem a mesma definição.
 */
export const WEEK_MEDIA_EDITOR_CONFIG = MEDIA_EDITOR_CONFIG;

/** Tabs of the admin form and of the public page, in presentation order. */
export const WEEK_MATERIAL_MEDIA_TABS: ReadonlyArray<{
  mediaType: MediaType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
}> = [
  {
    mediaType: MediaType.VIDEO,
    label: 'Vídeos',
    shortLabel: 'Vídeos',
    icon: '🎥',
    color: '#ff5722',
  },
  {
    mediaType: MediaType.DOCUMENT,
    label: 'Documentos',
    shortLabel: 'Doc',
    icon: '📄',
    color: '#2196f3',
  },
  {
    mediaType: MediaType.IMAGE,
    label: 'Imagens',
    shortLabel: 'Img',
    icon: '🖼️',
    color: '#4caf50',
  },
  {
    mediaType: MediaType.AUDIO,
    label: 'Áudios',
    shortLabel: 'Áudio',
    icon: '🎵',
    color: '#9c27b0',
  },
];
