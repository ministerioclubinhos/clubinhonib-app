import { LessonStatus } from '@/features/ai-lessons/types';
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
      status: LessonStatus.IN_PROGRESS,
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
            structuredDataJson:
              type === LessonStageType.MEDITATION_OLDER
                ? {
                    ...data,
                    activities: [...data.activities, { instruction: 'Numere os acontecimentos.' }],
                    printableAssets: [
                      { id: '1', url: '/test-younger-coloring-art.svg' },
                      { id: '3', url: '/test-younger-coloring-art.svg' },
                    ],
                  }
                : data,
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
      const stage = lesson.stages.find(
        (item) => item.type === route.request().postDataJSON().stage
      )!;
      stage.versions[0].tiptapAstJson = saved;
      stage.lockVersion++;
      return route.fulfill({ json: lesson });
    });
    await page.goto('/adm/estudio/licoes/younger-editor-regression');
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
    await expect.poll(() => JSON.stringify(saved)).toContain('Pinte Jesus com seus amigos.');
    await expect.poll(() => JSON.stringify(saved)).toContain('bold');
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
    await expect.poll(() => JSON.stringify(saved)).toContain('italic');
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
  });
}
