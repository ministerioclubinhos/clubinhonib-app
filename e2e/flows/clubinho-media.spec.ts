import { expect, test } from '@playwright/test';
import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import type { ImageSectionResponse } from '@/features/image-sections/types';
import {
  PhotoCommentStatus,
  type OwnPhotoCommentResponse,
  type PhotoCommentsPage,
  type AdminPhotoCommentResponse,
} from '@/features/feed-photo-comments/types';
import {
  MEDIA_TEST_VIEWPORTS,
  expectNoHorizontalOverflow,
  expectTouchTarget,
} from '../support/responsive';

// A tiny synthetic clip keeps this flow independent of third-party videos.
test('Clubinho: upload video, review, publish with author, and view on mobile', async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  const api = await ApiClient.login();
  const caption = `E2E Vídeo Clubinho 90 ${uniqueSuffix()}`;
  let sectionId: string | undefined;
  try {
    await page.goto('/imagens-clubinho', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('clubinho-upload-submit')).toBeVisible();
    await page.getByTestId('clubinho-upload-submit').click();
    await expect(page.getByTestId('clubinho-upload-error')).toContainText('título');
    for (const viewport of MEDIA_TEST_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expectNoHorizontalOverflow(
        page,
        page.getByTestId('teacher-area-image-section-image-section-editor')
      );
      await expectTouchTarget(page.getByTestId('clubinho-upload-submit'));
    }
    await page.getByLabel('Título da publicação').fill(caption);
    await page
      .getByRole('textbox', { name: /^Descrição/ })
      .fill('Um registro de teste para conferir o envio e a reprodução.');
    await page.getByTestId('clubinho-upload-video-mode').click();
    await page
      .getByTestId('clubinho-upload-input')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await expect(page.getByTestId('clubinho-upload-validation')).toContainText('MP4 ou WebM');
    const bytes = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(0, 0, 160, 90);
      const stream = canvas.captureStream(10);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      const recorded = new Promise<Blob>((resolve) => {
        recorder.ondataavailable = (event) => chunks.push(event.data);
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });
      recorder.start();
      await new Promise((resolve) => setTimeout(resolve, 250));
      ctx.fillStyle = '#81d742';
      ctx.fillRect(10, 10, 140, 70);
      await new Promise((resolve) => setTimeout(resolve, 250));
      recorder.stop();
      const blob = await recorded;
      stream.getTracks().forEach((track) => track.stop());
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    });
    await page
      .getByTestId('clubinho-upload-input')
      .setInputFiles({ name: 'encontro.webm', mimeType: 'video/webm', buffer: Buffer.from(bytes) });
    await expect(page.getByTestId('clubinho-video')).toBeVisible();
    await page.getByTestId('clubinho-upload-photos-mode').click();
    await expect(page.getByTestId('clubinho-upload-validation')).toContainText(
      'Remova os arquivos'
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.screenshot({
      path: testInfo.outputPath('clubinho-video-upload-mobile.png'),
      fullPage: true,
    });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/image-sections') && response.request().method() === 'POST'
    );
    await page.getByTestId('clubinho-upload-submit').click();
    const response = await responsePromise;
    expect(response.status(), await response.text()).toBe(201);
    const created = (await response.json()) as ImageSectionResponse;
    sectionId = created.id;
    expect(created.author?.name).toBeTruthy();
    expect(created.mediaItems[0].mediaType).toBe('video');
    expect(created.public).toBe(false);
    await expect(page.getByTestId('clubinho-upload-success')).toBeVisible();
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/adm/fotos-clubinhos', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Fotos e vídeos dos Clubinhos' })).toBeVisible();
    const card = page.getByTestId(`image-sections-image-section-card-${created.id}`);
    await expect(card).toContainText(created.author!.name);
    await expectNoHorizontalOverflow(page, card);
    await card.getByRole('button', { name: 'Ver detalhes', exact: true }).click();
    await expect(page.getByTestId('clubinho-video')).toBeVisible();
    await expectNoHorizontalOverflow(page, page.getByRole('dialog'));
    await expectTouchTarget(
      page.getByRole('button', { name: 'Revisar e aprovar', exact: true }).last()
    );
    await page.screenshot({ path: testInfo.outputPath('clubinho-video-details-mobile.png') });
    await page.getByRole('button', { name: 'Revisar e aprovar', exact: true }).last().click();
    await expect(page.getByLabel('Título da publicação')).toHaveValue(caption);
    await expectNoHorizontalOverflow(
      page,
      page.getByTestId('teacher-area-image-section-image-section-editor')
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: testInfo.outputPath('clubinho-video-review-desktop.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Salvar sem publicar', exact: true }).click();
    await expect(page).toHaveURL(/\/adm\/fotos-clubinhos$/);
    const draft = await api.get<ImageSectionResponse>(`/image-sections/${created.id}`);
    expect(draft.pageId).toBeNull();
    expect(draft.author).toEqual(created.author);
    expect(await api.statusOf(`/feed-photo-comments/photos/${created.mediaItems[0].id}`)).toBe(404);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/adm/editar-imagens-clubinho/${created.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.getByRole('button', { name: 'Aprovar e publicar', exact: true }).click();
    await expect
      .poll(
        async () => (await api.get<ImageSectionResponse>(`/image-sections/${created.id}`)).public
      )
      .toBe(true);
    await page.goto('/feed-clubinho', { waitUntil: 'domcontentloaded' });
    const post = page.getByTestId(`clubinho-feed-post-card-${created.id}`);
    await expect(post).toContainText(created.author!.name);
    await expect(post.getByTestId('clubinho-video')).toBeVisible();
    await expect(post.getByTestId('clubinho-video')).toHaveAttribute('controls', '');
    await expect
      .poll(() =>
        post
          .getByTestId('clubinho-video')
          .evaluate((element) => (element instanceof HTMLVideoElement ? element.readyState : 0))
      )
      .toBeGreaterThan(0);
    await post.getByTestId('clubinho-video').evaluate(async (element) => {
      if (element instanceof HTMLVideoElement) await element.play();
    });
    await expect
      .poll(() =>
        post
          .getByTestId('clubinho-video')
          .evaluate((element) => (element instanceof HTMLVideoElement ? element.currentTime : 0))
      )
      .toBeGreaterThan(0);
    await expect(post.getByRole('button', { name: 'Comentar', exact: true })).toBeVisible();
    for (const viewport of MEDIA_TEST_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expectNoHorizontalOverflow(page, post);
      await expectTouchTarget(post.getByRole('button', { name: 'Comentar', exact: true }));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.screenshot({
      path: testInfo.outputPath('clubinho-video-feed-mobile.png'),
      fullPage: true,
    });
    await post.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(page.getByRole('dialog').getByTestId('clubinho-video')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(created.author!.name);
    const comments = page.getByTestId('feed-photo-comments-panel');
    for (const viewport of MEDIA_TEST_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expectNoHorizontalOverflow(page, page.getByRole('dialog'));
      await expectNoHorizontalOverflow(page, comments);
    }
    await page.setViewportSize({ width: 320, height: 480 });
    const commentText = `Comentário no vídeo ${caption}`;
    const input = page.getByTestId('feed-photo-comment-input');
    await input.fill(commentText);
    await input.press('ArrowRight');
    await expect(input).toHaveValue(commentText);
    await expectTouchTarget(page.getByTestId('feed-photo-comment-submit'));
    await page.getByTestId('feed-photo-comment-submit').click();
    await expect(page.getByTestId('feed-photo-comment-submitted')).toHaveText(
      'Comentário enviado!'
    );
    const commentPath = `/feed-photo-comments/photos/${created.mediaItems[0].id}`;
    const own = await api.get<PhotoCommentsPage<OwnPhotoCommentResponse>>(`${commentPath}/mine`);
    const comment = own.data.find((item) => item.text === commentText);
    expect(comment?.status).toBe(PhotoCommentStatus.PENDING);
    if (!comment) throw new Error('Comentário do vídeo não persistido');
    expect((await api.get<PhotoCommentsPage<OwnPhotoCommentResponse>>(commentPath)).data).toEqual(
      []
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId('feed-photo-comment-input').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('clubinho-video-comments-mobile.png') });
    await page.getByTestId('clubinho-feed-lightbox-close').click();
    await page.goto('/adm/comentarios?tab=photos', { waitUntil: 'domcontentloaded' });
    const moderation = await api.get<PhotoCommentsPage<AdminPhotoCommentResponse>>(
      '/feed-photo-comments/moderation',
      { searchString: caption }
    );
    expect(moderation.data.find((item) => item.id === comment.id)?.mediaType).toBe('video');
    await page.getByTestId(`feed-photo-comment-review-${comment.id}`).click();
    const review = page.getByTestId('feed-photo-comment-review-dialog');
    await expect(review.getByTestId('clubinho-video')).toBeVisible();
    await expectNoHorizontalOverflow(page, review);
    await expectTouchTarget(page.getByTestId('feed-photo-comment-approve'));
    await page.screenshot({
      path: testInfo.outputPath('clubinho-video-comment-review-mobile.png'),
    });
    await page.getByTestId('feed-photo-comment-approve').click();
    await expect(review).toBeHidden();
    await page.goto('/feed-clubinho', { waitUntil: 'domcontentloaded' });
    await post.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(page.getByTestId(`feed-photo-comment-${comment.id}`)).toContainText(commentText);
    await page.getByTestId('feed-photo-comments-mine-tab').click();
    await page
      .getByTestId(`feed-photo-comment-${comment.id}`)
      .getByRole('button', { name: /Excluir/ })
      .click();
    await page
      .getByTestId('feed-photo-comment-delete-dialog')
      .getByRole('button', { name: 'Excluir', exact: true })
      .click();
    await expect(page.getByTestId(`feed-photo-comment-${comment.id}`)).toHaveCount(0);
  } finally {
    if (sectionId) await api.delete(`/image-sections/${sectionId}`);
    await api.dispose();
  }
});

test('Clubinho: photo selection stays available and removal allows changing mode', async ({
  page,
}) => {
  await page.goto('/imagens-clubinho', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('clubinho-upload-input').setInputFiles([
    { name: 'foto-1.png', mimeType: 'image/png', buffer: PNG_1X1 },
    { name: 'foto-2.png', mimeType: 'image/png', buffer: PNG_1X1 },
  ]);
  await expect(page.getByTestId('clubinho-media-preview')).toHaveCount(2);
  await page.getByTestId('clubinho-upload-video-mode').click();
  await expect(page.getByTestId('clubinho-upload-validation')).toContainText('Remova');
  await page.getByTestId('clubinho-upload-remove').first().click();
  await page.getByTestId('clubinho-upload-remove').first().click();
  await page.getByTestId('clubinho-upload-video-mode').click();
  await expect(page.getByTestId('clubinho-upload-video-mode')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByTestId('clubinho-upload-input')).not.toHaveAttribute('multiple', '');
});
