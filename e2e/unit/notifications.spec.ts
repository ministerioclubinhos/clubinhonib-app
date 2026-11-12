import { expect, test } from '@playwright/test';
import {
  addProcessedMarks,
  bellCount,
  buildNotificationPath,
  buildTabMessage,
  chooseAlertChannel,
  dedupeById,
  detectNovelty,
  emptyNoveltyState,
  formatFullDate,
  formatRelativeTime,
  isNotificationId,
  isSafeNotificationPath,
  isTabMessageFor,
  isTerminalStatus,
  isWorkerOpenMessage,
  notificationsRetryDelay,
  parsePreferences,
  parseProcessedMarks,
  resolvePermissionState,
  serializePreferences,
  shouldRetryNotifications,
  summaryPollInterval,
  unprocessedIds,
} from '@/features/notifications/utils';
import {
  NOTIFICATION_COPY,
  NOTIFICATIONS_LONG_ABSENCE_MS,
  NOTIFICATIONS_PROCESSED_TTL_MS,
  NOTIFICATIONS_RECENT_WINDOW,
  NOTIFICATIONS_RETRY_MAX_MS,
  NOTIFICATIONS_SUMMARY_HIDDEN_POLL_MS,
  NOTIFICATIONS_SUMMARY_POLL_MS,
  NOTIFICATIONS_SW_MESSAGE_OPEN,
  NOTIFICATIONS_SW_MESSAGE_VERSION,
} from '@/features/notifications/constants';
import {
  BrowserPermissionState,
  NotificationAlertChannel,
  NotificationType,
  PendingItemId,
  TabMessageKind,
  type NotificationRecentDto,
} from '@/features/notifications/types';
import { toPendingItems } from '@/features/notifications/adapters/profileAlertsAdapter';
import { notificationKeys } from '@/features/notifications/queryKeys';
import { UserRole } from '@/types/shared';

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';
const ID_C = '33333333-3333-4333-8333-333333333333';
const SAME_TIME = '2026-11-12T10:00:00.000Z';

const recent = (...ids: string[]): NotificationRecentDto[] =>
  ids.map((id) => ({ id, type: NotificationType.FEED_COMMENT_REJECTED, createdAt: SAME_TIME }));

test.describe('detector de novidades', () => {
  test('a primeira resposta é silenciosa e vira referência', () => {
    const result = detectNovelty(emptyNoveltyState(), recent(ID_A, ID_B), 1_000);
    expect(result.fresh).toEqual([]);
    expect(result.state.baselineReady).toBe(true);
    expect(result.state.seen).toEqual([ID_A, ID_B]);
  });

  test('um ID novo é novidade, mesmo com o mesmo horário e o mesmo contador', () => {
    const base = detectNovelty(emptyNoveltyState(), recent(ID_A), 1_000).state;
    // ID_A foi lido e ID_B chegou: o contador continua 1, a identidade mudou.
    const next = detectNovelty(base, recent(ID_B), 2_000);
    expect(next.fresh.map((item) => item.id)).toEqual([ID_B]);
  });

  test('ler, recarregar ou repetir o mesmo resumo não gera novidade', () => {
    const base = detectNovelty(emptyNoveltyState(), recent(ID_A, ID_B), 1_000).state;
    expect(detectNovelty(base, recent(ID_A), 2_000).fresh).toEqual([]);
    expect(detectNovelty(base, recent(ID_A, ID_B), 3_000).fresh).toEqual([]);
    expect(detectNovelty(base, [], 4_000).fresh).toEqual([]);
  });

  test('um aviso lido que volta à janela não toca de novo', () => {
    const base = detectNovelty(emptyNoveltyState(), recent(ID_A), 1_000).state;
    const afterRead = detectNovelty(base, [], 2_000).state;
    expect(detectNovelty(afterRead, recent(ID_A), 3_000).fresh).toEqual([]);
  });

  test('ausência longa sincroniza em silêncio', () => {
    const base = detectNovelty(emptyNoveltyState(), recent(ID_A), 1_000).state;
    const later = 1_000 + NOTIFICATIONS_LONG_ABSENCE_MS + 1;
    const result = detectNovelty(base, recent(ID_B, ID_A), later);
    expect(result.fresh).toEqual([]);
    expect(result.state.seen).toContain(ID_B);
  });

  test('rajada maior que a janela é ambígua e sincroniza em silêncio', () => {
    const base = detectNovelty(emptyNoveltyState(), recent(ID_A), 1_000).state;
    const burst = Array.from(
      { length: NOTIFICATIONS_RECENT_WINDOW },
      (_, index) => `${index.toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`
    );
    expect(detectNovelty(base, recent(...burst), 2_000).fresh).toEqual([]);
  });

  test('a memória de IDs é limitada', () => {
    let state = emptyNoveltyState();
    for (let index = 0; index < 400; index += 1)
      state = detectNovelty(state, recent(`id-${index}`), index).state;
    expect(state.seen.length).toBeLessThanOrEqual(200);
    expect(state.seen[0]).toBe('id-399');
  });
});

