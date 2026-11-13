import { FeedViewMode } from './types';

/** Endpoint base de galerias de imagens na API. */
export const FEED_IMAGE_PAGES_ENDPOINT = '/image-pages';

/** Página inicial e lote por requisição no feed (dentro do limite máximo de 50 da API). */
export const FEED_INITIAL_PAGE = 1;
export const FEED_SECTIONS_PAGE_SIZE = 6;

/** Tempo de frescor do cache do feed no TanStack Query (2 minutos). */
export const FEED_STALE_TIME_MS = 2 * 60 * 1000;

/** Quantidade máxima de destaques exibidos na faixa superior de stories e no leque do herói. */
export const FEED_MAX_STORY_HIGHLIGHTS = 12;
export const FEED_HERO_POLAROID_LIMIT = 3;

/** Quantidade máxima de quadros exibidos na colagem compacta antes do selo "+N fotos". */
export const FEED_COLLAGE_PREVIEW_LIMIT = 5;

/** Quantidade de cartões-esqueleto exibidos durante o carregamento inicial. */
export const FEED_SKELETON_CARD_COUNT = 2;

/** Limiar horizontal mínimo (px) para gesto de deslize no Lightbox móvel. */
export const FEED_LIGHTBOX_SWIPE_THRESHOLD_PX = 48;

/** Tempo de exibição (ms) do aviso visual de link copiado. */
export const FEED_COPY_FEEDBACK_DURATION_MS = 2400;

/** Alvo mínimo de toque exigido pelas diretrizes de acessibilidade móvel (44x44 px). */
export const FEED_TOUCH_TARGET_PX = 44;

/**
 * Mobile-first proportions shared by the header, content and loading state.
 */
export const FEED_CONTAINER_WIDTH = {
  xs: '98%',
  md: '95%',
} as const;

export const FEED_CONTENT_MAX_WIDTH = 'none';

/** Prefixo de âncora HTML única para links diretos a uma publicação. */
export const FEED_SECTION_ANCHOR_PREFIX = 'publicacao-feed-';

/** Chave local não sensível (apenas IDs públicos de seções) para celebrações no navegador. */
export const FEED_CELEBRATIONS_STORAGE_KEY = 'clubinho_feed_celebrated_v1';

/** Rotas relacionadas ao ecossistema do Feed Clubinho. */
export const FEED_ROUTES = {
  HOME: '/',
  FEED: '/feed-clubinho',
  UPLOAD_PHOTOS: '/imagens-clubinho',
  ADMIN_MEDIA: '/adm/fotos-clubinhos',
} as const;

/** Fábrica estável de query keys do Feed Clubinho (inclui todos os filtros que alteram a resposta). */
export const clubinhoFeedQueryKeys = {
  all: ['clubinho-feed'] as const,
  sections: (pageId: string, limit: number, isAuthenticated: boolean) =>
    ['clubinho-feed', 'sections', { pageId, limit, isAuthenticated }] as const,
};

/** Meses em português para formatação determinística sem depender do locale do sistema operacional. */
export const PT_BR_MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Meses curtos para selos compactos na linha do tempo e cartões. */
export const PT_BR_SHORT_MONTH_NAMES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

/** Rótulos descritivos dos modos de visualização do mural. */
export const FEED_VIEW_MODE_OPTIONS: ReadonlyArray<{
  mode: FeedViewMode;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    mode: FeedViewMode.TIMELINE,
    label: 'Publicações',
    shortLabel: 'Feed',
    description: 'Acompanhe as publicações dos Clubinhos',
  },
  {
    mode: FeedViewMode.BENTO,
    label: 'Momentos',
    shortLabel: 'Momentos',
    description: 'Veja fotos e vídeos de cada encontro',
  },
  {
    mode: FeedViewMode.GALLERY,
    label: 'Fotos e vídeos',
    shortLabel: 'Galeria',
    description: 'Explore as fotos e os vídeos publicados',
  },
] as const;

/** Brand colors follow the public navbar and global styles; surfaces stay neutral. */
export const FEED_PALETTE = {
  canvas: '#f4f6f8',
  canvasElevated: '#ffffff',
  canvasSubtle: '#eef1f4',
  frostedBar: 'rgba(244, 246, 248, 0.96)',
  mediaFallbackGradient: 'linear-gradient(135deg, #52606d 0%, #263238 100%)',
  brandLeaf: '#81d742',
  brandLeafDark: '#2e7d32',
  brandForest: '#2e7d32',
  brandForestDeep: '#256529',
  brandSoft: '#f0f8e9',
  link: '#0073e6',
  sunGold: '#f59e0b',
  sunGoldBright: '#fbbf24',
  sunGoldSoft: '#fef3c7',
  coralHeart: '#c62846',
  coralHeartSoft: '#fff0f3',
  inkPrimary: '#263238',
  inkSecondary: '#52606d',
  inkMuted: '#626e79',
  borderSubtle: '#e2e7eb',
  borderStrong: '#c9d3dc',
  storyRingActive: 'linear-gradient(135deg, #81d742 0%, #2e7d32 100%)',
  storyRingViewed: 'linear-gradient(135deg, #dce1e6 0%, #aab4be 100%)',
  cardShadow: '0 2px 8px rgba(38, 50, 56, 0.03)',
  cardShadowHover: '0 4px 16px rgba(38, 50, 56, 0.07)',
  lightboxBackdrop: '#111820',
} as const;

