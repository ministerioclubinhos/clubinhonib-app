import type { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

/** Modos de visualização disponíveis no mural do Feed Clubinho. */
export enum FeedViewMode {
  TIMELINE = 'timeline',
  BENTO = 'bento',
  GALLERY = 'gallery',
}

/** Arranjos adaptativos da colagem de fotos conforme a quantidade de itens. */
export enum CollageLayoutKind {
  EMPTY = 'empty',
  SINGLE = 'single',
  DUAL = 'dual',
  TRIO = 'trio',
  QUAD = 'quad',
  BENTO_FIVE_PLUS = 'bento_five_plus',
}

/** Resultado da tentativa de compartilhamento de uma publicação. */
export enum ShareResultKind {
  SHARED_NATIVE = 'shared_native',
  COPIED_LINK = 'copied_link',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

/** DTO de entrada (query params) de `GET /image-pages/:id/sections`. */
export interface QueryClubinhoFeedSectionsParams {
  page: number;
  limit: number;
}

/** DTO de saída de uma mídia dentro de uma seção do feed. */
export interface ClubinhoFeedMediaItemDto {
  id?: string;
  title?: string;
  description?: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  isLocalFile: boolean;
  url?: string;
  platformType?: MediaPlatform;
  originalName?: string;
  size?: number;
}

/** DTO de saída de uma seção (publicação) retornada pela API. */
export interface ClubinhoFeedSectionDto {
  id: string;
  caption: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  mediaItems: ClubinhoFeedMediaItemDto[];
  author?: { name: string } | null;
}

/** DTO de saída paginado de `GET /image-pages/:id/sections`. */
export interface ClubinhoFeedPageDto {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  sections: ClubinhoFeedSectionDto[];
  page: number;
  limit: number;
  total: number;
}

/** Mídia normalizada para exibição segura na interface. */
export interface FeedMediaViewModel {
  key: string;
  id?: string;
  title: string;
  description: string;
  previewUrl: string;
  mediaType: MediaType;
  originalUrl: string;
  platformType: MediaPlatform;
  uploadType: MediaUploadType;
  isLocalFile: boolean;
}

/** Publicação enriquecida para os modos Crônicas, Mural e Stories. */
export interface FeedSectionViewModel {
  id: string;
  anchorId: string;
  caption: string;
  description: string;
  isPublic: boolean;
  clubBadge: string;
  monogram: string;
  authorName: string;
  isVideo: boolean;
  formattedDate: string;
  formattedTime: string;
  relativeDate: string;
  updatedFormattedDate: string | null;
  mediaItems: FeedMediaViewModel[];
  coverUrl: string;
  mediaCount: number;
}

/** Item achatado para o modo Galeria Viva (exposição fotográfica). */
export interface FeedPhotoWallItem {
  key: string;
  sectionId: string;
  sectionCaption: string;
  authorName: string;
  clubBadge: string;
  formattedDate: string;
  mediaIndex: number;
  totalInSection: number;
  previewUrl: string;
  mediaType: MediaType;
  altText: string;
}

/** Resultado consolidado da mesclagem das páginas carregadas pelo feed. */
export interface MergedFeedData {
  pageMeta: Omit<ClubinhoFeedPageDto, 'sections'> | null;
  sections: FeedSectionViewModel[];
  totalSections: number;
  totalLoadedMedia: number;
}

/** Estado de abertura do Lightbox Cinematográfico compartilhado da página. */
export interface ActiveLightboxState {
  section: FeedSectionViewModel;
  initialIndex: number;
}

/** Retorno do hook principal `useClubinhoFeed`. */
export interface UseClubinhoFeedResult {
  feedPageId: string | undefined;
  isMissingConfig: boolean;
  pageMeta: MergedFeedData['pageMeta'];
  sections: FeedSectionViewModel[];
  totalSections: number;
  totalLoadedMedia: number;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  initialErrorMessage: string | null;
  nextPageErrorMessage: string | null;
  loadNextPage: () => void;
  refreshFeed: () => Promise<void>;
}

/** Retorno do hook de celebrações locais (`useFeedCelebrations`). */
export interface UseFeedCelebrationsResult {
  isCelebrated: (sectionId: string) => boolean;
  toggleCelebration: (sectionId: string) => void;
  viewedStoryIds: ReadonlySet<string>;
  markStoryViewed: (sectionId: string) => void;
}

/** Props da página roteada `ClubinhoFeedView`. */
export interface ClubinhoFeedViewProps {
  feed?: boolean;
}

/** Props do cabeçalho editorial `FeedHeroBanner`. */
export interface FeedHeroBannerProps {
  title: string;
  description: string;
  totalSections: number;
  canUploadPhotos: boolean;
  canManageFeed: boolean;
  isRefreshing: boolean;
  onNavigateHome: () => void;
  onNavigateUpload: () => void;
  onNavigateManage: () => void;
  onRefresh: () => void;
}

/** Props da faixa de destaques `FeedStoriesStrip`. */
export interface FeedStoriesStripProps {
  sections: FeedSectionViewModel[];
  viewedStoryIds: ReadonlySet<string>;
  onSelectStory: (section: FeedSectionViewModel) => void;
}

/** Props da barra de descoberta e alternância de modos `FeedControlBar`. */
export interface FeedControlBarProps {
  viewMode: FeedViewMode;
  searchQuery: string;
  visibleCount: number;
  loadedCount: number;
  totalPhotosCount: number;
  onViewModeChange: (mode: FeedViewMode) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

/** Props do índice cronológico lateral `FeedTimelineRail`. */
export interface FeedTimelineRailProps {
  sections: FeedSectionViewModel[];
  activeSectionId: string | null;
  canUploadPhotos: boolean;
  onJumpToSection: (section: FeedSectionViewModel) => void;
  onNavigateUpload: () => void;
  onScrollTop: () => void;
}

/** Props da colagem adaptativa de imagens `AdaptiveMediaCollage`. */
export interface AdaptiveMediaCollageProps {
  sectionId: string;
  caption: string;
  mediaItems: FeedMediaViewModel[];
  onSelectMedia: (mediaIndex: number) => void;
}

/** Props de um quadro individual de foto `FeedMediaFrame`. */
export interface FeedMediaFrameProps {
  src: string;
  mediaType?: MediaType;
  alt: string;
  ariaLabel: string;
  testId: string;
  ambientBackdrop?: boolean;
  aspectRatio?: string;
  minHeight?: number | Record<string, number>;
  maxHeight?: number | Record<string, number>;
  badgeText?: string;
  moreCountOverlay?: number;
  onClick: () => void;
}

/** Props do cartão editorial `FeedPostCard`. */
export interface FeedPostCardProps {
  section: FeedSectionViewModel;
  isCelebrated: boolean;
  isCopied: boolean;
  onToggleCelebrate: (sectionId: string) => void;
  onShare: (section: FeedSectionViewModel) => void;
  onOpenLightbox: (section: FeedSectionViewModel, mediaIndex: number) => void;
}

/** Props do mural em mosaico `FeedBentoMural`. */
export interface FeedBentoMuralProps {
  sections: FeedSectionViewModel[];
  isCelebrated: (sectionId: string) => boolean;
  onToggleCelebrate: (sectionId: string) => void;
  onOpenLightbox: (section: FeedSectionViewModel, mediaIndex: number) => void;
}

/** Props da exposição fotográfica `FeedPhotoWall`. */
export interface FeedPhotoWallProps {
  photos: FeedPhotoWallItem[];
  onSelectPhoto: (photo: FeedPhotoWallItem) => void;
}

/** Props do diálogo de cinema/lightbox `FeedLightboxDialog`. */
export interface FeedLightboxDialogProps {
  activeState: ActiveLightboxState | null;
  onClose: () => void;
}

/** Props do estado de erro `FeedErrorState`. */
export interface FeedErrorStateProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
  onNavigateHome: () => void;
}

/** Props do estado vazio `FeedEmptyState`. */
export interface FeedEmptyStateProps {
  canUploadPhotos: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigateUpload: () => void;
}
