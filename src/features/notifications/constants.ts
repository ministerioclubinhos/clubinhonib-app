import { BrowserPermissionState, NotificationCenterFilter, NotificationStatusFilter } from './types';

export const NOTIFICATIONS_ENDPOINT = '/notifications/me';
/** Preferência de avisos por e-mail da pessoa logada (mesma do link de descadastro). */
export const EMAIL_PREFERENCES_ENDPOINT = '/email-preferences/me';
export const NOTIFICATIONS_PAGE_SIZE = 10;
export const NOTIFICATIONS_INITIAL_PAGE = 1;

/** Resumo com a aba visível. */
export const NOTIFICATIONS_SUMMARY_POLL_MS = 30_000;
/** Resumo na aba oculta, só com o canal externo pronto. */
export const NOTIFICATIONS_SUMMARY_HIDDEN_POLL_MS = 60_000;
export const NOTIFICATIONS_SUMMARY_STALE_MS = 10_000;
export const NOTIFICATIONS_MAX_RETRIES = 2;
export const NOTIFICATIONS_RETRY_BASE_MS = 2_000;
export const NOTIFICATIONS_RETRY_MAX_MS = 15_000;
/** Status HTTP que não se repetem automaticamente. */
export const NOTIFICATIONS_NO_RETRY_STATUSES: readonly number[] = [400, 401, 403, 404];

/** Mesmo limite do resumo da API: até dez avisos recentes. */
export const NOTIFICATIONS_RECENT_WINDOW = 10;
/** Quantos IDs o detector guarda. */
export const NOTIFICATIONS_SEEN_LIMIT = 200;
/** Ausência a partir da qual a sincronização é silenciosa. */
export const NOTIFICATIONS_LONG_ABSENCE_MS = 5 * 60_000;

export const NOTIFICATIONS_SOUND_COOLDOWN_MS = 10_000;
export const NOTIFICATIONS_SOUND_VOLUME = 0.12;
/** Duas notas curtas (Hz) e a duração de cada uma (s). */
export const NOTIFICATIONS_SOUND_NOTES: readonly number[] = [880, 1318.5];
export const NOTIFICATIONS_SOUND_NOTE_SECONDS = 0.14;

/** Aba oculta espera a visível alertar primeiro. */
export const NOTIFICATIONS_HIDDEN_ALERT_DELAY_MS = 4_000;
export const NOTIFICATIONS_PROCESSED_LIMIT = 100;
export const NOTIFICATIONS_PROCESSED_TTL_MS = 7 * 24 * 60 * 60_000;

export const NOTIFICATIONS_STORAGE_VERSION = 1;
export const NOTIFICATIONS_STORAGE_PREFIX = 'clubinho:notifications:v1';
export const notificationPreferencesKey = (userId: string) =>
  `${NOTIFICATIONS_STORAGE_PREFIX}:${userId}`;
export const notificationProcessedKey = (userId: string) =>
  `${NOTIFICATIONS_STORAGE_PREFIX}:processed:${userId}`;
export const notificationLockName = (userId: string) =>
  `${NOTIFICATIONS_STORAGE_PREFIX}:alert:${userId}`;
export const NOTIFICATIONS_CHANNEL_NAME = 'clubinho-notifications';
export const NOTIFICATIONS_TAB_MESSAGE_VERSION = 1;

export const NOTIFICATIONS_SW_URL = '/notifications-sw.js';
export const NOTIFICATIONS_SW_MESSAGE_OPEN = 'clubinho-notification-open';
export const NOTIFICATIONS_SW_MESSAGE_VERSION = 1;
export const NOTIFICATIONS_EXTERNAL_TITLE = 'Clubinhos NIB';
export const NOTIFICATIONS_EXTERNAL_BODY = 'Você tem um novo aviso. Abra para consultar.';
export const NOTIFICATIONS_EXTERNAL_TEST_BODY = 'As notificações deste navegador estão funcionando.';
export const NOTIFICATIONS_EXTERNAL_TEST_TAG = 'clubinho-notification-test';
export const NOTIFICATIONS_ICON = '/logo192.png';

export const NOTIFICATIONS_ROUTE = '/notificacoes';
export const NOTIFICATIONS_QUERY_PARAM = 'notification';
export const NOTIFICATIONS_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const NOTIFICATIONS_POPOVER_WIDTH = 420;
export const NOTIFICATIONS_TOUCH_TARGET = 44;
export const NOTIFICATIONS_BADGE_MAX = 99;
export const NOTIFICATIONS_PANEL_MAX_HEIGHT = '75dvh';
/** Celular: gaveta que sobe de baixo, do tamanho do conteúdo, até este limite. */
export const NOTIFICATIONS_SHEET_MAX_HEIGHT = '85dvh';
export const NOTIFICATIONS_SHEET_RADIUS = 16;
export const NOTIFICATIONS_NEW_PULSE_MS = 1_600;
export const NOTIFICATIONS_LOCALE = 'pt-BR';
export const NOTIFICATIONS_SKELETON_ROWS = 3;
/** Atualiza as datas relativas exibidas. */
export const NOTIFICATIONS_NOW_TICK_MS = 60_000;

