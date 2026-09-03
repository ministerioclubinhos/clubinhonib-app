import type {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from "@/store/slices/types";

import {
  EMPTY_VALUE,
  IDEAS_SECTIONS_DEFAULT_ORDER,
  IDEAS_SECTIONS_DEFAULT_SORT,
  IDEAS_SECTION_PAYLOAD_FIELD,
  MEDIA_TYPE_LABELS,
} from "./constants";
import type {
  IdeasSectionDraft,
  IdeasSectionFilters,
  IdeasSectionMediaInput,
  IdeasSectionPlatform,
  IdeasSectionPayload,
  IdeasSectionResponse,
  IdeasSectionSortField,
  IdeasSectionSortOrder,
  IdeasSectionSubmission,
  IdeasSectionUpload,
  IdeasSectionsQueryParams,
} from "./types";

/** Corta o texto no limite, sem cortar no meio de uma palavra quando dá. */
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

/** Rótulo do tipo de mídia. */
export function mediaTypeLabel(mediaType: string): string {
  return MEDIA_TYPE_LABELS[mediaType] ?? "Arquivo";
}

/** Tamanho do arquivo em unidade legível. */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return EMPTY_VALUE;

  const unidades = ["B", "KB", "MB", "GB"];
  const escala = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    unidades.length - 1,
  );

  return `${(bytes / 1024 ** escala).toFixed(escala === 0 ? 0 : 1)} ${unidades[escala]}`;
}

/** Resumo das mídias, para a faixa do card. */
export function mediaSummary(section: IdeasSectionResponse): string {
  const total = section.medias.length;
  if (total === 0) return "Sem mídias";

  return total === 1 ? "1 mídia" : `${total} mídias`;
}

/** A ideia ainda aguarda decisão da administração. */
export function isPending(section: IdeasSectionResponse): boolean {
  return section.pageId === null;
}

/**
 * Query string da fila, só com o que a API aceita.
 *
 * Busca vazia não é enviada: `searchString=` peneiraria por texto vazio.
 */
export function buildIdeasSectionsQuery(args: {
  page: number;
  limit: number;
  filters?: IdeasSectionFilters;
  sort?: IdeasSectionSortField;
  order?: IdeasSectionSortOrder;
}): IdeasSectionsQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    sort: args.sort ?? IDEAS_SECTIONS_DEFAULT_SORT,
    order: args.order ?? IDEAS_SECTIONS_DEFAULT_ORDER,
  };
}

/**
 * Monta o multipart da ideia.
 *
 * O JSON vai em `sectionData` e cada arquivo em um campo próprio, endereçado
 * pelo `fieldKey` da mídia correspondente — é assim que a API religa arquivo e
 * mídia do outro lado.
 */
export function buildSectionFormData(
  payload: IdeasSectionPayload,
  uploads: IdeasSectionUpload[] = [],
): FormData {
  const formData = new FormData();

  formData.append(IDEAS_SECTION_PAYLOAD_FIELD, JSON.stringify(payload));
  uploads.forEach(({ fieldKey, file }) => formData.append(fieldKey, file));

  return formData;
}

/** Corpo da ideia a partir do que a API devolveu, para reenviar na edição. */
export function toSectionPayload(
  section: IdeasSectionResponse,
): IdeasSectionPayload {
  return {
    title: section.title,
    description: section.description,
    public: section.public,
    medias: section.medias.map((media) => ({
      id: media.id,
      title: media.title ?? undefined,
      description: media.description ?? undefined,
      uploadType: media.uploadType as "upload" | "link",
      mediaType: media.mediaType as "image" | "video" | "document",
      isLocalFile: media.isLocalFile,
      url: media.url,
      platformType: (media.platformType as IdeasSectionPlatform) ?? undefined,
      originalName: media.originalName ?? undefined,
      size: media.size ?? undefined,
    })),
  };
}

/** A ideia da API no formato editável da tela de revisão. */
export function toSectionDraft(
  section: IdeasSectionResponse,
): IdeasSectionDraft {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    public: section.public,
    medias: section.medias.map((media) => ({
      id: media.id,
      title: media.title ?? "",
      description: media.description ?? "",
      // A API devolve os tipos como texto; os editores falam os enums.
      mediaType: media.mediaType as MediaType,
      uploadType: media.uploadType as MediaUploadType,
      isLocalFile: media.isLocalFile,
      url: media.url,
      platformType: (media.platformType as MediaPlatform) ?? undefined,
      originalName: media.originalName ?? undefined,
      size: media.size ?? undefined,
    })),
  };
}

/**
 * Nome do campo multipart de um arquivo.
 *
 * O primeiro arquivo de cada tipo fica sem número, como a API sempre esperou;
 * os seguintes recebem a posição, para que dois arquivos do mesmo tipo não
 * disputem o mesmo campo.
 */
export function buildUploadFieldKey(
  mediaType: string,
  position: number,
): string {
  return position === 1
    ? `${mediaType}_upload`
    : `${mediaType}${position}_upload`;
}

/**
 * Monta o JSON e os arquivos de uma publicação.
 *
 * Uma mídia de upload sem arquivo novo mantém a `url` gravada: é assim que a
 * API sabe que o objeto no S3 deve ser reaproveitado. Uma mídia sem arquivo e
 * sem url é descartada — ela não tem conteúdo nenhum para publicar.
 */
export function buildReviewSubmission(
  draft: IdeasSectionDraft,
): IdeasSectionSubmission {
  const uploads: IdeasSectionUpload[] = [];
  const counters: Record<string, number> = {};
  const medias: IdeasSectionMediaInput[] = [];

  for (const media of draft.medias) {
    const isUpload = media.uploadType === "upload";

    const base: IdeasSectionMediaInput = {
      ...(media.id ? { id: media.id } : {}),
      title: media.title,
      description: media.description,
      uploadType: media.uploadType as IdeasSectionMediaInput["uploadType"],
      mediaType: media.mediaType as IdeasSectionMediaInput["mediaType"],
      isLocalFile: isUpload,
    };

    if (isUpload && media.file) {
      counters[media.mediaType] = (counters[media.mediaType] ?? 0) + 1;
      const fieldKey = buildUploadFieldKey(
        media.mediaType,
        counters[media.mediaType],
      );

      uploads.push({ fieldKey, file: media.file });
      medias.push({
        ...base,
        fieldKey,
        originalName: media.file.name,
        size: media.file.size,
      });
      continue;
    }

    if (isUpload && media.url) {
      medias.push({
        ...base,
        url: media.url,
        originalName: media.originalName,
        size: media.size,
      });
      continue;
    }

    if (!isUpload && media.url) {
      medias.push({
        ...base,
        url: media.url,
        platformType: media.platformType as IdeasSectionPlatform | undefined,
      });
      continue;
    }

    // Sem arquivo e sem endereço não há o que publicar; a mídia fica de fora.
  }

  return {
    payload: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      public: draft.public,
      medias,
    },
    uploads,
  };
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: IdeasSectionSortField;
  order: IdeasSectionSortOrder;
} {
  const [sort, order] = value.split(":");
  return {
    sort: sort === "title" ? "title" : "createdAt",
    order: order === "ASC" ? "ASC" : "DESC",
  };
}
