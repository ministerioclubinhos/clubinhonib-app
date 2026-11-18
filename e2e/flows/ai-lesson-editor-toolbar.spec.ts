import { LessonStatus } from '@/features/ai-lessons/types';
import { expect, test } from '@playwright/test';
import { LessonStageStatus, LessonStageType } from '@/features/ai-lessons/types';
import type { Lesson } from '@/services/aiLessonsService';

for (const width of [320, 375, 768, 1440]) {
  test(`barra permanece no topo durante a rolagem interna em ${width}px em todas as etapas textuais`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const editableStages = [
      LessonStageType.LESSON,
      LessonStageType.STANDARD_GAME,
      LessonStageType.VERSE_FIXATION,
      LessonStageType.MEDITATION_YOUNGER,
      LessonStageType.MEDITATION_OLDER,
    ];
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
      stages: editableStages.map((type) => ({
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
              content: Array.from({ length: 80 }, (_, index) => ({
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `Parágrafo ${index}: conteúdo longo para editar durante a rolagem.`,
                  },
                ],
              })),
            },
          },
        ],
      })),
    };
    await page.route(/\/api\/v1\/lessons\/toolbar-regression(\?.*)?$/, (route) =>
      route.fulfill({ json: lesson })
    );
    await page.route('**/api/v1/lessons/toolbar-regression/events*', (route) =>
      route.fulfill({ contentType: 'text/event-stream', body: '' })
    );
    await page.goto('/adm/estudio/licoes/toolbar-regression');
    for (const type of editableStages) {
      await page.getByTestId(`ai-stage-tab-${type}`).filter({ visible: true }).click();
      const toolbar = page.getByTestId('ai-lesson-document-editor-toolbar');
      const editor = page.getByTestId('ai-lesson-document-editor');
      await editor.scrollIntoViewIfNeeded();
      await expect(toolbar).toBeVisible();
      const controls = page.getByTestId('ai-lesson-document-editor-toolbar-controls');
      const button = toolbar.getByRole('button').last();
      await expect
        .poll(() =>
          toolbar.evaluate((element) => Math.round(element.getBoundingClientRect().height))
        )
        .toBeLessThan(width < 900 ? 85 : 200);
      const buttons = await toolbar.getByRole('button').evaluateAll((elements) =>
        elements.map((element) => ({
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
        }))
      );
      for (const bounds of buttons) {
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
      }
      const initialScroll = await page.evaluate(() => window.scrollY);
      const paddingTop = await editor.evaluate((element) =>
        parseFloat(getComputedStyle(element).paddingTop)
      );
      await editor.evaluate((element) => {
        element.scrollTop = 600;
      });
      await expect
        .poll(() =>
          toolbar.evaluate((element) => {
            const container = element.closest('[data-testid="ai-lesson-document-editor"]')!;
            return Math.round(
              element.getBoundingClientRect().top - container.getBoundingClientRect().top
            );
          })
        )
        .toBe(paddingTop);
      expect(await editor.evaluate((element) => element.scrollTop)).toBe(600);
      expect(await editor.evaluate((element) => element.clientHeight)).toBeLessThanOrEqual(630);
      expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
      if (width >= 900) {
        const ratio = await toolbar.evaluate((element) => {
          const container = element.closest('[data-testid="ai-lesson-document-editor"]')!;
          const styles = getComputedStyle(container);
          const available =
            container.clientWidth -
            parseFloat(styles.paddingLeft) -
            parseFloat(styles.paddingRight);
          return element.getBoundingClientRect().width / available;
        });
        expect(ratio).toBeCloseTo(0.95, 2);
      }
      const bounds = await toolbar.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      if (width < 900) {
        const mobileTools = page.getByTestId('ai-lesson-document-editor-mobile-tools');
        await expect(mobileTools.getByRole('button')).toHaveCount(4);
        expect(
          await mobileTools.evaluate((element) => element.scrollWidth - element.clientWidth)
        ).toBeLessThanOrEqual(1);
        await page.getByTestId('ai-lesson-document-editor-more-tools').click();
        await expect(page.getByTestId('ai-lesson-document-editor-more-tools')).toHaveAttribute(
          'aria-expanded',
          'true'
        );
        const popover = page.getByTestId('ai-lesson-document-editor-tools-popover');
        await expect(popover.getByRole('dialog')).toBeVisible();
        await expect(controls).toBeVisible();
        expect(
          await controls.evaluate((element) => element.scrollWidth - element.clientWidth)
        ).toBeLessThanOrEqual(1);
        await controls
          .getByRole('button', { name: 'Subtítulo H2', exact: true })
          .click({ trial: true });
        await page.keyboard.press('Escape');
        await expect(popover).not.toBeVisible();
        await expect(page.getByTestId('ai-lesson-document-editor-more-tools')).toHaveAttribute(
          'aria-expanded',
          'false'
        );
      } else {
        await button.click({ trial: true });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width
      );
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  });
}
