/** Endpoints do Clubinho Play. */
export const PLAY_ENDPOINT = '/play';
export const PLAY_VIDEOS_ENDPOINT = '/play/videos';
export const PLAY_ADMIN_ENDPOINT = '/play/admin';

/** Rotas do Clubinho Play dentro da Área do Professor. */
export const PLAY_ROUTE = '/area-do-professor/play';
export const PLAY_WATCH_ROUTE = `${PLAY_ROUTE}/:id`;
export const playWatchPath = (id: string): string => `${PLAY_ROUTE}/${id}`;

/** Rota administrativa (categorias e números). */
export const PLAY_ADMIN_ROUTE = '/adm/play';

/** Quantos vídeos cada página da listagem traz. */
export const PLAY_PAGE_SIZE = 12;

/** Quais vídeos de uma galeria vão para o Play. */
export const PLAY_SCOPE = {
  NONE: 'none',
  ALL: 'all',
  SELECTED: 'selected',
} as const;

/** Textos do seletor de modo no formulário da galeria. */
export const PLAY_SCOPE_OPTIONS = [
  { value: PLAY_SCOPE.NONE, label: 'Não aparece', hint: 'A galeria não vai para o Clubinho Play.' },
  {
    value: PLAY_SCOPE.ALL,
    label: 'Galeria inteira',
    hint: 'Todos os vídeos, inclusive os que forem adicionados depois.',
  },
  {
    value: PLAY_SCOPE.SELECTED,
    label: 'Só alguns vídeos',
    hint: 'Marque, na lista de vídeos, quais vão para o Play.',
  },
] as const;

/** Ordenações oferecidas na busca. */
export const PLAY_SORT = {
  CURATED: 'curated',
  RECENT: 'recent',
  POPULAR: 'popular',
  TITLE: 'title',
  CONTINUE: 'continue',
} as const;

export const PLAY_SORT_OPTIONS = [
  { value: PLAY_SORT.CURATED, label: 'Recomendados' },
  { value: PLAY_SORT.RECENT, label: 'Mais recentes' },
  { value: PLAY_SORT.POPULAR, label: 'Mais vistos' },
  { value: PLAY_SORT.TITLE, label: 'A–Z' },
] as const;

/** Tipos de fileira da home (espelham a API). */
export const PLAY_SECTION = {
  FEATURED: 'featured',
  CONTINUE: 'continue',
  LATEST: 'latest',
  POPULAR: 'popular',
  CATEGORY: 'category',
  GALLERY: 'gallery',
} as const;

/** Maior posição aceita pela API. */
export const PLAY_MAX_POSITION = 9999;

/** De quantos em quantos segundos o progresso é enviado enquanto o vídeo toca. */
export const PLAY_PROGRESS_INTERVAL_MS = 10_000;

/** Quanto antes do fim o "continuar de onde parou" deixa de valer. */
export const PLAY_RESUME_MARGIN_SECONDS = 5;

/** Limite da miniatura extraída do vídeo enviado. */
export const PLAY_THUMBNAIL_WIDTH = 640;
export const PLAY_THUMBNAIL_QUALITY = 0.8;
