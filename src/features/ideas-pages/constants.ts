import type { IdeasPageFormErrors, IdeasPageListFilters } from './types';
import {
  AudiotrackOutlined,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
} from '@mui/icons-material';
import { MediaType } from '@/store/slices/types';

/** Caminho base dos endpoints da página de ideias. */
export const IDEAS_PAGES_ENDPOINT = '/ideas-pages';

/** Campo multipart que carrega o JSON das requisições. */
export const IDEAS_PAGE_PAYLOAD_FIELD = 'ideasMaterialsPageData';

/**
 * O cliente Axios usa `application/json` por padrão, o que faria o Axios
 * serializar o FormData como JSON. Requisições multipart declaram o tipo; o
 * navegador acrescenta o boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Máximo de caracteres da descrição exibida em um card. */
export const IDEAS_PAGE_CARD_DESCRIPTION_MAX_CHARS = 100;

/** Rotas administrativas das telas de página de ideias. */
export const IDEAS_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-ideias',
  /** O id vai na URL: sem ele um F5 na edição perdia a página carregada. */
  EDIT: '/adm/editar-pagina-ideias',
} as const;

/** Caminho da edição de uma página específica. */
export const ideasPageEditPath = (id: string): string => `${IDEAS_PAGE_ROUTES.EDIT}/${id}`;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const IDEAS_PAGES_DEFAULT_LIMIT = 12;
export const IDEAS_PAGES_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Quantas páginas o seletor de destino carrega de uma vez. */
export const IDEAS_PAGES_SELECTOR_LIMIT = 100;

/** Opções do filtro de visibilidade, na ordem em que aparecem. */
export const IDEAS_PAGE_VISIBILITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Publicadas' },
  { value: 'false', label: 'Rascunhos' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const IDEAS_PAGE_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;

/** Prefixo do campo multipart de cada tipo de mídia enviada. */
export const IDEAS_MEDIA_FILE_PREFIX: Record<MediaType, string> = {
  [MediaType.VIDEO]: 'video',
  [MediaType.DOCUMENT]: 'document',
  [MediaType.IMAGE]: 'image',
  [MediaType.AUDIO]: 'audio',
};

/** Extensão usada quando o arquivo enviado não tem uma reconhecível. */
export const IDEAS_FALLBACK_FILE_EXTENSION = 'bin';

/** Abas de mídia de uma seção, na ordem de apresentação. */
export const IDEAS_MEDIA_TABS: ReadonlyArray<{
  mediaType: MediaType;
  label: string;
  shortLabel: string;
}> = [
  { mediaType: MediaType.DOCUMENT, label: 'Documentos', shortLabel: 'Docs' },
  { mediaType: MediaType.IMAGE, label: 'Imagens', shortLabel: 'Fotos' },
  { mediaType: MediaType.VIDEO, label: 'Vídeos', shortLabel: 'Vídeos' },
  { mediaType: MediaType.AUDIO, label: 'Áudios', shortLabel: 'Áudios' },
];

export const IDEAS_TITLE_MAX_LENGTH = 255;
export const IDEAS_PAGE_SAVE_TIMEOUT_MS = 300_000;
export const IDEAS_PAGE_NO_ERRORS: IdeasPageFormErrors = {
  title: false,
  subtitle: false,
  description: false,
  sections: false,
  sectionTitles: false,
};
export const IDEAS_PAGE_INITIAL_FILTERS: IdeasPageListFilters = {
  visibility: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Captura `sections.<índice>.…` nos caminhos de erro devolvidos pela API. */
export const IDEAS_SECTION_ERROR_PATH = /^sections\.(\d+)\./;

/** Acima disto, a página abre com as seções recolhidas. */
export const IDEAS_AUTO_COLLAPSE_THRESHOLD = 3;

/** A partir disto a busca por seção aparece. */
export const IDEAS_SECTION_SEARCH_THRESHOLD = 6;

/** Prefixo do id de âncora de cada seção, usado pelo índice lateral. */
export const IDEAS_SECTION_ANCHOR_PREFIX = 'ideas-section-';

/** Ícone de cada aba de mídia: o ícone reconhece o tipo mais rápido que o rótulo. */
export const IDEAS_MEDIA_TAB_ICONS = {
  [MediaType.DOCUMENT]: DescriptionOutlined,
  [MediaType.IMAGE]: ImageOutlined,
  [MediaType.VIDEO]: MovieOutlined,
  [MediaType.AUDIO]: AudiotrackOutlined,
} as const;
