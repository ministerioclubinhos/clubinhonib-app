import { expect, request, test, type Browser, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { ApiClient, uniqueSuffix } from '../support/api';
import { API_URL, APP_URL } from '../support/env';
import { assertLocalApi } from '../support/emailFlags';
import {
  FEED_COMMENT_TEST_MEDIA,
  FEED_COMMENT_TEST_PASSWORD,
  publishTestSection,
  type FeedCommentTestSection,
  type FeedCommentTestUser,
} from '../support/feedPhotoComments';
import { PhotoCommentStatus, type OwnPhotoCommentResponse } from '../../src/features/feed-photo-comments/types';
import type {
  NotificationDetailDto,
  NotificationsPageDto,
  NotificationSummaryDto,
} from '../../src/features/notifications/types';
import { notificationPreferencesKey } from '../../src/features/notifications/constants';
import { UserRole } from '../../src/types/shared';

/**
 * Central de notificações com a API real: avisos de reprovação criados pelo
 * fluxo de moderação, lidos pela central nova no desktop e no celular.
 *
 * As flags da central e do som são ligadas para todos os perfis durante a
 * rodada e restauradas ao final. Nenhum e-mail sai (flags `email_*` desligadas
 * pelo setup) e nenhuma geração de IA é disparada.
 */

interface FlagState {
  key: string;
  enabled: boolean;
  targetRoles: UserRole[];
}

const FLAGS = ['notification_center_v2', 'notification_sound'] as const;
const REASON = 'Motivo privado da moderação';

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.locator('input[type="password"]').fill(FEED_COMMENT_TEST_PASSWORD);
  await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
}

async function newContext(browser: Browser, width: number, height: number) {
  return browser.newContext({
    baseURL: APP_URL,
    viewport: { width, height },
    storageState: { cookies: [], origins: [] },
  });
}