test.describe('marcas entre abas', () => {
  test('somente IDs ainda não alertados são reivindicados', () => {
    const marks = addProcessedMarks([], [ID_A], 1_000);
    expect(unprocessedIds(marks, [ID_A, ID_B])).toEqual([ID_B]);
  });

  test('marcas expiram e conteúdo inválido é ignorado', () => {
    const raw = JSON.stringify([{ id: ID_A, at: 0 }, { id: ID_B, at: 10 }, { nope: true }]);
    const marks = parseProcessedMarks(raw, NOTIFICATIONS_PROCESSED_TTL_MS + 5);
    expect(marks.map((mark) => mark.id)).toEqual([ID_B]);
    expect(parseProcessedMarks('{quebrado', 0)).toEqual([]);
    expect(parseProcessedMarks(null, 0)).toEqual([]);
    expect(parseProcessedMarks('{"a":1}', 0)).toEqual([]);
  });

  test('a lista de marcas é limitada', () => {
    const ids = Array.from({ length: 150 }, (_, index) => `id-${index}`);
    expect(addProcessedMarks([], ids, 0)).toHaveLength(100);
  });
});

test.describe('preferências', () => {
  test('som e navegador nascem desligados', () => {
    expect(parsePreferences(null)).toEqual({
      soundEnabled: false,
      browserNotificationsEnabled: false,
    });
  });

  test('ida e volta preservam as escolhas', () => {
    const raw = serializePreferences({ soundEnabled: true, browserNotificationsEnabled: false });
    expect(parsePreferences(raw)).toEqual({ soundEnabled: true, browserNotificationsEnabled: false });
    expect(JSON.parse(raw)).toMatchObject({ version: 1 });
  });

  test('conteúdo inválido, versão diferente ou tipos errados usam o padrão seguro', () => {
    expect(parsePreferences('nada')).toEqual(parsePreferences(null));
    expect(parsePreferences(JSON.stringify({ version: 2, soundEnabled: true }))).toEqual(
      parsePreferences(null)
    );
    expect(
      parsePreferences(JSON.stringify({ version: 1, soundEnabled: 'yes' })).soundEnabled
    ).toBe(false);
  });
});

test.describe('canal de alerta', () => {
  const base = { visible: true, centerOpen: false, soundAllowed: true, browserAllowed: true };

  test('aba visível toca; com a central aberta, não toca', () => {
    expect(chooseAlertChannel(base)).toBe(NotificationAlertChannel.SOUND);
    expect(chooseAlertChannel({ ...base, centerOpen: true })).toBe(NotificationAlertChannel.NONE);
    expect(chooseAlertChannel({ ...base, soundAllowed: false })).toBe(NotificationAlertChannel.NONE);
  });

  test('aba oculta usa o aviso do navegador e não soma o toque', () => {
    expect(chooseAlertChannel({ ...base, visible: false })).toBe(NotificationAlertChannel.BROWSER);
    expect(chooseAlertChannel({ ...base, visible: false, browserAllowed: false })).toBe(
      NotificationAlertChannel.SOUND
    );
    expect(
      chooseAlertChannel({ ...base, visible: false, browserAllowed: false, soundAllowed: false })
    ).toBe(NotificationAlertChannel.NONE);
  });

  test('permissão vem do navegador', () => {
    expect(resolvePermissionState({ supported: false, permission: 'granted' })).toBe(
      BrowserPermissionState.UNSUPPORTED
    );
    expect(resolvePermissionState({ supported: true, permission: 'granted' })).toBe(
      BrowserPermissionState.GRANTED
    );
    expect(resolvePermissionState({ supported: true, permission: 'denied' })).toBe(
      BrowserPermissionState.DENIED
    );
    expect(resolvePermissionState({ supported: true, permission: 'default' })).toBe(
      BrowserPermissionState.DEFAULT
    );
  });
});

