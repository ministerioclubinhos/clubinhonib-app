/** Envelope `Paginated` compartilhado da API. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Tipos de aviso persistido devolvidos pela API (`NotificationType`). */
export enum NotificationType {
  FEED_COMMENT_REJECTED = 'FEED_COMMENT_REJECTED',
}

/** Filtro de leitura enviado à API. */
export enum NotificationStatusFilter {
  ALL = 'all',
  UNREAD = 'unread',
}

/** Destinos internos conhecidos; a API nunca envia URL. */
export enum NotificationTargetKind {
  FEED_COMMENT = 'FEED_COMMENT',
}

/** Filtros da central (pendências não existem na API). */
export enum NotificationCenterFilter {
  ALL = 'all',
  UNREAD = 'unread',
  PENDING = 'pending',
}

/** Telas internas do painel. */
export enum NotificationCenterView {
  LIST = 'list',
  DETAIL = 'detail',
  SETTINGS = 'settings',
}

/** Onde o conteúdo da central está sendo exibido. */
export enum NotificationPanelVariant {
  POPOVER = 'popover',
  DIALOG = 'dialog',
  PAGE = 'page',
}

/** Estado real da permissão do navegador, ou ausência de suporte. */
export enum BrowserPermissionState {
  DEFAULT = 'default',
  GRANTED = 'granted',
  DENIED = 'denied',
  UNSUPPORTED = 'unsupported',
}

/** Resultado de uma tentativa de tocar o som. */
export enum SoundPlayResult {
  PLAYED = 'played',
  BLOCKED = 'blocked',
  COOLDOWN = 'cooldown',
  UNSUPPORTED = 'unsupported',
}

/** Canal escolhido para alertar uma novidade nesta aba. */
export enum NotificationAlertChannel {
  SOUND = 'sound',
  BROWSER = 'browser',
  NONE = 'none',
}

/** Pendências calculadas do perfil/vínculo (não persistidas). */
export enum PendingItemId {
  EMAIL_VERIFICATION = 'email-verification',
  MISSING_PHOTO = 'missing-photo',
  INCOMPLETE_ACCOUNT_INFO = 'incomplete-account-info',
  MISSING_PERSONAL_DATA = 'missing-personaldata',
  MISSING_PREFERENCES = 'missing-preferences',
  LINK_CLUB = 'link-club',
}

export interface NotificationTarget {
  kind: NotificationTargetKind;
  commentId: string;
}

/** Saída: item da lista (sem comentário nem motivo). */
export interface NotificationItemDto {
  id: string;
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  title: string;
  preview: string;
  target: NotificationTarget;
}

export interface FeedCommentRejectedDetails {
  type: NotificationType.FEED_COMMENT_REJECTED;
  commentText: string;
  reason: string;
}

/** Saída: detalhe autorizado. */
export interface NotificationDetailDto extends NotificationItemDto {
  details: FeedCommentRejectedDetails;
}

/** Saída: página da lista. */
export interface NotificationsPageDto extends Paginated<NotificationItemDto> {
  unreadCount: number;
}

export interface NotificationRecentDto {
  id: string;
  type: NotificationType;
  createdAt: string;
}

/** Saída: preferência de avisos por e-mail da pessoa logada. */
export interface MyEmailPreferencesDto {
  noticesEnabled: boolean;
}

/** Entrada: liga ou desliga os avisos por e-mail. */
export interface UpdateMyEmailPreferencesDto {
  noticesEnabled: boolean;
}

/** Saída: resumo para contador e detecção de novidades. */
export interface NotificationSummaryDto {
  unreadCount: number;
  total: number;
  revision: string;
  recentUnread: NotificationRecentDto[];
}

/** Saída: leitura em lote. */
export interface NotificationsReadAllDto {
  updatedCount: number;
  summary: NotificationSummaryDto;
}

/** Entrada: consulta da lista. */
export interface NotificationsListQuery {
  page: number;
  limit: number;
  status: NotificationStatusFilter;
  type?: NotificationType;
}

/** Pendência exibida na central. Não tem `readAt`: some quando resolvida. */
export interface PendingItem {
  id: PendingItemId;
  message: string;
  to?: string;
  action?: () => void;
}

/** Preferências por conta e navegador. Sem dados privados. */
export interface NotificationPreferences {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface StoredNotificationPreferences extends NotificationPreferences {
  version: number;
}

/** Estado do detector de novidades (somente IDs opacos). */
export interface NoveltyState {
  baselineReady: boolean;
  seen: string[];
  lastCheckedAt: number | null;
}

export interface NoveltyResult {
  state: NoveltyState;
  fresh: NotificationRecentDto[];
}

/** Marca de evento já alertado, compartilhada entre abas. */
export interface ProcessedMark {
  id: string;
  at: number;
}

export interface AlertChannelInput {
  visible: boolean;
  centerOpen: boolean;
  soundAllowed: boolean;
  browserAllowed: boolean;
}

/** Mensagem trocada entre abas da mesma conta. */
export interface TabMessage {
  version: number;
  userId: string;
  kind: TabMessageKind;
}

export enum TabMessageKind {
  REVISION_CHANGED = 'revision-changed',
}

/** Mensagem do service worker para a página. */
export interface WorkerOpenMessage {
  type: string;
  version: number;
  path: string;
}

/** O que a central compartilha com o sino, o painel e a página. */
export interface NotificationContextValue {
  /** Sessão autenticada com a central nova liberada. */
  enabled: boolean;
  /** Histórico protegido disponível (conta ativa). */
  historyEnabled: boolean;
  userId: string | null;
  unreadCount: number;
  pendingItems: PendingItem[];
  summaryError: boolean;
  summaryLoading: boolean;
  /** Animação breve de novidade (respeita redução de movimento). */
  pulse: boolean;
  centerOpen: boolean;
  anchorEl: HTMLElement | null;
  openCenter: (anchor: HTMLElement | null) => void;
  closeCenter: () => void;
  resolvePending: (item: PendingItem) => void;
  refresh: () => void;
  soundAvailable: boolean;
  browserAvailable: boolean;
  preferences: NotificationPreferences;
  permission: BrowserPermissionState;
  soundBlocked: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  unlockSound: () => Promise<void>;
  setBrowserEnabled: (enabled: boolean) => Promise<BrowserPermissionState>;
  testBrowser: () => Promise<boolean>;
}
