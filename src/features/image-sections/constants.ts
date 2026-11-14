/** Caminho base dos endpoints de fotos do clubinho. */
export const IMAGE_SECTIONS_ENDPOINT = '/image-sections';

/** Campo do multipart que carrega o JSON da publicação. */
export const IMAGE_SECTION_PAYLOAD_FIELD = 'sectionData';

/** Paginação da fila de revisão. */
export const IMAGE_SECTIONS_DEFAULT_LIMIT = 12;
export const IMAGE_SECTIONS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: as mais recentes primeiro. */
export const IMAGE_SECTIONS_DEFAULT_SORT = 'createdAt';
export const IMAGE_SECTIONS_DEFAULT_ORDER = 'DESC';

/** Quantas miniaturas o card mostra antes de resumir o resto. */
export const CARD_THUMBNAIL_LIMIT = 4;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = '—';

export const CLUBINHO_MAX_PHOTOS = 20;
export const CLUBINHO_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const CLUBINHO_MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const CLUBINHO_IMAGE_FORMATS: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
};
export const CLUBINHO_VIDEO_FORMATS: Readonly<Record<string, readonly string[]>> = {
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
};
export const CLUBINHO_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const CLUBINHO_VIDEO_ACCEPT = 'video/mp4,video/webm';
export const CLUBINHO_UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;
export const CLUBINHO_CAPTION_MAX_LENGTH = 255;
