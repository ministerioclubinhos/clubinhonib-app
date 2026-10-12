import { LessonStatus } from '@/features/ai-lessons/types';
import { expect, test } from '@playwright/test';
import { LessonStageStatus, LessonStageType } from '@/features/ai-lessons/types';
import type { Lesson, TiptapDocument } from '@/services/aiLessonsService';

for (const width of [375, 1440]) {
  test(`formata, substitui, cria links e conserva as edições salvas em ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const lesson: Lesson = {
      id: 'toolbar-regression',
      theme: 'O Semeador',
      biblicalReference: 'Mateus 13',
      weekNumber: 20,
      status: LessonStatus.IN_PROGRESS,
      weekMaterialId: null,
      createdAt: '',
      updatedAt: '',
      comments: [],
      stages: [LessonStageType.LESSON].map((type) => ({
        id: type,
        type,
        status: LessonStageStatus.DRAFT,
        currentVersionId: `version-${type}`,
        lockVersion: 1,
        failureMessage: null,
        versions: [
          {
            id: `version-${type}`,
            versionNumber: 1,
            createdAt: '',
            changeSummary: '',
            structuredDataJson: {},
            tiptapAstJson: {
              type: 'doc',
              content: Array.from({ length: 3 }, (_, index) => ({
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `Jesus ensina. Parágrafo ${index}.`,
                  },
                ],
              })),
            },
          },
        ],
      })),
    };

    let saved: TiptapDocument | undefined;
    await page.route('**/api/v1/lessons/toolbar-regression', (route) =>
      route.fulfill({ json: lesson })
    );
    await page.route('**/api/v1/lessons/toolbar-regression/events', (route) =>
      route.fulfill({ contentType: 'text/event-stream', body: '' })
    );
    await page.route('**/api/v1/lessons/toolbar-regression/stages/content', (route) => {
      saved = route.request().postDataJSON().tiptapAstJson as TiptapDocument;
      lesson.stages[0].versions[0].tiptapAstJson = saved;
      lesson.stages[0].lockVersion += 1;
      return route.fulfill({ json: lesson });
    });
    await page.goto('/adm/estudio/licoes/toolbar-regression');
    const doc = page.getByTestId('ai-lesson-document-editor').locator('.tiptap');
    await expect(doc).toContainText('Jesus ensina.');
    const openTools = async () => {
      if (width < 900) await page.getByTestId('ai-lesson-document-editor-more-tools').click();
    };
    await doc
      .locator('p')
      .first()
      .evaluate((element) => {
        const selection = window.getSelection()!;
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        (element.closest('[contenteditable]') as HTMLElement).focus();
        document.dispatchEvent(new Event('selectionchange'));
      });
    await openTools();
    await expect(page.getByTestId('ai-lesson-editor-format')).toHaveText('');
    await expect(page.getByTestId('ai-lesson-editor-line-spacing')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-editor-line-spacing')).toHaveText('');
    await page.getByTestId('ai-lesson-editor-line-spacing').click();
    const dialog = page.getByTestId('ai-lesson-editor-tool-dialog');
    await dialog.getByRole('combobox', { name: 'Fonte', exact: true }).click();
    await page.getByRole('option', { name: 'Arial', exact: true }).click();
    await dialog.getByRole('combobox', { name: 'Tamanho da letra' }).click();
    await page.getByRole('option', { name: '24 pt', exact: true }).click();
    await dialog.getByRole('combobox', { name: 'Espaçamento entre linhas' }).click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    await dialog.getByRole('button', { name: 'Concluído' }).click();
    await expect(doc.locator('p').first()).toHaveCSS('line-height', '32px');
    await expect(doc.locator('p').first().locator('span')).toHaveCSS('font-size', '32px');
    await openTools();
    await page.getByTestId('ai-lesson-editor-color').click();
    const palette = page.getByTestId('ai-lesson-editor-color-palette');
    await expect(palette.getByRole('button', { name: /^Cor #/ })).toHaveCount(25);
    await page.getByTestId('ai-lesson-editor-color-7c3aed').click();
    await expect(doc.locator('span').first()).toHaveCSS('color', 'rgb(124, 58, 237)');
    await openTools();
    await page.getByTestId('ai-lesson-editor-highlight').click();
    await page
      .getByTestId('ai-lesson-editor-custom-highlight-hex')
      .getByRole('textbox')
      .fill('#86EFAC');
    await page.getByTestId('ai-lesson-editor-custom-highlight-apply').click();
    await expect(doc.locator('mark').first()).toHaveCSS('background-color', 'rgb(134, 239, 172)');
    await openTools();
    await page.getByTestId('ai-lesson-editor-find').click();
    await dialog.getByRole('textbox', { name: 'Localizar', exact: true }).fill('Jesus');
    await dialog.getByRole('textbox', { name: 'Substituir por' }).fill('Cristo');
    await expect(page.getByTestId('ai-lesson-editor-find-count')).toContainText('3 ocorrência');
    await page.getByTestId('ai-lesson-editor-replace-all').click();
    await expect(page.getByTestId('ai-lesson-editor-replace-feedback')).toContainText(
      '3 ocorrência'
    );
    await dialog.getByRole('button', { name: 'Concluído' }).click();
    await expect(doc).not.toContainText('Jesus');
    await openTools();
    await page.getByTestId('ai-lesson-editor-link').click();
    await dialog
      .getByRole('textbox', { name: 'Endereço do link' })
      .fill('https://example.com/apoio');
    const linkText = dialog.getByRole('textbox', { name: 'Texto do link' });
    if (await linkText.isVisible()) await linkText.fill('Material de apoio');
    await page.getByTestId('ai-lesson-editor-link-apply').click();
    await expect(doc.locator('a')).toHaveAttribute('href', 'https://example.com/apoio');
    await openTools();
    await page.getByTestId('ai-lesson-editor-fullscreen').click();
    await expect(page.getByTestId('ai-lesson-editor-fullscreen-dialog')).toBeVisible();
    await expect(doc).toContainText('Cristo');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('ai-lesson-editor-fullscreen-dialog')).not.toBeVisible();
    await expect(doc).toContainText('Cristo');
    await page.getByRole('button', { name: 'Salvar edição', exact: true }).click();
    await expect.poll(() => JSON.stringify(saved)).toContain('24pt');
    expect(JSON.stringify(saved)).toContain('Arial');
    expect(JSON.stringify(saved)).toContain('#7C3AED');
    expect(JSON.stringify(saved)).toContain('#86EFAC');
    expect(JSON.stringify(saved)).toContain('lineHeight');
    expect(JSON.stringify(saved)).toContain('https://example.com/apoio');
    expect(JSON.stringify(saved)).not.toContain('Jesus');
    await page.reload();
    await expect(doc.locator('span').first()).toHaveCSS('font-size', '32px');
    await expect(doc).toContainText('Cristo');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
  });
}
