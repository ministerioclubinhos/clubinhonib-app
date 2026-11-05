import { expect, request, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { ApiClient, uniqueSuffix } from '../support/api';
import { API_URL, APP_URL } from '../support/env';
import {
  FEED_COMMENT_TEST_MEDIA,
  FEED_COMMENT_TEST_PASSWORD,
  publishTestSection,
  type FeedCommentTestSection,
  type FeedCommentTestUser,
} from '../support/feedPhotoComments';
import {
  PhotoCommentStatus,
  type PhotoCommentNotificationsPage,
  type OwnPhotoCommentResponse,
  type PhotoCommentResponse,
  type PhotoCommentsPage,
} from '../../src/features/feed-photo-comments/types';
import { UserRole } from '../../src/types/shared';

test.describe('Comentários das fotos: aprovação e acesso', () => {
  let admin: ApiClient;
  let author: ApiClient;
  let section: FeedCommentTestSection;
  let user: FeedCommentTestUser;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    admin = await ApiClient.login();
    user = await admin.post<FeedCommentTestUser>('/users', {
      name: `E2E Autor ${suffix}`,
      email: `e2e.photo.${suffix}@teste.clubinhonib.com`,
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
        caption: `E2E Feed ${suffix}`,
        description: 'Fotos para validar comentários moderados.',
        mediaItems: FEED_COMMENT_TEST_MEDIA,
      }),
    });
    const setup = await request.newContext({ baseURL: API_URL });
    try {
      await publishTestSection(setup, admin.token, section);
    } finally {
      await setup.dispose();
    }
  });

  test.afterAll(async () => {
    if (section) await admin.delete(`/image-sections/${section.id}`);
    if (user) await admin.delete(`/users/${user.id}`);
    await author?.dispose();
    await admin?.dispose();
  });

  test('usuário ativo envia no celular, admin aprova e retira do público', async ({
    page,
    browser,
  }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({
      baseURL: APP_URL,
      viewport: { width: 390, height: 844 },
      storageState: { cookies: [], origins: [] },
    });
    const authorPage = await context.newPage();
    const guest = await request.newContext({ baseURL: API_URL });
    const text = `Que encontro especial! ${suffix} <script>texto seguro</script>`;
    try {
      await authorPage.goto('/login');
      await authorPage.getByRole('textbox', { name: 'Email' }).fill(user.email);
      await authorPage.locator('input[type="password"]').fill(FEED_COMMENT_TEST_PASSWORD);
      await authorPage.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
      await expect(authorPage).not.toHaveURL(/\/login$/);
      await authorPage.goto('/feed-clubinho');
      const post = authorPage.getByTestId(`clubinho-feed-post-card-${section.id}`);
      await expect(post).toBeVisible();
      await post.getByRole('button', { name: 'Comentar', exact: true }).click();
      const photoUrl = await authorPage
        .getByTestId('clubinho-feed-lightbox-image')
        .getAttribute('src');
      const photoId = section.mediaItems.find((media) => media.url === photoUrl)?.id;
      expect(photoId).toBeTruthy();
      const input = authorPage.getByTestId('feed-photo-comment-input');
      const commentsPanel = authorPage.getByTestId('feed-photo-comments-panel');
      await expect(authorPage.getByTestId('feed-photo-comment-submit')).toHaveText(
        'Enviar comentário'
      );
      await expect(commentsPanel).not.toContainText(/aprova|triagem|modera/i);
      await input.fill(text);
      await input.press('ArrowRight');
      await expect(input).toHaveValue(text);
      // Navigation must preserve each photo's draft and never mix its comments.
      await authorPage.getByTestId('clubinho-feed-lightbox-next').click();
      await expect(input).toHaveValue('');
      await input.fill('Rascunho da segunda foto');
      await authorPage.getByTestId('clubinho-feed-lightbox-prev').click();
      await expect(input).toHaveValue(text);
      await authorPage.getByTestId('feed-photo-comment-submit').click();
      await expect(authorPage.getByTestId('feed-photo-comment-submitted')).toHaveText(
        'Comentário enviado!'
      );
      const own = await author.get<PhotoCommentsPage<OwnPhotoCommentResponse>>(
        `/feed-photo-comments/photos/${photoId}/mine`
      );
      const comment = own.data.find((item) => item.text === text);
      expect(comment?.status).toBe(PhotoCommentStatus.PENDING);
      if (!comment) throw new Error('Comentário não persistido');
      await expect(authorPage.getByTestId(`feed-photo-comment-${comment.id}`)).toContainText(text);
      await expect(commentsPanel).not.toContainText(/aprova|triagem|modera/i);
      await authorPage.screenshot({
        path: '/tmp/feed-comments-mobile.png',
        animations: 'disabled',
      });

      const before = await guest.get(`/feed-photo-comments/photos/${photoId}`);
      expect(before.ok()).toBe(true);
      expect(((await before.json()) as PhotoCommentsPage<PhotoCommentResponse>).data).toEqual([]);
      await page.goto('/adm/comentarios?tab=photos');
      await expect(page.getByTestId('feed-photo-comments-manager')).toBeVisible();
      await page.getByTestId(`feed-photo-comment-review-${comment.id}`).click();
      await expect(page.getByTestId('feed-photo-comment-review-text')).toHaveText(text);
      await page.screenshot({ path: '/tmp/feed-comments-admin.png', animations: 'disabled' });
      await page.getByTestId('feed-photo-comment-approve').click();
      await expect(page.getByTestId('feed-photo-comment-review-dialog')).toBeHidden();

      const approved = await guest.get(`/feed-photo-comments/photos/${photoId}`);
      const published = (await approved.json()) as PhotoCommentsPage<PhotoCommentResponse>;
      expect(published.data).toHaveLength(1);
      expect(published.data[0]).toMatchObject({ id: comment.id, text });
      expect(Object.keys(published.data[0]).sort()).toEqual([
        'authorName',
        'createdAt',
        'id',
        'mediaId',
        'text',
      ]);

      await authorPage.reload();
      await authorPage.getByTestId(`clubinho-feed-post-comment-${section.id}`).click();
      await expect(authorPage.getByTestId(`feed-photo-comment-${comment.id}`)).toContainText(text);
      await authorPage.getByTestId('clubinho-feed-lightbox-next').click();
      await expect(authorPage.getByTestId(`feed-photo-comment-${comment.id}`)).toHaveCount(0);

      // An administrator can withdraw an already published comment.
      await page.getByRole('combobox', { name: 'Status', exact: true }).click();
      await page.getByRole('option', { name: 'Publicado', exact: true }).click();
      await page.getByTestId(`feed-photo-comment-review-${comment.id}`).click();
      await page.getByTestId('feed-photo-comment-reject').click();
      await expect(page.getByText('Informe o motivo antes de reprovar.')).toBeVisible();
      await page.getByLabel('Motivo da reprovação').fill('Ajuste solicitado pela administração.');
      await page.getByTestId('feed-photo-comment-reject').click();
      await expect(page.getByTestId('feed-photo-comment-review-dialog')).toBeHidden();
      const withdrawn = await guest.get(`/feed-photo-comments/photos/${photoId}`);
      expect(((await withdrawn.json()) as PhotoCommentsPage<PhotoCommentResponse>).data).toEqual(
        []
      );
      const history = await author.get<PhotoCommentsPage<OwnPhotoCommentResponse>>(
        `/feed-photo-comments/photos/${photoId}/mine`
      );
      expect(history.data[0]).toMatchObject({
        status: PhotoCommentStatus.REJECTED,
        moderationReason: 'Ajuste solicitado pela administração.',
        version: 3,
      });

      await authorPage.getByTestId('clubinho-feed-lightbox-prev').click();
      await authorPage.getByTestId('feed-photo-comments-mine-tab').click();
      await expect(authorPage.getByTestId(`feed-photo-comment-${comment.id}`)).toContainText(text);
      await expect(
        authorPage.getByTestId(`feed-photo-comment-rejected-${comment.id}`)
      ).toContainText('Ajuste solicitado pela administração.');
      const inbox = await author.get<PhotoCommentNotificationsPage>(
        '/feed-photo-comments/notifications'
      );
      expect(inbox.unreadCount).toBe(1);
      expect(inbox.data).toHaveLength(1);
      const notice = inbox.data[0];
      expect(notice).toMatchObject({
        commentId: comment.id,
        commentText: text,
        reason: 'Ajuste solicitado pela administração.',
        readAt: null,
      });
      expect(
        (
          await admin.get<PhotoCommentNotificationsPage>('/feed-photo-comments/notifications')
        ).data.some((item) => item.id === notice.id)
      ).toBe(false);
      expect((await guest.get('/feed-photo-comments/notifications')).status()).toBe(401);
      expect(
        (
          await guest.patch(`/feed-photo-comments/notifications/${notice.id}/read`, {
            headers: { Authorization: `Bearer ${admin.token}` },
          })
        ).status()
      ).toBe(404);
      await authorPage.getByTestId('clubinho-feed-lightbox-close').click();
      await authorPage.getByTestId('nav-bar-notifications-bell').click();
      await authorPage.getByTestId(`nav-bar-photo-notification-${notice.id}`).click();
      const notificationDialog = authorPage.getByTestId('feed-photo-comment-notification-dialog');
      await expect(notificationDialog).toContainText(text);
      await expect(authorPage.getByTestId('feed-photo-comment-notification-reason')).toContainText(
        'Ajuste solicitado pela administração.'
      );
      await authorPage.screenshot({
        path: '/tmp/feed-rejection-notification-mobile.png',
        animations: 'disabled',
      });
      await authorPage.getByTestId('feed-photo-comment-notification-read').click();
      await expect(notificationDialog).toBeHidden();
      const readInbox = await author.get<PhotoCommentNotificationsPage>(
        '/feed-photo-comments/notifications'
      );
      expect(readInbox.unreadCount).toBe(0);
      expect(readInbox.data[0].readAt).toBeTruthy();
      await authorPage.reload();
      await authorPage.getByTestId('nav-bar-notifications-bell').click();
      await authorPage.getByTestId(`nav-bar-photo-notification-${notice.id}`).click();
      await expect(authorPage.getByTestId('feed-photo-comment-notification-read')).toHaveCount(0);
      await notificationDialog.getByRole('button', { name: 'Fechar', exact: true }).click();
      await authorPage.getByTestId(`clubinho-feed-post-comment-${section.id}`).click();
      await authorPage.getByTestId('feed-photo-comments-mine-tab').click();
      await authorPage
        .getByTestId(`feed-photo-comment-${comment.id}`)
        .getByRole('button', { name: 'Excluir meu comentário' })
        .click();
      await authorPage
        .getByTestId('feed-photo-comment-delete-dialog')
        .getByRole('button', { name: 'Excluir', exact: true })
        .click();
      await expect(authorPage.getByTestId(`feed-photo-comment-${comment.id}`)).toHaveCount(0);
    } finally {
      await guest.dispose();
      await context.close();
    }
  });

  test('API impede anonimato, moderação sem admin e conta desativada; retries são idempotentes', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const photoId = section.mediaItems[0].id;
    const path = `/feed-photo-comments/photos/${photoId}`;
    const payload = { text: `Idempotência ${suffix}`, requestId: randomUUID() };
    const authorHeaders = { Authorization: `Bearer ${author.token}` };
    try {
      expect((await ctx.post(path, { data: payload })).status()).toBe(401);
      expect(
        (await ctx.get('/feed-photo-comments/moderation', { headers: authorHeaders })).status()
      ).toBe(403);
      const responses = await Promise.all([
        ctx.post(path, { headers: authorHeaders, data: payload }),
        ctx.post(path, { headers: authorHeaders, data: payload }),
      ]);
      for (const response of responses) expect(response.status()).toBe(201);
      const first = (await responses[0].json()) as OwnPhotoCommentResponse;
      const second = (await responses[1].json()) as OwnPhotoCommentResponse;
      expect(first.id).toBe(second.id);
      expect(first.status).toBe(PhotoCommentStatus.PENDING);
      expect(
        (
          await ctx.patch(`/feed-photo-comments/${first.id}/moderation`, {
            headers: authorHeaders,
            data: { status: PhotoCommentStatus.APPROVED, expectedVersion: 1 },
          })
        ).status()
      ).toBe(403);
      const adminHeaders = { Authorization: `Bearer ${admin.token}` };
      expect(
        (
          await ctx.patch(`/feed-photo-comments/${first.id}/moderation`, {
            headers: adminHeaders,
            data: { status: PhotoCommentStatus.APPROVED, expectedVersion: 1 },
          })
        ).ok()
      ).toBe(true);
      expect(
        (
          await ctx.patch(`/feed-photo-comments/${first.id}/moderation`, {
            headers: adminHeaders,
            data: {
              status: PhotoCommentStatus.REJECTED,
              expectedVersion: 1,
              reason: 'Revisão antiga',
            },
          })
        ).status()
      ).toBe(409);
      for (const reason of ['', '   ']) {
        expect(
          (
            await ctx.patch(`/feed-photo-comments/${first.id}/moderation`, {
              headers: adminHeaders,
              data: { status: PhotoCommentStatus.REJECTED, expectedVersion: 2, reason },
            })
          ).status()
        ).toBe(400);
      }
      const decisions = await Promise.all(
        [1, 2].map(() =>
          ctx.patch(`/feed-photo-comments/${first.id}/moderation`, {
            headers: adminHeaders,
            data: {
              status: PhotoCommentStatus.REJECTED,
              expectedVersion: 2,
              reason: 'Dados pessoais no comentário',
            },
          })
        )
      );
      expect(decisions.map((result) => result.status()).sort()).toEqual([200, 409]);
      const inbox = await author.get<PhotoCommentNotificationsPage>(
        '/feed-photo-comments/notifications'
      );
      expect(inbox.data.filter((notice) => notice.commentId === first.id)).toHaveLength(1);
      expect(inbox.unreadCount).toBe(1);
      const noticeId = inbox.data[0].id;
      const readOnce = await author.patch<{ readAt: string }>(
        `/feed-photo-comments/notifications/${noticeId}/read`,
        {}
      );
      const readTwice = await author.patch<{ readAt: string }>(
        `/feed-photo-comments/notifications/${noticeId}/read`,
        {}
      );
      expect(readTwice.readAt).toBe(readOnce.readAt);
      const disabled = await ctx.put(`/users/${user.id}`, {
        headers: adminHeaders,
        data: { active: false },
      });
      expect(disabled.ok()).toBe(true);
      expect(
        (
          await ctx.post(path, {
            headers: authorHeaders,
            data: { ...payload, requestId: randomUUID() },
          })
        ).status()
      ).toBe(403);
      await admin.delete(`/feed-photo-comments/${first.id}`);
    } finally {
      await ctx.dispose();
    }
  });

  test('feed usa 98% no celular e 95% no desktop, sem rolagem horizontal', async ({ page }) => {
    await page.goto('/feed-clubinho');
    const content = page.getByTestId('clubinho-feed-content');
    await expect(content).toBeVisible();
    for (const width of [320, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await content.boundingBox();
      expect(bounds).not.toBeNull();
      expect(Math.abs((bounds?.width ?? 0) - width * (width >= 900 ? 0.95 : 0.98))).toBeLessThan(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
    }
    await page.screenshot({ path: '/tmp/feed-wide-desktop.png' });
  });
});
