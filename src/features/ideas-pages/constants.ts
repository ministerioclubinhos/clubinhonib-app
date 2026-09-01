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

/** Atraso aplicado à busca por título na listagem. */
export const IDEAS_PAGE_SEARCH_DEBOUNCE_MS = 300;

/** Máximo de caracteres da descrição exibida em um card. */
export const IDEAS_PAGE_CARD_DESCRIPTION_MAX_CHARS = 100;

/** Rotas administrativas das telas de página de ideias. */
export const IDEAS_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-ideias',
} as const;

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
];