export const NOTIFICATION_FILTER_LABELS: Record<NotificationCenterFilter, string> = {
  [NotificationCenterFilter.ALL]: 'Todas',
  [NotificationCenterFilter.UNREAD]: 'Não lidas',
  [NotificationCenterFilter.PENDING]: 'Pendências',
};

export const NOTIFICATION_FILTERS: readonly NotificationCenterFilter[] =
  Object.values(NotificationCenterFilter);

export const NOTIFICATION_FILTER_STATUS: Record<
  Exclude<NotificationCenterFilter, NotificationCenterFilter.PENDING>,
  NotificationStatusFilter
> = {
  [NotificationCenterFilter.ALL]: NotificationStatusFilter.ALL,
  [NotificationCenterFilter.UNREAD]: NotificationStatusFilter.UNREAD,
};

export const NOTIFICATION_COPY = {
  title: 'Notificações',
  pendingSection: 'Pendências do perfil',
  noticesSection: 'Avisos',
  emptyAll: 'Você não tem notificações.',
  emptyUnread: 'Nenhum aviso não lido.',
  emptyPending: 'Nenhuma pendência.',
  emptyNotices: 'Nenhum aviso por aqui.',
  loading: 'Carregando avisos...',
  error: 'Não foi possível atualizar os avisos.',
  retry: 'Tentar novamente',
  offline: 'Você está sem conexão. A lista pode estar desatualizada.',
  loadMore: 'Carregar mais',
  loadingMore: 'Carregando...',
  seeAll: 'Ver todas',
  markAll: 'Marcar avisos como lidos',
  markAllConfirm: (count: number) =>
    `Marcar ${count === 1 ? 'o aviso não lido' : `todos os ${count} avisos não lidos`} como lidos, inclusive os que ainda não apareceram na lista?`,
  markAllDone: 'Avisos marcados como lidos.',
  markAllError: 'Não foi possível marcar os avisos. Confira a lista antes de tentar de novo.',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  settings: 'Configurações',
  close: 'Fechar',
  back: 'Voltar',
  unread: 'Não lida',
  read: 'Lida',
  markRead: 'Entendi',
  saving: 'Salvando...',
  readError: 'Não foi possível marcar como lida. Tente novamente.',
  detailUnavailable: 'Este aviso não está mais disponível.',
  detailError: 'Não foi possível abrir o aviso.',
  commentLabel: 'Comentário no feed',
  reasonLabel: 'Motivo da reprovação',
  newNotice: 'Você tem um novo aviso.',
  emailSection: 'Por e-mail',
  emailLabel: 'Receber avisos por e-mail',
  emailHelp:
    'Material da semana, eventos, informativos e lembretes do clubinho. E-mails da sua conta e de segurança chegam sempre.',
  emailLoading: 'Carregando sua preferência de e-mail...',
  emailLoadError: 'Não foi possível carregar sua preferência de e-mail.',
  emailSaveError: 'Não foi possível salvar. Tente novamente.',
  deviceSection: 'Neste aparelho',
  deviceHelp: 'Estas opções valem só neste navegador.',
  soundLabel: 'Som de novo aviso',
  soundHelp: 'Um toque curto quando chega um aviso com o site aberto.',
  soundBlocked: 'O navegador bloqueou o som. Toque em “Ativar som”.',
  soundUnlock: 'Ativar som',
  browserLabel: 'Alertas do navegador',
  browserHelp: 'Um alerta discreto quando o site está aberto em outra aba.',
  browserAllow: 'Permitir notificações',
  browserTest: 'Testar notificação',
  browserAsk: 'Receba um aviso neste navegador quando houver uma novidade.',
  browserLater: 'Agora não',
  browserDenied:
    'As notificações estão bloqueadas. Para liberar, abra as configurações do site no navegador (ícone ao lado do endereço) e permita notificações.',
  browserUnsupported:
    'Este navegador não oferece notificações para o site. No iPhone/iPad, adicione o site à Tela de Início para essa opção.',
  browserFailed: 'Não foi possível ativar as notificações. Tente novamente.',
  browserLimit:
    'Com o site fechado ou suspenso pelo navegador, o aviso aparece quando você voltar.',
  bellLabel: (unread: number, pending: number) => {
    const parts: string[] = [];
    if (unread) parts.push(`${unread} ${unread === 1 ? 'aviso não lido' : 'avisos não lidos'}`);
    if (pending) parts.push(`${pending} ${pending === 1 ? 'pendência' : 'pendências'}`);
    return parts.length ? `Notificações: ${parts.join(' e ')}` : 'Notificações';
  },
} as const;

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  soundEnabled: false,
  browserNotificationsEnabled: false,
} as const;

export const PERMISSION_LABELS: Record<BrowserPermissionState, string> = {
  [BrowserPermissionState.GRANTED]: 'Permitido',
  [BrowserPermissionState.DENIED]: 'Bloqueado',
  [BrowserPermissionState.DEFAULT]: 'Aguardando sua escolha',
  [BrowserPermissionState.UNSUPPORTED]: 'Indisponível',
};

/** Oculto na tela e lido pelo leitor de tela (região `aria-live`). */
export const NOTIFICATIONS_VISUALLY_HIDDEN = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