test.describe('polling e retry', () => {
  test('visível a cada 30 s; oculta só com canal externo pronto; para em erro terminal', () => {
    expect(summaryPollInterval({ visible: true, hiddenChannelReady: false, stopped: false })).toBe(
      NOTIFICATIONS_SUMMARY_POLL_MS
    );
    expect(summaryPollInterval({ visible: false, hiddenChannelReady: true, stopped: false })).toBe(
      NOTIFICATIONS_SUMMARY_HIDDEN_POLL_MS
    );
    expect(summaryPollInterval({ visible: false, hiddenChannelReady: false, stopped: false })).toBe(
      false
    );
    expect(summaryPollInterval({ visible: true, hiddenChannelReady: true, stopped: true })).toBe(false);
  });

  test('autorização e ausência não se repetem; falhas transitórias têm backoff limitado', () => {
    for (const status of [400, 401, 403, 404]) {
      expect(isTerminalStatus(status)).toBe(true);
      expect(shouldRetryNotifications(0, status)).toBe(false);
    }
    expect(shouldRetryNotifications(0, 500)).toBe(true);
    expect(shouldRetryNotifications(0, null)).toBe(true);
    expect(shouldRetryNotifications(2, 503)).toBe(false);
    expect(notificationsRetryDelay(0)).toBeLessThan(notificationsRetryDelay(1));
    expect(notificationsRetryDelay(10)).toBe(NOTIFICATIONS_RETRY_MAX_MS);
  });
});

test.describe('rotas seguras', () => {
  test('aceita só a central com, no máximo, um ID válido', () => {
    expect(isSafeNotificationPath('/notificacoes')).toBe(true);
    expect(isSafeNotificationPath(`/notificacoes?notification=${ID_A}`)).toBe(true);
    for (const path of [
      '/notificacoes?notification=abc',
      `/notificacoes?notification=${ID_A}&x=1`,
      '/notificacoes/../adm',
      '/notificacoesx',
      '//evil.example/notificacoes',
      'https://evil.example/notificacoes',
      '/notificacoes#x',
      '/adm',
      42,
      null,
    ])
      expect(isSafeNotificationPath(path)).toBe(false);
  });

  test('monta o caminho do aviso só com UUID', () => {
    expect(buildNotificationPath(ID_A)).toBe(`/notificacoes?notification=${ID_A}`);
    expect(buildNotificationPath('x')).toBe('/notificacoes');
    expect(isNotificationId(ID_A.toUpperCase())).toBe(true);
    expect(isNotificationId(undefined)).toBe(false);
  });

  test('mensagens do worker e entre abas são validadas', () => {
    const open = {
      type: NOTIFICATIONS_SW_MESSAGE_OPEN,
      version: NOTIFICATIONS_SW_MESSAGE_VERSION,
      path: buildNotificationPath(ID_A),
    };
    expect(isWorkerOpenMessage(open)).toBe(true);
    expect(isWorkerOpenMessage({ ...open, path: 'https://evil.example' })).toBe(false);
    expect(isWorkerOpenMessage({ ...open, version: 2 })).toBe(false);
    expect(isWorkerOpenMessage('x')).toBe(false);
    const message = buildTabMessage('user-a', TabMessageKind.REVISION_CHANGED);
    expect(isTabMessageFor(message, 'user-a')).toBe(true);
    expect(isTabMessageFor(message, 'user-b')).toBe(false);
    expect(isTabMessageFor({ ...message, kind: 'other' }, 'user-a')).toBe(false);
  });
});

test.describe('apresentação', () => {
  test('contador soma avisos e pendências; nome acessível distingue os dois', () => {
    expect(bellCount(3, 2)).toBe(5);
    expect(bellCount(-1, 0)).toBe(0);
    expect(NOTIFICATION_COPY.bellLabel(3, 2)).toBe(
      'Notificações: 3 avisos não lidos e 2 pendências'
    );
    expect(NOTIFICATION_COPY.bellLabel(1, 0)).toBe('Notificações: 1 aviso não lido');
    expect(NOTIFICATION_COPY.bellLabel(0, 1)).toBe('Notificações: 1 pendência');
    expect(NOTIFICATION_COPY.bellLabel(0, 0)).toBe('Notificações');
  });

  test('datas relativas em português e data inválida vazia', () => {
    const now = Date.parse(SAME_TIME);
    expect(formatRelativeTime(SAME_TIME, now + 10_000)).toBe('agora');
    expect(formatRelativeTime(SAME_TIME, now + 5 * 60_000)).toBe('há 5 min');
    expect(formatRelativeTime(SAME_TIME, now + 3 * 3_600_000)).toBe('há 3 h');
    expect(formatRelativeTime(SAME_TIME, now + 24 * 3_600_000)).toBe('ontem');
    expect(formatRelativeTime(SAME_TIME, now + 3 * 24 * 3_600_000)).toBe('há 3 dias');
    expect(formatRelativeTime(SAME_TIME, now + 30 * 24 * 3_600_000)).toMatch(/nov/);
    // Relógio do dispositivo atrasado não produz "há -1 min".
    expect(formatRelativeTime(SAME_TIME, now - 60_000)).toBe('agora');
    expect(formatRelativeTime('inválida', now)).toBe('');
    expect(formatFullDate(SAME_TIME)).toMatch(/2026/);
    expect(formatFullDate('inválida')).toBe('');
  });

  test('páginas deslocadas não duplicam avisos', () => {
    expect(dedupeById([{ id: ID_A }, { id: ID_B }, { id: ID_A }, { id: ID_C }])).toEqual([
      { id: ID_A },
      { id: ID_B },
      { id: ID_C },
    ]);
  });

  test('chaves de cache sempre começam pela conta', () => {
    expect(notificationKeys.summary('u1')).toEqual(['notifications', 'u1', 'summary']);
    expect(notificationKeys.detail('u1', ID_A).slice(0, 2)).toEqual(['notifications', 'u1']);
  });
});

