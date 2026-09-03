/** Caminho base dos endpoints de fotos do clubinho. */
export const IMAGE_SECTIONS_ENDPOINT = "/image-sections";

/** Campo do multipart que carrega o JSON da publicação. */
export const IMAGE_SECTION_PAYLOAD_FIELD = "sectionData";

/** Paginação da fila de revisão. */
export const IMAGE_SECTIONS_DEFAULT_LIMIT = 12;
export const IMAGE_SECTIONS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: as mais recentes primeiro. */
export const IMAGE_SECTIONS_DEFAULT_SORT = "createdAt";
export const IMAGE_SECTIONS_DEFAULT_ORDER = "DESC";

/** Quantas miniaturas o card mostra antes de resumir o resto. */
export const CARD_THUMBNAIL_LIMIT = 4;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";
