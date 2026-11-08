import { MediaType, MediaPlatform, MediaUploadType } from '@/store/slices/types';
import {
  FEED_INITIAL_PAGE,
  FEED_SECTION_ANCHOR_PREFIX,
  FEED_SECTIONS_PAGE_SIZE,
  PT_BR_MONTH_NAMES,
  PT_BR_SHORT_MONTH_NAMES,
} from './constants';
import {
  type ClubinhoFeedMediaItemDto,
  type ClubinhoFeedPageDto,
  type ClubinhoFeedSectionDto,
  CollageLayoutKind,
  type FeedMediaViewModel,
  type FeedPhotoWallItem,
  type FeedSectionViewModel,
  type MergedFeedData,
  type QueryClubinhoFeedSectionsParams,
} from './types';

/** Monta exatamente os parâmetros aceitos por `GET /image-pages/:id/sections`. */
export function buildFeedSectionsQuery(
  page: number = FEED_INITIAL_PAGE,
  limit: number = FEED_SECTIONS_PAGE_SIZE
): QueryClubinhoFeedSectionsParams {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : FEED_INITIAL_PAGE;
  const safeLimit =
    Number.isFinite(limit) && limit >= 1
      ? Math.min(Math.floor(limit), 50)
      : FEED_SECTIONS_PAGE_SIZE;

  return {
    page: safePage,
    limit: safeLimit,
  };
}

/** Indica se ainda existem seções além da página recebida. */
export function hasNextFeedPage(
  pageDto: Pick<ClubinhoFeedPageDto, 'page' | 'limit' | 'total'>
): boolean {
  return pageDto.page * pageDto.limit < pageDto.total;
}

/** Extrai miniatura do Google Drive quando a URL segue o padrão `/d/<id>/`. */
export function extractGoogleDriveThumbnailUrl(url: string): string | null {
  const match = url.match(/\/d\/([^/]+)\//);
  return match?.[1] ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600` : null;
}

/** Resolve a URL de exibição de uma imagem sem mutar o DTO recebido. */
export function resolveFeedMediaPreviewUrl(media: ClubinhoFeedMediaItemDto): string {
  const rawUrl = (media.url ?? '').trim();
  if (!rawUrl) return '';

  if (media.mediaType === MediaType.VIDEO) return rawUrl;

  if (media.uploadType === MediaUploadType.UPLOAD || media.isLocalFile) {
    return rawUrl;
  }

  if (media.uploadType === MediaUploadType.LINK) {
    switch (media.platformType) {
      case MediaPlatform.GOOGLE_DRIVE:
        return extractGoogleDriveThumbnailUrl(rawUrl) ?? rawUrl;
      case MediaPlatform.DROPBOX:
        return rawUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      case MediaPlatform.ONEDRIVE:
        return rawUrl.replace('redir?', 'embed?');
      default:
        return rawUrl;
    }
  }

  return rawUrl;
}

/** Define o arranjo visual da colagem conforme a quantidade de fotos da publicação. */
export function resolveCollageLayout(mediaCount: number): CollageLayoutKind {
  if (mediaCount <= 0) return CollageLayoutKind.EMPTY;
  if (mediaCount === 1) return CollageLayoutKind.SINGLE;
  if (mediaCount === 2) return CollageLayoutKind.DUAL;
  if (mediaCount === 3) return CollageLayoutKind.TRIO;
  if (mediaCount === 4) return CollageLayoutKind.QUAD;
  return CollageLayoutKind.BENTO_FIVE_PLUS;
}

/** Remove acentos e normaliza caixa para busca instantânea em português. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Identifica menção a número de Clubinho no título (ex.: "Clubinho #1", "Clubinho 90"). */
export function extractClubBadgeLabel(caption: string): string {
  const match = caption.match(/clubinho\s*#?\s*(\d{1,4})/i);
  if (match?.[1]) {
    return `Clubinho #${match[1]}`;
  }
  return 'Comunidade NIB';
}

