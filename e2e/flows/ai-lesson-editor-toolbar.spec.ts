import { expect, test, type Page } from '@playwright/test';

import { LessonStageType, type Lesson, type TiptapDocument } from '@/features/ai-lessons/types';

import { ApiClient } from '../support/api';
import { createStudioFixture, prepareStudioFixture, stageDocument } from '../support/studio';

/** Documento longo no formato canônico do item (o item 1 exige suas seções). */
const longDocument = (type: LessonStageType): TiptapDocument => {
  const base = stageDocument(type, 'Início do conteúdo');
  return {
    ...base,
    content: [
      ...(base.content ?? []),
      ...Array.from({ length: 80 }, (_, index) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: `Parágrafo ${index}: conteúdo longo para editar durante a rolagem.` }],
      })),
    ],
  };
};

async function settledScrollY(page: Page): Promise<number> {
  let previous = Number.NaN;
  await expect
    .poll(
      async () => {
        const current = await page.evaluate(() => window.scrollY);
        const stable = current === previous;
        previous = current;
        return stable;
      },
      { intervals: [400] }
    )
    .toBe(true);
  return previous;
}

for (const width of [320, 375, 768, 1440]) {
  test(`barra permanece no topo durante a rolagem interna em ${width}px em todas as etapas textuais`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const editableStages = [
      LessonStageType.LESSON,
      LessonStageType.STANDARD_GAME,
      LessonStageType.VERSE_FIXATION,
      // As meditações têm editores próprios, cobertos nos specs delas.
    ];
    // Lição real: o conteúdo longo é gravado pela API e relido pela tela.
    const api = await ApiClient.login();
    const lesson = await createStudioFixture(api);
    prepareStudioFixture(lesson, editableStages);
    let current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
    for (const type of editableStages) {
      const stage = current.stages.find((item) => item.type === type)!;
      current = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
        stage: type,
        lockVersion: stage.lockVersion,
        tiptapAstJson: longDocument(type),
        structuredDataJson: {},
      });
    }
    await page.goto(`/adm/estudio/licoes/${lesson.id}`);
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
      // A página ainda se acomoda após a troca de item (avisos carregando): a
      // referência é lida só quando a rolagem parar.
      const initialScroll = await settledScrollY(page);
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
    page.on('dialog', (dialog) => dialog.accept());
    await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  });
}