test.describe('pendências do perfil', () => {
  const onLinkClub = () => undefined;
  const alerts = [
    { id: 'email-verification', message: 'Confirme seu e-mail para ativar a conta.' },
    { id: 'missing-photo', message: 'Adicione uma foto ao seu perfil.', to: '/meu-perfil#foto' },
    { id: 'incomplete-account-info', message: 'Conta', to: '/meu-perfil' },
    { id: 'missing-personaldata', message: 'Dados', to: '/meu-perfil#pessoais' },
    { id: 'missing-preferences', message: 'Preferências', to: '/meu-perfil#preferencias' },
  ];

  test('as seis origens mantêm destino; o e-mail sem ação leva à verificação', () => {
    const items = toPendingItems({
      alerts,
      role: UserRole.TEACHER,
      hasClub: false,
      clubLinkEnabled: true,
      onLinkClub,
    });
    expect(items.map((item) => item.id)).toEqual([
      PendingItemId.LINK_CLUB,
      PendingItemId.EMAIL_VERIFICATION,
      PendingItemId.MISSING_PHOTO,
      PendingItemId.INCOMPLETE_ACCOUNT_INFO,
      PendingItemId.MISSING_PERSONAL_DATA,
      PendingItemId.MISSING_PREFERENCES,
    ]);
    expect(items[0].action).toBe(onLinkClub);
    expect(items[1].to).toBe('/verificar-email');
    expect(items[2].to).toBe('/meu-perfil#foto');
  });

  test('vínculo só para professor sem clubinho e com a flag ligada', () => {
    const ids = (role: UserRole, hasClub: boolean, clubLinkEnabled: boolean) =>
      toPendingItems({ alerts: [], role, hasClub, clubLinkEnabled, onLinkClub }).map((item) => item.id);
    expect(ids(UserRole.TEACHER, false, true)).toEqual([PendingItemId.LINK_CLUB]);
    expect(ids(UserRole.TEACHER, true, true)).toEqual([]);
    expect(ids(UserRole.TEACHER, false, false)).toEqual([]);
    expect(ids(UserRole.ADMIN, false, true)).toEqual([]);
  });

  test('IDs desconhecidos não viram pendência', () => {
    expect(
      toPendingItems({
        alerts: [{ id: 'other', message: 'x' }],
        role: null,
        hasClub: false,
        clubLinkEnabled: false,
        onLinkClub,
      })
    ).toEqual([]);
  });
});

test.describe('retorno pós-login', () => {
  const routes = () => import('@/store/slices/auth/authRoutes');

  test('volta ao aviso guardado pelo ProtectedRoute', async () => {
    const { resolvePostLoginDestination } = await routes();
    expect(
      resolvePostLoginDestination(UserRole.TEACHER, {
        pathname: '/notificacoes',
        search: `?notification=${ID_A}`,
      })
    ).toBe(`/notificacoes?notification=${ID_A}`);
    expect(resolvePostLoginDestination(UserRole.ADMIN, { pathname: '/notificacoes' })).toBe(
      '/notificacoes'
    );
  });

  test('qualquer outro destino mantém a tela padrão do papel', async () => {
    const { resolvePostLoginDestination } = await routes();
    expect(resolvePostLoginDestination(UserRole.ADMIN, { pathname: '/adm/usuarios' })).toBe('/adm');
    expect(
      resolvePostLoginDestination(UserRole.TEACHER, { pathname: '//evil.example/notificacoes' })
    ).toBe('/area-do-professor');
    expect(resolvePostLoginDestination(UserRole.COORDINATOR, undefined)).toBe('/adm');
    expect(resolvePostLoginDestination(UserRole.TEACHER, 'notificacoes')).toBe('/area-do-professor');
    expect(
      resolvePostLoginDestination(UserRole.TEACHER, { pathname: '/notificacoes', search: 5 })
    ).toBe('/area-do-professor');
  });
});
