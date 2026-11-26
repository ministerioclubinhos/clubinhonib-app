import { expect, test } from '@playwright/test';

import { LessonStageType, type Lesson } from '@/features/ai-lessons/types';

import { ApiClient } from '../support/api';
import { confirmStaleSave, createLessonWithMeditations, prepareStudioFixture } from '../support/studio';

for (const width of [375, 1440]) {
  test(`folha exclusiva dos menores sincroniza as cópias e salva em ${width}px`, async ({
    page,
  }, testInfo) => {
    // As duas meditações são geradas pelo fluxo real (fila e IA simulada).
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height: 900 });
    const api = await ApiClient.login();
    const meditations = [LessonStageType.MEDITATION_YOUNGER, LessonStageType.MEDITATION_OLDER];
    const lesson = await createLessonWithMeditations(api, meditations);
    prepareStudioFixture(lesson, meditations);
    /** O documento persistido da versão atual do item. */
    const savedDocument = async (type: LessonStageType): Promise<string> => {
      const current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      const stage = current.stages.find((item) => item.type === type)!;
      return JSON.stringify(stage.versions.find((item) => item.id === stage.currentVersionId)?.tiptapAstJson);
    };
    await page.goto(`/adm/estudio/licoes/${lesson.id}`);
    await expect(page.getByTestId('ai-lesson-document-editor')).toBeVisible();
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_YOUNGER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('meditation-editor-toolbar')).toBeVisible();
    if (width < 900) await page.getByTestId('meditation-editor-more-tools').click();
    for (const id of [
      'meditation-editor-subscript',
      'meditation-editor-superscript',
      'meditation-editor-heading-1',
      'meditation-editor-heading-2',
      'meditation-editor-heading-3',
      'meditation-editor-blockquote',
      'meditation-editor-horizontal-rule',
      'meditation-editor-table',
      'ai-lesson-editor-format',
      'ai-lesson-editor-line-spacing',
      'ai-lesson-editor-link',
      'ai-lesson-editor-find',
      'ai-lesson-editor-fullscreen',
    ])
      await expect(page.getByTestId(id)).toBeVisible();
    if (width < 900) await page.keyboard.press('Escape');
    await expect(page.getByTestId('younger-meditation-upper-copy')).toBeVisible();
    await expect(page.getByTestId('younger-meditation-lower-copy')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-document-editor')).toHaveCount(0);
    await page
      .getByTestId('younger-meditation-upper-first-activity')
      .fill('Pinte Jesus com seus amigos.');
    await expect(page.getByTestId('younger-meditation-lower-first-activity')).toHaveText(
      'Pinte Jesus com seus amigos.'
    );
    const field = page.getByTestId('younger-meditation-upper-first-activity');
    await field.click();
    await field.press('Control+a');
    await page
      .getByTestId(width < 900 ? 'meditation-editor-mobile-bold' : 'meditation-editor-bold')
      .click();
    await expect(field.locator('strong')).toHaveText('Pinte Jesus com seus amigos.');
    await expect(
      page.getByTestId('younger-meditation-lower-first-activity').locator('strong')
    ).toHaveText('Pinte Jesus com seus amigos.');
    await page.getByRole('button', { name: 'Salvar edição', exact: true }).click();
    // A meditação dos maiores, em produção, depende desta e ficará desatualizada.
    await confirmStaleSave(page);
    await expect
      .poll(() => savedDocument(LessonStageType.MEDITATION_YOUNGER))
      .toContain('Pinte Jesus com seus amigos.');
    expect(await savedDocument(LessonStageType.MEDITATION_YOUNGER)).toContain('bold');
    await page.reload();
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_YOUNGER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('younger-meditation-upper-first-activity')).toHaveText(
      'Pinte Jesus com seus amigos.'
    );
    const sheet = page.getByTestId('younger-meditation-a4-page');
    expect(
      await sheet.evaluate((element) => {
        const container = element.parentElement!;
        const actual =
          element.getBoundingClientRect().left -
          container.getBoundingClientRect().left +
          container.scrollLeft;
        const expected = Math.max(
          0,
          (container.clientWidth - element.getBoundingClientRect().width) / 2
        );
        return Math.abs(actual - expected) <= 1;
      })
    ).toBe(true);
    if (width === 1440) {
      const instruction =
        'Jesus ama seus amigos e mostrou seu poder sobre a morte. Pinte a cena e lembre que podemos confiar nele. '
          .repeat(10)
          .trim();
      await page.getByTestId('younger-meditation-upper-first-activity').fill(instruction);
      await page.getByTestId('younger-meditation-upper-second-activity').fill(instruction);
      await expect(page.getByTestId('younger-meditation-lower-second-activity')).toHaveText(
        instruction
      );
    }
    await sheet.screenshot({ path: testInfo.outputPath('younger-meditation-sheet.png') });
    expect(
      await sheet.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
    ).toBe(true);
    for (const copy of ['upper', 'lower']) {
      const block = page.getByTestId(`younger-meditation-${copy}-copy`);
      expect(
        await block.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
      ).toBe(true);
    }
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_OLDER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('older-meditation-editor')).toBeVisible();
    await expect(page.getByTestId('meditation-editor-toolbar')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-document-editor')).toHaveCount(0);
    await expect(page.getByText('Ilustrações das atividades', { exact: true })).toHaveCount(0);
    const olderSheet = page.getByTestId('older-meditation-a4-page');
    expect(
      await olderSheet.evaluate((element) => {
        const container = element.parentElement!;
        const actual =
          element.getBoundingClientRect().left -
          container.getBoundingClientRect().left +
          container.scrollLeft;
        const expected = Math.max(
          0,
          (container.clientWidth - element.getBoundingClientRect().width) / 2
        );
        return Math.abs(actual - expected) <= 1;
      })
    ).toBe(true);
    expect(
      await olderSheet.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
    ).toBe(true);
    const olderField = page.getByTestId('older-meditation-first-activity');
    await olderField.fill('Circule a resposta correta sobre a lição.');
    await olderField.press('Control+a');
    await page
      .getByTestId(width < 900 ? 'meditation-editor-mobile-italic' : 'meditation-editor-italic')
      .click();
    await expect(olderField.locator('em')).toHaveText('Circule a resposta correta sobre a lição.');
    await page.getByRole('button', { name: 'Salvar edição', exact: true }).click();
    await expect.poll(() => savedDocument(LessonStageType.MEDITATION_OLDER)).toContain('italic');
    await page.reload();
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_OLDER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('older-meditation-first-activity').locator('em')).toHaveText(
      'Circule a resposta correta sobre a lição.'
    );
    if (width === 1440) {
      const denseInstruction =
        'Jesus demonstrou seu poder e sua compaixão por duas famílias. Recorde a história, circule as alternativas corretas e explique o que aprendeu. '
          .repeat(7)
          .trim();
      for (const field of ['first-activity', 'second-activity', 'third-activity'])
        await page.getByTestId(`older-meditation-${field}`).fill(denseInstruction);
      expect(
        await olderSheet.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
      ).toBe(true);
      await olderSheet.screenshot({
        path: testInfo.outputPath('older-meditation-dense-sheet.png'),
      });
    }
    await expect(page.getByTestId('younger-meditation-editor')).toHaveCount(0);
    page.on('dialog', (dialog) => dialog.accept());
    await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  });
}
