import {
  EMPTY_VALUE,
  IMAGE_SECTIONS_DEFAULT_ORDER,
  IMAGE_SECTIONS_DEFAULT_SORT,
  IMAGE_SECTION_PAYLOAD_FIELD,
} from "./constants";
import type {
  ImageSectionFilters,
  ImageSectionMediaInput,
  ImageSectionPlatform,
  ImageSectionPayload,
  ImageSectionResponse,
  ImageSectionSortField,
  ImageSectionSortOrder,
  ImageSectionUpload,
  ImageSectionsQueryParams,
} from "./types";

/** Corta o texto no limite, preferindo a borda da palavra. */
export function truncate(text = "", max = 100): string {
  if (text.length <= max) return text;

  const cortado = text.slice(0, max);
  const ultimoEspaco = cortado.lastIndexOf(" ");

  return `${ultimoEspaco > max * 0.6 ? cortado.slice(0, ultimoEspaco) : cortado}…`;
}

/** Data e hora no formato do país. */
export function formatDateTime(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** A publicação ainda aguarda aprovação da administração. */
export function isPending(section: ImageSectionResponse): boolean {
  return section.pageId === null;
}

/** Só as imagens, que é o que a grade de miniaturas mostra. */
export function imageMedias(section: ImageSectionResponse) {
  return section.mediaItems.filter((media) => media.mediaType === "image");
}

/** Resumo da quantidade de fotos, para a faixa do card. */
export function mediaSummary(section: ImageSectionResponse): string {
  const total = section.mediaItems.length;
  if (total === 0) return "Sem fotos";

  return total === 1 ? "1 foto" : `${total} fotos`;
}

/**
 * Query string da fila, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export function buildImageSectionsQuery(args: {
  page: number;
  limit: number;
  filters?: ImageSectionFilters;
  sort?: ImageSectionSortField;
  order?: ImageSectionSortOrder;
}): ImageSectionsQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    approved: args.filters?.approved,
    hasMedia: args.filters?.hasMedia,
    sort: args.sort ?? IMAGE_SECTIONS_DEFAULT_SORT,
    order: args.order ?? IMAGE_SECTIONS_DEFAULT_ORDER,
  };
}

/**
 * Monta o multipart da publicação.
 *
 * O JSON vai em `sectionData` e cada arquivo em um campo próprio, endereçado
 * pelo `fieldKey` da mídia correspondente — é assim que a API religa arquivo e
 * mídia do outro lado.
 */
export function buildSectionFormData(
  payload: ImageSectionPayload,
  uploads: ImageSectionUpload[] = [],
): FormData {
  const formData = new FormData();

  formData.append(IMAGE_SECTION_PAYLOAD_FIELD, JSON.stringify(payload));
  uploads.forEach(({ fieldKey, file }) => formData.append(fieldKey, file));

  return formData;
}

/**
 * Corpo da publicação a partir do que a tela tem em mãos.
 *
 * Cada mídia mantém o próprio tipo — a versão anterior marcava tudo como
 * imagem, então um vídeo anexado voltava do servidor como foto. O arquivo novo
 * ganha um `fieldKey`, que é o que religa arquivo e mídia do outro lado.
 */
export function buildSectionUpload(section: {
  caption: string;
  description: string;
  public?: boolean;
  mediaItems: Array<{
    id?: string;
    title?: string;
    description?: string;
    uploadType?: string;
    mediaType?: string;
    isLocalFile?: boolean;
    url?: string;
    platformType?: string;
    originalName?: string;
    size?: number;
    file?: File;
  }>;
}): { payload: ImageSectionPayload; uploads: ImageSectionUpload[] } {
  const uploads: ImageSectionUpload[] = [];

  const mediaItems: ImageSectionMediaInput[] = section.mediaItems.map(
    (media, index) => {
      const base: ImageSectionMediaInput = {
        id: media.id,
        title: media.title || "",
        description: media.description || "",
        uploadType: (media.uploadType as "upload" | "link") ?? "upload",
        mediaType:
          (media.mediaType as "image" | "video" | "document") ?? "image",
        isLocalFile: Boolean(media.isLocalFile),
        url: media.url || "",
        platformType: media.platformType as ImageSectionPlatform | undefined,
        originalName: media.originalName,
        size: media.size,
      };

      if (media.isLocalFile && media.file) {
        const fieldKey = `file_${index}`;
        uploads.push({ fieldKey, file: media.file });
        return { ...base, fieldKey, originalName: media.file.name };
      }

      return base;
    },
  );

  const payload: ImageSectionPayload = {
    caption: section.caption,
    description: section.description,
    mediaItems,
  };

  if (section.public !== undefined) payload.public = section.public;

  return { payload, uploads };
}
