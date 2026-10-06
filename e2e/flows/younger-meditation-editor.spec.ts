import { expect, test } from '@playwright/test';
import { LessonStageStatus, LessonStageType } from '@/features/ai-lessons/types';
import type { Lesson, TiptapDocument } from '@/services/aiLessonsService';

for (const width of [375, 1440]) {
  test(`folha exclusiva dos menores sincroniza as cópias e salva em ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const data = {
      title: 'Jesus ressuscitou',
      verseText: 'Eu sou a vida.',
      verseReference: 'João 11:25',
      prayer: 'Jesus, obrigado.',
      activities: [{ instruction: 'Pinte Jesus.' }, { instruction: 'Pinte seus amigos.' }],
      printableAssets: [
        { url: '/test-younger-coloring-art.svg' },
        { url: '/test-younger-coloring-art.svg' },
      ],
    };
    const lesson: Lesson = {
      id: 'younger-editor-regression',
      theme: 'Jesus vive',
      biblicalReference: 'João 11',
      weekNumber: 14,
      status: 'IN_PROGRESS',
      weekMaterialId: null,
      createdAt: '',
      updatedAt: '',
      comments: [],
      stages: [
        LessonStageType.LESSON,
        LessonStageType.MEDITATION_YOUNGER,
        LessonStageType.MEDITATION_OLDER,
      ].map((type) => ({
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
            structuredDataJson: data,
            tiptapAstJson: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Conteúdo do editor original.' }],
                },
              ],
            },
          },
        ],
      })),
    };
    await page.route('**/test-younger-coloring-art.svg', (route) =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="white"/><g fill="none" stroke="black" stroke-width="3"><circle cx="150" cy="40" r="22"/><path d="M150 62 L115 145 L185 145 Z M137 145 L137 168 M163 145 L163 168 M127 86 L80 60 M173 86 L220 60"/><path d="M20 170 Q60 125 95 170 M205 170 Q245 125 280 170"/></g></svg>',
      })
    );
    let saved: TiptapDocument | undefined;
    await page.route('**/api/v1/lessons/younger-editor-regression', (route) =>
      route.fulfill({ json: lesson })
    );
    await page.route('**/api/v1/lessons/younger-editor-regression/events', (route) =>
      route.fulfill({ contentType: 'text/event-stream', body: '' })
    );
    await page.route('**/api/v1/lessons/younger-editor-regression/stages/content', (route) => {
      saved = route.request().postDataJSON().tiptapAstJson as TiptapDocument;
      lesson.stages[1].versions[0].tiptapAstJson = saved;
      lesson.stages[1].lockVersion++;
      return route.fulfill({ json: lesson });
    });
    await page.goto('/adm/estudio/licoes/younger-editor-regression');
    await expect(page.getByTestId('ai-lesson-document-editor')).toBeVisible();
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_YOUNGER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('younger-meditation-upper-copy')).toBeVisible();
    await expect(page.getByTestId('younger-meditation-lower-copy')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-document-editor')).toHaveCount(0);
    await page
      .getByTestId('younger-meditation-upper-first-activity')
      .fill('Pinte Jesus com seus amigos.');
    await expect(page.getByTestId('younger-meditation-lower-first-activity')).toHaveValue(
      'Pinte Jesus com seus amigos.'
    );
    await page.getByRole('button', { name: 'Salvar edição', exact: true }).click();
    await expect.poll(() => JSON.stringify(saved)).toContain('Pinte Jesus com seus amigos.');
    await page.reload();
    await page
      .getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_YOUNGER}`)
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId('younger-meditation-upper-first-activity')).toHaveValue(
      'Pinte Jesus com seus amigos.'
    );
    const sheet = page.getByTestId('younger-meditation-a4-page');
    if (width === 1440) {
      const instruction =
        'Jesus ama seus amigos e mostrou seu poder sobre a morte. Pinte a cena e lembre que podemos confiar nele. '
          .repeat(10)
          .trim();
      await page.getByTestId('younger-meditation-upper-first-activity').fill(instruction);
      await page.getByTestId('younger-meditation-upper-second-activity').fill(instruction);
      await expect(page.getByTestId('younger-meditation-lower-second-activity')).toHaveValue(
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
    await expect(page.getByTestId('ai-lesson-document-editor')).toHaveCount(0);
    await expect(page.getByText('Ilustrações das atividades', { exact: true })).toHaveCount(0);
    const olderSheet = page.getByTestId('older-meditation-a4-page');
    expect(
      await olderSheet.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)
    ).toBe(true);
    await expect(page.getByTestId('younger-meditation-editor')).toHaveCount(0);
  });
}