/** Textos padronizados em português exibidos ao usuário. */
export const FEED_MESSAGES = {
  HERO_EYEBROW: 'NOTÍCIAS DA NOSSA COMUNIDADE',
  DEFAULT_TITLE: 'Feed Clubinho',
  DEFAULT_SUBTITLE: 'Notícias, encontros e momentos especiais dos nossos Clubinhos.',
  MISSING_CONFIG:
    'O identificador da galeria do Feed Clubinho não está configurado neste ambiente.',
  LOAD_ERROR:
    'Não foi possível carregar as publicações do Feed Clubinho agora. Verifique sua conexão e tente novamente.',
  NEXT_PAGE_ERROR: 'Não foi possível carregar mais publicações. Tente novamente.',
  EMPTY_TITLE: 'As novidades dos Clubinhos chegam por aqui',
  EMPTY_DESCRIPTION:
    'Assim que novas fotos, vídeos e histórias dos Clubinhos forem publicadas, elas aparecerão aqui para inspirar toda a comunidade.',
  FILTER_EMPTY_TITLE: 'Nenhuma publicação encontrada',
  FILTER_EMPTY_DESCRIPTION:
    'Tente buscar por outro termo ou limpe o filtro para voltar a ver todas as publicações carregadas.',
  END_OF_FEED: 'Você viu todas as publicações',
} as const;

/** Seletores estáveis (`data-testid`) para testes de ponta a ponta no Playwright. */
export const FEED_TEST_IDS = {
  PAGE_ROOT: 'page-view-clubinho-feed-view',
  HERO_BANNER: 'clubinho-feed-hero-banner',
  HERO_HOME_BUTTON: 'clubinho-feed-hero-home-button',
  HERO_REFRESH_BUTTON: 'clubinho-feed-hero-refresh-button',
  HERO_UPLOAD_BUTTON: 'clubinho-feed-hero-upload-button',
  HERO_MANAGE_BUTTON: 'clubinho-feed-hero-manage-button',
  HERO_POLAROID_DECK: 'clubinho-feed-hero-polaroid-deck',
  STORIES_STRIP: 'clubinho-feed-stories-strip',
  STORY_ITEM_PREFIX: 'clubinho-feed-story-item',
  CONTROL_BAR: 'clubinho-feed-control-bar',
  VIEW_MODE_PREFIX: 'clubinho-feed-view-mode',
  SEARCH_INPUT: 'clubinho-feed-search-input',
  SEARCH_CLEAR: 'clubinho-feed-search-clear',
  TIMELINE_RAIL: 'clubinho-feed-timeline-rail',
  TIMELINE_STREAM: 'clubinho-feed-timeline-stream',
  POST_CARD_PREFIX: 'clubinho-feed-post-card',
  COLLAGE_PREFIX: 'clubinho-feed-collage',
  MEDIA_FRAME_PREFIX: 'clubinho-feed-media-frame',
  BENTO_MURAL: 'clubinho-feed-bento-mural',
  BENTO_TILE_PREFIX: 'clubinho-feed-bento-tile',
  PHOTO_WALL: 'clubinho-feed-photo-wall',
  PHOTO_WALL_ITEM_PREFIX: 'clubinho-feed-photo-wall-item',
  LIGHTBOX_DIALOG: 'clubinho-feed-lightbox-dialog',
  LIGHTBOX_IMAGE: 'clubinho-feed-lightbox-image',
  LIGHTBOX_PREV: 'clubinho-feed-lightbox-prev',
  LIGHTBOX_NEXT: 'clubinho-feed-lightbox-next',
  LIGHTBOX_CLOSE: 'clubinho-feed-lightbox-close',
  LIGHTBOX_THUMB_PREFIX: 'clubinho-feed-lightbox-thumb',
  LOADING_STATE: 'clubinho-feed-loading-state',
  ERROR_STATE: 'clubinho-feed-error-state',
  EMPTY_STATE: 'clubinho-feed-empty-state',
  FILTER_EMPTY_STATE: 'clubinho-feed-filter-empty-state',
  LOAD_MORE_BUTTON: 'clubinho-feed-load-more-button',
} as const;

/**
 * Autoria exibida no feed público quando a publicação não tem autor (álbuns
 * antigos). O painel admin continua mostrando "Autor não informado".
 */
export const FEED_UNKNOWN_AUTHOR_LABEL = 'Comunidade do Clubinho';
