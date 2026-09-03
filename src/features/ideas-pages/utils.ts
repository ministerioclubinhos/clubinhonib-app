import {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
import {
  IDEAS_FALLBACK_FILE_EXTENSION,
  IDEAS_MEDIA_FILE_PREFIX,
  IDEAS_PAGE_CARD_DESCRIPTION_MAX_CHARS,
  IDEAS_PAGE_PAYLOAD_FIELD,
} from './constants';
import {
  IdeasMediaRequest,
  IdeasPageFormValues,
  IdeasPageRequest,
  IdeasPageResponse,
  IdeasPageSortField,
  IdeasPageSortOrder,
  IdeasSectionDraft,
} from './types';

/** Data no formato do Brasil, ou um aviso quando não há data. */
export const formatPtBrDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleString('pt-BR') : 'Não disponível';

/** Recorta um texto para exibição em card. */
export const truncate = (
  text: string = '',
  max: number = IDEAS_PAGE_CARD_DESCRIPTION_MAX_CHARS,
): string => (text.length > max ? `${text.slice(0, max)}...` : text);

/** Copia um texto para a área de transferência. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Extensão do arquivo, ou a de reserva quando o nome não tem uma. */
export const fileExtensionOf = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1
    ? (parts.pop() as string)
    : IDEAS_FALLBACK_FILE_EXTENSION;
};

/**
 * Nome do campo multipart de um arquivo enviado. Os dois índices tornam a
 * chave única na página inteira: duas seções podem ter arquivos na mesma
 * posição, e uma chave repetida sobrescreveria a outra no FormData.
 */
export const buildMediaFieldKey = (
  mediaType: MediaType,
  sectionIndex: number,
  mediaIndex: number,
  fileName: string,
): string =>
  `${IDEAS_MEDIA_FILE_PREFIX[mediaType]}_${sectionIndex}_${mediaIndex}.${fileExtensionOf(fileName)}`;

/** True quando a mídia é um arquivo enviado, e não um link. */
export const isUploadedMedia = (media: MediaItem): boolean =>
  media.uploadType === MediaUploadType.UPLOAD || media.isLocalFile === true;

/**
 * Mapeia uma mídia para o contrato de requisição, anexando o arquivo apenas
 * quando ele é novo — uma mídia já salva é reenviada pelo id e pela URL, e a
 * API preserva o objeto que está no S3.
 */
export const toMediaRequest = (
  media: MediaItem,
  sectionIndex: number,
  mediaIndex: number,
  formData: FormData,
): IdeasMediaRequest => {
  const hasNewFile = Boolean(media.file);
  const fieldKey =
    hasNewFile && media.file
      ? buildMediaFieldKey(
          media.mediaType,
          sectionIndex,
          mediaIndex,
          media.file.name,
        )
      : undefined;

  if (fieldKey && media.file) {
    formData.append(fieldKey, media.file, fieldKey);
  }

  return {
    ...(media.id ? { id: media.id } : {}),
    title: media.title || '',
    description: media.description || '',
    mediaType: media.mediaType,
    uploadType: media.uploadType,
    isLocalFile: isUploadedMedia(media),
    // Um upload novo só tem a URL local de pré-visualização, que a API ignora.
    url: hasNewFile ? '' : media.url || '',
    platformType: media.platformType || MediaPlatform.ANY,
    ...(media.originalName ? { originalName: media.originalName } : {}),
    ...(media.size ? { size: media.size } : {}),
    ...(fieldKey ? { fieldKey } : {}),
  };
};

/** Monta o JSON enviado no campo multipart. */
export const buildIdeasPagePayload = (
  values: IdeasPageFormValues,
  sections: IdeasSectionDraft[],
  formData: FormData,
  pageId?: string,
): IdeasPageRequest => ({
  ...(pageId ? { id: pageId } : {}),
  title: values.title.trim(),
  description: values.description.trim(),
  sections: sections.map((section, sectionIndex) => ({
    ...(section.id ? { id: section.id } : {}),
    title: section.title,
    description: section.description,
    public: section.public,
    medias: section.medias.map((media, mediaIndex) =>
      toMediaRequest(media, sectionIndex, mediaIndex, formData),
    ),
  })),
});

/** Monta o corpo multipart de criação/edição. */
export const buildIdeasPageFormData = (
  values: IdeasPageFormValues,
  sections: IdeasSectionDraft[],
  pageId?: string,
): FormData => {
  const formData = new FormData();

  formData.append(
    IDEAS_PAGE_PAYLOAD_FIELD,
    JSON.stringify(buildIdeasPagePayload(values, sections, formData, pageId)),
  );

  return formData;
};

/** Valores iniciais do formulário a partir da página carregada. */
export const toFormValues = (
  page: IdeasPageResponse | null,
): IdeasPageFormValues => ({
  title: page?.title ?? '',
  description: page?.description ?? '',
});

/** Seções da página no formato editável do formulário. */
export const toSectionDrafts = (
  page: IdeasPageResponse | null,
): IdeasSectionDraft[] =>
  (page?.sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    public: section.public,
    medias: (section.medias ?? []).map(
      (media): MediaItem => ({
        id: media.id,
        title: media.title ?? '',
        description: media.description ?? '',
        mediaType: media.mediaType,
        uploadType: media.uploadType,
        platformType: media.platformType,
        url: media.url ?? '',
        isLocalFile: media.isLocalFile,
        originalName: media.originalName,
        size: media.size,
        // O arquivo só existe quando o admin escolhe um novo nesta sessão.
        file: undefined,
      }),
    ),
  }));

/** Mídias de uma seção filtradas por tipo, preservando a ordem original. */
export const mediasOfType = (
  medias: MediaItem[],
  mediaType: MediaType,
): MediaItem[] => medias.filter((media) => media.mediaType === mediaType);

/**
 * Substitui as mídias de um tipo preservando as dos demais. A ordem entre
 * tipos não é significativa: a página pública separa vídeos, documentos e
 * imagens antes de exibir.
 */
export const replaceMediasOfType = (
  medias: MediaItem[],
  mediaType: MediaType,
  next: MediaItem[],
): MediaItem[] => [
  ...medias.filter((media) => media.mediaType !== mediaType),
  ...next,
];

/** Total de mídias em todas as seções. */
export const countMedia = (sections: IdeasSectionDraft[]): number =>
  sections.reduce((total, section) => total + section.medias.length, 0);


/**
 * Formata a data que a API devolve em ISO.
 *
 * Uma data inválida vira travessão em vez de "Invalid Date" no card.
 */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: IdeasPageSortField;
  order: IdeasPageSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'title' ? 'title' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}
