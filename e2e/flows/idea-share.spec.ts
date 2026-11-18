import { expect, test } from '@playwright/test';
import { mockIdeasApp, originalIdea } from '../support/ideasMocks';
test.use({ storageState: { cookies: [], origins: [] } });
test('explicit media categories, YouTube only for video, remove/undo and immediate success', async ({
  page,
}) => {
  let payload = '';
  await mockIdeasApp(page, async (route, path) => {
    if (path === '/ideas-sections' && route.request().method() === 'POST') {
      payload = route.request().postDataBuffer()?.toString() ?? '';
      await route.fulfill({ status: 201, json: originalIdea });
      return true;
    }
    return false;
  });
  await page.goto('/compartilhar-ideia');
  await page.getByTestId('idea-share-submit').click();
  await expect(page.getByTestId('idea-share-title')).toBeFocused();
  await page.getByTestId('idea-share-title').fill(originalIdea.title);
  await page.getByTestId('idea-share-description').fill(originalIdea.description);
  await expect(page.getByTestId('idea-share-youtube-url-input')).toHaveCount(0);
  await page.getByTestId('idea-share-dropzone-input').setInputFiles({
    name: 'roteiro.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nfile'),
  });
  await page.getByTestId('idea-share-kind-image').click();
  await expect(page.getByTestId('idea-share-youtube-url-input')).toHaveCount(0);
  await page.getByTestId('idea-share-dropzone-input').setInputFiles({
    name: 'incorreto.mov',
    mimeType: 'video/quicktime',
    buffer: Buffer.from('movie'),
  });
  await expect(page.getByTestId('idea-share-validation-alert')).toContainText('incorreto.mov');
  await page.getByTestId('idea-share-kind-video').click();
  await page
    .getByTestId('idea-share-youtube-url-input')
    .fill('https://youtube.com.evil.test/watch?v=abcdefghijk');
  await page.getByTestId('idea-share-youtube-add').click();
  await expect(page.getByTestId('idea-share-validation-alert')).toContainText('válido');
  await page.getByTestId('idea-share-youtube-url-input').fill('https://youtu.be/abcdefghijk');
  await page.getByTestId('idea-share-youtube-url-input').press('Enter');
  await expect(page.getByTestId('idea-share-material-item')).toHaveCount(2);
  await page.getByTestId('idea-share-material-remove').first().click();
  await page.getByTestId('idea-share-material-undo').click();
  await page.getByTestId('idea-share-submit').click();
  await expect(page.getByTestId('idea-share-success')).toBeVisible();
  expect(payload).toContain('"mediaType":"document"');
  expect(payload).toContain('"platformType":"youtube"');
  expect(payload.match(/"title"/g) ?? []).toHaveLength(1);
  expect(payload.match(/"description"/g) ?? []).toHaveLength(1);
  await page.getByTestId('idea-share-success-new-idea').click();
  await expect(page.getByTestId('idea-share-title')).toHaveValue('');
});
for (const width of [390, 1440])
  test(`share uses requested width and fits ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockIdeasApp(page);
    await page.goto('/compartilhar-ideia');
    await expect(page.getByTestId('idea-share-form')).toBeVisible();
    const dimensions = await page.getByTestId('idea-share-form').evaluate((el) => ({
      width: el.clientWidth,
      content: el.scrollWidth,
      container: el.querySelector('.MuiContainer-root')?.getBoundingClientRect().width ?? 0,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.width + 1);
    expect(dimensions.container / dimensions.width).toBeCloseTo(width < 900 ? 0.98 : 0.95, 2);
    if (width === 390) {
      expect(
        await page
          .getByTestId('idea-share-submit-bar')
          .evaluate((el) => getComputedStyle(el).position)
      ).toBe('fixed');
      const button = await page.getByTestId('idea-share-submit').boundingBox();
      expect(button?.height).toBeGreaterThanOrEqual(44);
      expect(button!.y + button!.height).toBeLessThanOrEqual(1000);
    }
    await page.screenshot({ path: testInfo.outputPath(`share-${width}.png`), fullPage: true });
  });

test('preserves the draft after an API failure and retries the same submission', async ({
  page,
}) => {
  let attempts = 0;
  await mockIdeasApp(page, async (route, path) => {
    if (path === '/ideas-sections' && route.request().method() === 'POST') {
      attempts++;
      await route.fulfill(
        attempts === 1
          ? { status: 500, json: { success: false, error: { message: 'Falha temporária' } } }
          : { status: 201, json: originalIdea }
      );
      return true;
    }
    return false;
  });
  await page.goto('/compartilhar-ideia');
  await page.getByTestId('idea-share-title').fill(originalIdea.title);
  await page.getByTestId('idea-share-description').fill(originalIdea.description);
  await page.getByTestId('idea-share-dropzone-input').setInputFiles({
    name: 'roteiro.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\nfile'),
  });
  await page.getByTestId('idea-share-submit').click();
  await expect(page.getByTestId('idea-share-error-alert')).toBeVisible();
  await expect(page.getByTestId('idea-share-title')).toHaveValue(originalIdea.title);
  await expect(page.getByTestId('idea-share-material-item')).toHaveCount(1);
  await page.getByTestId('idea-share-error-retry').click();
  await expect(page.getByTestId('idea-share-success')).toBeVisible();
  expect(attempts).toBe(2);
});

test('prevents duplicate submission while the API confirmation is pending', async ({ page }) => {
  let requests = 0;
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await mockIdeasApp(page, async (route, path) => {
    if (path === '/ideas-sections' && route.request().method() === 'POST') {
      requests++;
      await pending;
      await route.fulfill({ status: 201, json: originalIdea });
      return true;
    }
    return false;
  });
  await page.goto('/compartilhar-ideia');
  await page.getByTestId('idea-share-title').fill(originalIdea.title);
  await page.getByTestId('idea-share-description').fill(originalIdea.description);
  await page
    .getByTestId('idea-share-dropzone-input')
    .setInputFiles({
      name: 'roteiro.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\nfile'),
    });
  await page.getByTestId('idea-share-form').evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
    (form as HTMLFormElement).requestSubmit();
  });
  await expect.poll(() => requests).toBe(1);
  await expect(page.getByTestId('idea-share-submit')).toBeDisabled();
  await expect(page.getByTestId('idea-share-progress')).toBeVisible();
  release();
  await expect(page.getByTestId('idea-share-success')).toBeVisible();
  expect(requests).toBe(1);
});