/** Gera monograma curto (ex.: "#1" ou iniciais) para o selo da publicação. */
export function buildCaptionMonogram(caption: string): string {
  const numberMatch = caption.match(/clubinho\s*#?\s*(\d{1,3})/i);
  if (numberMatch?.[1]) {
    return `#${numberMatch[1]}`;
  }

  const words = caption
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'CN';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/** Formata data e hora em português de forma determinística e segura contra datas inválidas. */
export function formatFeedDateParts(isoValue?: string | null): {
  fullDate: string;
  shortDate: string;
  time: string;
  isValid: boolean;
} {
  if (!isoValue) {
    return { fullDate: '—', shortDate: '—', time: '', isValid: false };
  }

  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) {
    return { fullDate: '—', shortDate: '—', time: '', isValid: false };
  }

  const day = parsed.getDate();
  const monthName = PT_BR_MONTH_NAMES[parsed.getMonth()];
  const shortMonth = PT_BR_SHORT_MONTH_NAMES[parsed.getMonth()];
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return {
    fullDate: `${day} de ${monthName} de ${year}`,
    shortDate: `${day} ${shortMonth} ${year}`,
    time: `${hours}:${minutes}`,
    isValid: true,
  };
}

/** Calcula rótulo temporal amigável ("Hoje", "Ontem", "Há N dias" ou data curta). */
export function formatRelativeFeedDate(
  isoValue?: string | null,
  referenceDate: Date = new Date()
): string {
  if (!isoValue) return 'Recente';
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return 'Recente';

  const startOfTarget = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const startOfRef = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const diffDays = Math.round(
    (startOfRef.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays > 1 && diffDays <= 7) return `Há ${diffDays} dias`;

  const day = parsed.getDate();
  const shortMonth = PT_BR_SHORT_MONTH_NAMES[parsed.getMonth()];
  if (parsed.getFullYear() === referenceDate.getFullYear()) {
    return `${day} ${shortMonth}`;
  }
  return `${day} ${shortMonth} ${parsed.getFullYear()}`;
}

/** Constrói ID HTML único e determinístico para rolagem até uma publicação. */
export function buildSectionAnchorId(sectionId: string): string {
  const sanitized = sectionId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `${FEED_SECTION_ANCHOR_PREFIX}${sanitized || 'item'}`;
}

/** Constrói link direto compartilhável para uma publicação específica do feed. */
export function buildSectionShareUrl(origin: string, pathname: string, sectionId: string): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${cleanOrigin}${cleanPath}#${buildSectionAnchorId(sectionId)}`;
}

/** Mapeia uma seção crua da API para o ViewModel consumido pelos componentes visuais. */
export function toFeedSectionViewModel(
  dto: ClubinhoFeedSectionDto,
  referenceDate: Date = new Date(),
  currentUserId?: string | null,
): FeedSectionViewModel {
  const caption = dto.caption?.trim() || 'Momento no Clubinho';
  const description = dto.description?.trim() || '';

  const mediaItems: FeedMediaViewModel[] = (dto.mediaItems ?? [])
    .map((item, idx) => {
      const previewUrl = resolveFeedMediaPreviewUrl(item);
      return {
        key: item.id ? `${dto.id}-${item.id}` : `${dto.id}-media-${idx}`,
        id: item.id,
        title:
          item.title?.trim() ||
          `${caption} — ${item.mediaType === MediaType.VIDEO ? 'Vídeo' : 'Foto'} ${idx + 1}`,
        description: item.description?.trim() || '',
        previewUrl,
        mediaType: item.mediaType,
        originalUrl: (item.url ?? '').trim() || previewUrl,
        platformType: item.platformType ?? MediaPlatform.ANY,
        uploadType: item.uploadType ?? MediaUploadType.UPLOAD,
        isLocalFile: Boolean(item.isLocalFile),
      };
    })
    .filter((item) => Boolean(item.previewUrl));

  const createdParts = formatFeedDateParts(dto.createdAt);
  const updatedParts = formatFeedDateParts(dto.updatedAt);
  const hasDistinctUpdate =
    updatedParts.isValid && createdParts.isValid && updatedParts.fullDate !== createdParts.fullDate;

  return {
    id: dto.id,
    authorId: dto.authorId ?? null,
    anchorId: buildSectionAnchorId(dto.id),
    caption,
    description,
    isPublic: dto.public,
    clubBadge: extractClubBadgeLabel(caption),
    monogram: buildCaptionMonogram(dto.author?.name || caption),
    authorName: dto.author?.name?.trim() || 'Autor não informado',
    isVideo: mediaItems.some((item) => item.mediaType === MediaType.VIDEO),
    formattedDate: createdParts.fullDate,
    formattedTime: createdParts.time,
    relativeDate: formatRelativeFeedDate(dto.createdAt, referenceDate),
    updatedFormattedDate: hasDistinctUpdate ? updatedParts.fullDate : null,
    mediaItems,
    coverUrl: mediaItems[0]?.previewUrl ?? '',
    mediaCount: mediaItems.length,
    celebrators: dto.celebrators ?? [],
    celebrationCount: dto.celebrationCount ?? 0,
    isOwnPublication: Boolean(dto.authorId && currentUserId && dto.authorId === currentUserId),
  };
}

/** Consolida páginas do `useInfiniteQuery` deduplicando seções por `id`. */
export function mergeFeedPages(
  pages: ReadonlyArray<ClubinhoFeedPageDto> | undefined,
  referenceDate: Date = new Date()
): MergedFeedData {
  if (!pages || pages.length === 0) {
    return {
      pageMeta: null,
      sections: [],
      totalSections: 0,
      totalLoadedMedia: 0,
    };
  }

  const firstPage = pages[0];
  const latestPage = pages[pages.length - 1];
  const seenIds = new Set<string>();
  const mergedSections: FeedSectionViewModel[] = [];

  for (const page of pages) {
    for (const rawSection of page.sections ?? []) {
      if (!rawSection?.id || seenIds.has(rawSection.id)) continue;
      seenIds.add(rawSection.id);
      mergedSections.push(toFeedSectionViewModel(rawSection, referenceDate));
    }
  }

  const totalLoadedMedia = mergedSections.reduce((sum, item) => sum + item.mediaCount, 0);

  const { sections: _ignoredSections, ...firstPageMeta } = firstPage;

  return {
    pageMeta: {
      ...firstPageMeta,
      page: latestPage.page,
      total: latestPage.total,
    },
    sections: mergedSections,
    totalSections: latestPage.total,
    totalLoadedMedia,
  };
}

/** Filtra seções já carregadas por título, história, número do Clubinho ou data (sem acentos). */
export function filterFeedSections(
  sections: ReadonlyArray<FeedSectionViewModel>,
  rawQuery: string
): FeedSectionViewModel[] {
  const normalizedQuery = normalizeSearchText(rawQuery);
  if (!normalizedQuery) return [...sections];

  return sections.filter((section) => {
    const searchable = normalizeSearchText(
      `${section.authorName} ${section.caption} ${section.description} ${section.clubBadge} ${section.formattedDate}`
    );
    return searchable.includes(normalizedQuery);
  });
}

/** Achata todas as mídias das seções visíveis para a exposição fotográfica (Galeria Viva). */
export function flattenFeedPhotos(
  sections: ReadonlyArray<FeedSectionViewModel>
): FeedPhotoWallItem[] {
  const items: FeedPhotoWallItem[] = [];

  for (const section of sections) {
    section.mediaItems.forEach((media, index) => {
      items.push({
        key: media.key,
        sectionId: section.id,
        sectionCaption: section.caption,
        authorName: section.authorName,
        mediaType: media.mediaType,
        clubBadge: section.clubBadge,
        formattedDate: section.relativeDate,
        mediaIndex: index,
        totalInSection: section.mediaCount,
        previewUrl: media.previewUrl,
        altText: media.title || `${section.caption} — Foto ${index + 1}`,
      });
    });
  }

  return items;
}

/**
 * Calcula quantas colunas (em grade de 12) cada cartão ocupa no modo Mural Mosaico,
 * garantindo que todas as linhas fechem exatamente 12 colunas em telas `md+`.
 */
export function resolveBentoTileColSpan(index: number, total: number): number {
  if (total <= 1) return 12;

  const fullBlocks = Math.floor(total / 5);
  const fullBlockLimit = fullBlocks * 5;

  if (index < fullBlockLimit) {
    const posInBlock = index % 5;
    if (posInBlock === 0) return 7;
    if (posInBlock === 1) return 5;
    return 4;
  }

  const tailCount = total - fullBlockLimit;
  const tailPos = index - fullBlockLimit;

  if (tailCount === 1) return 12;
  if (tailCount === 2) return tailPos === 0 ? 7 : 5;
  if (tailCount === 3) return 4;
  // tailCount === 4: duas linhas assimétricas espelhadas (7+5 e 5+7)
  const fourPattern = [7, 5, 5, 7] as const;
  return fourPattern[tailPos] ?? 6;
}

/** Formata pluralização simples em português para contadores do cabeçalho e cartões. */
export function formatCountLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
