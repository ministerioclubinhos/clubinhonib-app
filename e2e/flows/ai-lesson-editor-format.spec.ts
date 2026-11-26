import { expect, test } from '@playwright/test';

import { LessonStageType, type Lesson } from '@/features/ai-lessons/types';

import { ApiClient } from '../support/api';
import { createStudioFixture } from '../support/studio';

for (const width of [375, 1440]) {
  test(`formata, substitui, cria links e conserva as edições salvas em ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    // Lição real com três parágrafos, salva pelo mesmo contrato do editor.
    const api = await ApiClient.login();
    let lesson = await createStudioFixture(api);
    const stage = lesson.stages.find((item) => item.type === LessonStageType.LESSON)!;
    lesson = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
      stage: LessonStageType.LESSON,
      lockVersion: stage.lockVersion,
      tiptapAstJson: {
        type: 'doc',
        content: Array.from({ length: 3 }, (_, index) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: `Jesus ensina. Parágrafo ${index}.` }],
        })),
      },
      structuredDataJson: {},
    });
    const storedDocument = async (): Promise<string> => {
      const current = (await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`)).stages.find(
        (item) => item.type === LessonStageType.LESSON
      )!;
      const version = current.versions.find((item) => item.id === current.currentVersionId);
      return JSON.stringify(version?.tiptapAstJson ?? {});
    };
    await page.goto(`/adm/estudio/licoes/${lesson.id}`);
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
    await expect.poll(storedDocument).toContain('24pt');
    const saved = await storedDocument();
    for (const expected of ['Arial', '#7C3AED', '#86EFAC', 'lineHeight', 'https://example.com/apoio'])
      expect(saved).toContain(expected);
    expect(saved).not.toContain('Jesus');
    await page.reload();
    await expect(doc.locator('span').first()).toHaveCSS('font-size', '32px');
    await expect(doc).toContainText('Cristo');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
    await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  });
}