test.describe('Central de notificações (sininho)', () => {
  test.describe.configure({ mode: 'serial' });

  let admin: ApiClient;
  let author: ApiClient;
  let section: FeedCommentTestSection;
  let user: FeedCommentTestUser;
  let original: FlagState[] = [];
  const noticeIds: string[] = [];
  const suffix = uniqueSuffix();

  /** Cria um comentário do autor e o reprova: um aviso real na inbox. */
  async function rejectNewComment(label: string): Promise<void> {
    const photoId = section.mediaItems[0].id;
    const comment = await author.post<OwnPhotoCommentResponse>(
      `/feed-photo-comments/photos/${photoId}`,
      { text: `${label} ${suffix}`, requestId: randomUUID() }
    );
    await admin.patch(`/feed-photo-comments/${comment.id}/moderation`, {
      status: PhotoCommentStatus.REJECTED,
      expectedVersion: comment.version,
      reason: REASON,
    });
  }

  test.beforeAll(async () => {
    assertLocalApi();
    admin = await ApiClient.login();
    for (const key of FLAGS) {
      const flag = await admin.get<FlagState>(`/feature-flags/${key}`);
      original.push({ key, enabled: flag.enabled, targetRoles: flag.targetRoles });
      await admin.patch(`/feature-flags/${key}`, { enabled: true, targetRoles: [] });
    }
    user = await admin.post<FeedCommentTestUser>('/users', {
      name: `E2E Sininho ${suffix}`,
      email: `e2e.bell.${suffix}@teste.clubinhonib.com`,
      password: FEED_COMMENT_TEST_PASSWORD,
      phone: '11999990000',
      role: UserRole.TEACHER,
      active: true,
      completed: true,
      commonUser: true,
    });
    author = await ApiClient.login(user.email, FEED_COMMENT_TEST_PASSWORD);
    section = await admin.postMultipart<FeedCommentTestSection>('/image-sections', {
      sectionData: JSON.stringify({
        caption: `E2E Sininho ${suffix}`,
        description: 'Fotos para validar a central de notificações.',
        mediaItems: FEED_COMMENT_TEST_MEDIA,
      }),
    });
    const setup = await request.newContext({ baseURL: API_URL });
    try {
      await publishTestSection(setup, admin.token, section);
    } finally {
      await setup.dispose();
    }
    await rejectNewComment('Primeiro');
    await rejectNewComment('Segundo');
    const page = await author.get<NotificationsPageDto>('/notifications/me');
    noticeIds.push(...page.data.map((item) => item.id));
  });

  test.afterAll(async () => {
    for (const flag of original)
      await admin.patch(`/feature-flags/${flag.key}`, {
        enabled: flag.enabled,
        targetRoles: flag.targetRoles,
      });
    original = [];
    if (section) await admin.delete(`/image-sections/${section.id}`);
    if (user) await admin.delete(`/users/${user.id}`);
    await author?.dispose();
    await admin?.dispose();
  });

  test('API: lista enxuta, detalhe privado, isolamento e leitura em lote', async () => {
    const summary = await author.get<NotificationSummaryDto>('/notifications/me/summary');
    expect(summary).toMatchObject({ unreadCount: 2, total: 2 });
    expect(summary.recentUnread).toHaveLength(2);

    const list = await author.get<NotificationsPageDto>('/notifications/me', { status: 'unread' });
    expect(list.unreadCount).toBe(2);
    expect(JSON.stringify(list)).not.toContain(REASON);

    const detail = await author.get<NotificationDetailDto>(`/notifications/me/${noticeIds[0]}`);
    expect(detail.details.reason).toBe(REASON);

    // Outro usuário não enxerga nem lê o aviso.
    expect(await admin.statusOf(`/notifications/me/${noticeIds[0]}`)).toBe(404);
    const guest = await request.newContext({ baseURL: API_URL });
    try {
      expect((await guest.get('/notifications/me/summary')).status()).toBe(401);
      expect(
        (await guest.get('/notifications/me', { params: { unexpected: 'x' } })).status()
      ).toBe(401);
    } finally {
      await guest.dispose();
    }
    const invalid = await request.newContext({ baseURL: API_URL });
    try {
      const response = await invalid.get('/notifications/me', {
        headers: { Authorization: `Bearer ${author.token}` },
        params: { status: 'everything' },
      });
      expect(response.status()).toBe(400);
    } finally {
      await invalid.dispose();
    }
  });

  test('desktop: painel, detalhe sem marcar leitura, filtros, pendências e configurações', async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const context = await newContext(browser, 1280, 800);
    const page = await context.newPage();
    try {
      await login(page, user.email);
      const bell = page.getByTestId('nav-bar-notifications-bell');
      await expect(bell).toHaveAttribute('aria-label', /2 avisos não lidos/);
      await bell.click();
      const center = page.getByTestId('notifications-center-popover');
      await expect(center).toBeVisible();
      await expect(page.getByTestId(`notifications-item-${noticeIds[0]}`)).toBeVisible();
      await expect(page.getByTestId('notifications-list')).not.toContainText(REASON);
      await page.screenshot({ path: '/tmp/notifications-desktop.png' });

      // Abrir o detalhe mostra o motivo, mas não marca como lido.
      await page.getByTestId(`notifications-item-open-${noticeIds[0]}`).click();
      await expect(page.getByTestId('notifications-detail-reason')).toContainText(REASON);
      await page.getByTestId('notifications-detail-back').click();
      await expect(page.getByTestId(`notifications-item-unread-${noticeIds[0]}`)).toBeVisible();
      expect((await author.get<NotificationSummaryDto>('/notifications/me/summary')).unreadCount).toBe(2);

      // “Entendi” persiste e o filtro de não lidas reflete.
      await page.getByTestId('notifications-filter-unread').click();
      await page.getByTestId(`notifications-item-open-${noticeIds[0]}`).click();
      await page.getByTestId('notifications-detail-read').click();
      await expect(page.getByTestId(`notifications-item-${noticeIds[0]}`)).toHaveCount(0);
      await expect(page.getByTestId('notifications-filter-unread')).toHaveAttribute('aria-pressed', 'true');
      await expect(bell).toHaveAttribute('aria-label', /1 aviso não lido/);

      // Pendências do perfil continuam (usuário de teste sem foto).
      await page.getByTestId('notifications-filter-pending').click();
      await expect(page.getByTestId('notifications-pending-missing-photo')).toBeVisible();

      // Configurações: som opt-in, persistido por conta neste navegador.
      await page.getByTestId('notifications-settings-open').click();
      const toggle = page.getByTestId('notifications-sound-toggle').locator('input');
      await expect(toggle).not.toBeChecked();
      await toggle.check();
      const stored = await page.evaluate(
        (key) => window.localStorage.getItem(key),
        notificationPreferencesKey(user.id)
      );
      expect(JSON.parse(stored ?? '{}')).toMatchObject({ version: 1, soundEnabled: true });
      await page.getByTestId('notifications-back').click();

      // Leitura em lote, com confirmação explícita.
      await page.getByTestId('notifications-filter-all').click();
      await page.getByTestId('notifications-mark-all').click();
      await expect(page.getByTestId('notifications-mark-all-confirm')).toBeVisible();
      await page.getByTestId('notifications-mark-all-submit').click();
      await expect(page.getByTestId('notifications-mark-all-result')).toBeVisible();
      expect((await author.get<NotificationSummaryDto>('/notifications/me/summary')).unreadCount).toBe(0);

      // Escape fecha e devolve o foco ao sino.
      await page.keyboard.press('Escape');
      await expect(center).toBeHidden();
      await expect(bell).toBeFocused();
    } finally {
      await context.close();
    }
  });

  test('celular: tela cheia sem corte horizontal e página de histórico', async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await newContext(browser, 390, 844);
    const page = await context.newPage();
    try {
      await login(page, user.email);
      await page.getByTestId('nav-bar-notifications-bell').click();
      const dialog = page.getByTestId('notifications-center-dialog');
      await expect(dialog).toBeVisible();
      await expect(page.getByTestId(`notifications-item-${noticeIds[1]}`)).toBeVisible();
      const overflow = await page
        .getByTestId('notifications-center')
        .evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const bellBox = await page.getByTestId('notifications-close').boundingBox();
      expect(bellBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: '/tmp/notifications-mobile.png' });
      await page.getByTestId('notifications-see-all').click();
      await expect(page).toHaveURL(/\/notificacoes$/);
      // O painel em tela cheia fecha antes de a página assumir a lista.
      await expect(dialog).toBeHidden();
      await page.getByTestId(`notifications-item-open-${noticeIds[1]}`).click();
      await expect(page).toHaveURL(new RegExp(`notification=${noticeIds[1]}`));
      await expect(page.getByTestId('notifications-detail-reason')).toContainText(REASON);
      await page.screenshot({ path: '/tmp/notifications-mobile-detail.png' });
      await page.goBack();
      await expect(page.getByTestId('notifications-list')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('link do aviso atravessa o login e abre o detalhe autorizado', async ({ browser }) => {
    const context = await newContext(browser, 1280, 800);
    const page = await context.newPage();
    try {
      await page.goto(`/notificacoes?notification=${noticeIds[0]}`);
      await expect(page).toHaveURL(/\/login/);
      await login(page, user.email);
      await expect(page).toHaveURL(new RegExp(`/notificacoes\\?notification=${noticeIds[0]}`));
      await expect(page.getByTestId('notifications-detail-reason')).toContainText(REASON);
      // ID inválido não trava a rota.
      await page.goto('/notificacoes?notification=nao-e-um-id');
      await expect(page.getByTestId('notifications-detail-unavailable')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('novo aviso toca uma vez; a primeira carga é silenciosa', async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await newContext(browser, 1280, 800);
    // Áudio sintético substituído por um contador: o teste prova a decisão de
    // tocar, não que o som saiu do alto-falante.
    await context.addInitScript(() => {
      const scope = window as unknown as { __clubinhoPlays: number; AudioContext: unknown };
      scope.__clubinhoPlays = 0;
      class FakeParam {
        setValueAtTime() {}
        linearRampToValueAtTime() {}
      }
      class FakeNode {
        gain = new FakeParam();
        frequency = new FakeParam();
        type = 'sine';
        onended: (() => void) | null = null;
        connect() {}
        start() {}
        stop() {}
      }
      class FakeAudioContext {
        state = 'running';
        currentTime = 0;
        destination = {};
        resume() {
          return Promise.resolve();
        }
        createGain() {
          scope.__clubinhoPlays += 1;
          return new FakeNode();
        }
        createOscillator() {
          return new FakeNode();
        }
      }
      scope.AudioContext = FakeAudioContext;
    });
    await context.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ version: 1, soundEnabled: true, browserNotificationsEnabled: false })
        );
      },
      { key: notificationPreferencesKey(user.id) }
    );
    const page = await context.newPage();
    const plays = () =>
      page.evaluate(() => (window as unknown as { __clubinhoPlays: number }).__clubinhoPlays);
    try {
      await login(page, user.email);
      await expect(page.getByTestId('nav-bar-notifications-bell')).toBeVisible();
      await page.waitForResponse((response) => response.url().includes('/notifications/me/summary'));
      expect(await plays()).toBe(0);

      await rejectNewComment('Terceiro');
      // Polling de 30 s com a aba visível.
      await expect.poll(plays, { timeout: 45_000, intervals: [1_000] }).toBe(1);
      await expect(page.getByTestId('nav-bar-notifications-bell')).toHaveAttribute(
        'aria-label',
        /1 aviso não lido/
      );
      await page.reload();
      await page.waitForResponse((response) => response.url().includes('/notifications/me/summary'));
      await page.waitForTimeout(1_000);
      expect(await plays()).toBe(0);
    } finally {
      await context.close();
    }
  });
});
