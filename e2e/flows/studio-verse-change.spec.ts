import { expect, test, type Page } from '@playwright/test';
import { ApiClient } from '../support/api';
import {
  FAKE_VERSE,
  concludeStage,
  createGeneratedLesson,
  createLessonWithDownstream,
  memoryVerseOf,
  prepareStudioFixture,
  removeStudioLesson,
  selectStudioStage,
  stageOfLesson,
  stageStatusesOf,
  studioDocument,
} from '../support/studio';
import { LessonStageType, LessonStatus, type Lesson } from '@/features/ai-lessons/types';

/**
 * Troca do versículo no Estúdio, com a LLM fake (`AI_PROVIDER_MODE=fake`): o
 * item 1 é gerado de verdade pela fila e pelo worker; a ferramenta altera só o
 * versículo, devolve o item 1 para produção e deixa os itens seguintes
 * desatualizados.
 */

const NEW_VERSE = {
  text: 'O Senhor é o meu pastor; nada me faltará.',
  reference: 'Salmo 23:1',
};
const PATH = (lesson: Lesson) => `/api/v1/lessons/${lesson.id}`;
const AFTER_LESSON = Object.values(LessonStageType).filter((t) => t !== LessonStageType.LESSON);

async function openLesson(
  page: Page,
  lesson: Lesson,
  stage = LessonStageType.LESSON,
  width = 1440
) {
  const failed: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`/adm/estudio/licoes/${lesson.id}?stage=${stage}`);
  try {
    await expect(page.getByTestId(`ai-stage-${stage}`)).toBeVisible();
  } catch (error) {
    // Says why the screen did not open (expired session, slow API...) instead of only "not found".
    throw new Error(
      `A tela não abriu em ${page.url()}. Respostas com erro: ${failed.join(' | ') || 'nenhuma'}`,
      {
        cause: error,
      }
    );
  }
}

async function fillVerseDialog(page: Page, verse: { text: string; reference: string }) {
  const dialog = page.getByTestId('ai-lesson-verse-dialog');
  await expect(dialog).toBeVisible();
  const text = dialog.getByTestId('ai-lesson-verse-text');
  await text.click();
  await text.press('ControlOrMeta+a');
  await text.fill(verse.text);
  const reference = dialog.getByTestId('ai-lesson-verse-reference');
  await reference.click();
  await reference.press('ControlOrMeta+a');
  await reference.fill(verse.reference);
  return dialog;
}

test.describe('Estúdio: alterar o versículo', () => {
  let api: ApiClient;
  const created: Lesson[] = [];
  const track = <T extends Lesson>(lesson: T): T => {
    created.push(lesson);
    return lesson;
  };

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });
  test.afterAll(async () => {
    for (const lesson of created) await removeStudioLesson(api, lesson).catch(() => undefined);
    await api.dispose();
  });

  test('o item 1 gerado pela LLM fake traz o versículo NVI e a imagem de apresentação', async ({
    page,
  }) => {
    const lesson = track(await createGeneratedLesson(api));

    expect(memoryVerseOf(lesson)).toMatchObject({ ...FAKE_VERSE, version: 'NVI' });
    expect(lesson.coverImageUrl).toBeTruthy();
    await openLesson(page, lesson);
    await expect(page.getByTestId('ai-lesson-verse-current')).toContainText(
      'Porque Deus tanto amou'
    );
    await expect(page.getByTestId('ai-lesson-verse-current')).toContainText('João 3:16');
    await expect(page.getByTestId('ai-lesson-cover-thumbnail')).toBeVisible();
  });

  test('sem itens depois do 1: avisa, não exige confirmação extra e grava o novo versículo', async ({
    page,
  }) => {
    const lesson = track(await createGeneratedLesson(api));
    const before = stageOfLesson(lesson, LessonStageType.LESSON);
    await openLesson(page, lesson);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = page.getByTestId('ai-lesson-verse-dialog');
    await expect(dialog.getByTestId('ai-lesson-verse-warning')).toContainText(
      'Você está alterando o versículo'
    );
    await expect(dialog.getByTestId('ai-lesson-verse-no-impact')).toBeVisible();
    await expect(dialog.getByTestId('ai-lesson-verse-acknowledge')).toHaveCount(0);
    // Nada mudou ainda: não há o que confirmar.
    await expect(dialog.getByTestId('ai-lesson-verse-confirm')).toBeDisabled();

    await fillVerseDialog(page, NEW_VERSE);
    await expect(dialog.getByTestId('ai-lesson-verse-confirm')).toBeEnabled();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(page.getByTestId('ai-lesson-verse-dialog')).toHaveCount(0);
    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toContainText('Salmo 23:1');
    await expect(page.getByTestId('ai-lesson-verse-current')).toContainText(
      'O Senhor é o meu pastor'
    );

    const after = await api.get<Lesson>(PATH(lesson));
    expect(memoryVerseOf(after)).toEqual({ ...NEW_VERSE, version: 'NVI' });
    const stage = stageOfLesson(after, LessonStageType.LESSON);
    expect(stage.status).toBe('DRAFT');
    expect(stage.versions.length).toBe(before.versions.length + 1);
    const current = stage.versions.find((v) => v.id === stage.currentVersionId)!;
    expect(current.changeSummary).toContain('Versículo alterado');
    // O documento do item 1 mostra o novo versículo e o resto da lição continua lá.
    expect(JSON.stringify(current.tiptapAstJson)).toContain('O Senhor é o meu pastor');
    expect(JSON.stringify(current.tiptapAstJson)).not.toContain('Porque Deus tanto amou');
    expect(JSON.stringify(current.tiptapAstJson)).toContain('LIÇÃO BÍBLICA');
    // A imagem de apresentação não depende do versículo.
    expect(after.coverImageUrl).toBe(lesson.coverImageUrl);
  });

  test('item 1 concluído e itens 2 a 8 prontos: lista o impacto, exige confirmar e deixa todos desatualizados', async ({
    page,
  }) => {
    const lesson = track(await createLessonWithDownstream(api));
    for (const type of AFTER_LESSON)
      expect(stageOfLesson(lesson, type).status).toBe('PRODUCER_APPROVED');
    await openLesson(page, lesson);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    const impact = dialog.getByTestId('ai-lesson-verse-impact');
    await expect(impact.getByRole('listitem')).toHaveCount(AFTER_LESSON.length);
    await expect(impact).toContainText('Visuais do versículo');
    await expect(impact).toContainText('Meditação dos maiores');
    // Sem confirmar, não grava.
    await expect(dialog.getByTestId('ai-lesson-verse-confirm')).toBeDisabled();
    await dialog.getByTestId('ai-lesson-verse-acknowledge').check();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toContainText('Gerar de novo');
    const after = await api.get<Lesson>(PATH(lesson));
    expect(stageOfLesson(after, LessonStageType.LESSON).status).toBe('DRAFT');
    for (const type of AFTER_LESSON) expect(stageOfLesson(after, type).status).toBe('STALE');
    expect(memoryVerseOf(after)).toEqual({ ...NEW_VERSE, version: 'NVI' });
    expect(after.status).not.toBe(LessonStatus.PACKAGE_READY);

    // O item 1 precisa ser concluído de novo; os seguintes continuam desatualizados.
    await expect(page.getByTestId('ai-stage-LESSON')).toBeVisible();
    await page.getByTestId('ai-lesson-complete-stage').click();
    await expect
      .poll(
        async () =>
          stageOfLesson(await api.get<Lesson>(PATH(lesson)), LessonStageType.LESSON).status
      )
      .toBe('PRODUCER_APPROVED');
    const concluded = await api.get<Lesson>(PATH(lesson));
    for (const type of AFTER_LESSON) expect(stageOfLesson(concluded, type).status).toBe('STALE');
  });

  test('a partir de um item que usa o versículo, a troca devolve a tela para o item 1', async ({
    page,
  }) => {
    const lesson = track(await createLessonWithDownstream(api));
    await openLesson(page, lesson, LessonStageType.VERSE_VISUALS);

    await expect(page.getByTestId('ai-lesson-verse-current')).toContainText('João 3:16');
    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    await dialog.getByTestId('ai-lesson-verse-acknowledge').check();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(page).toHaveURL(/stage=LESSON/);
    await expect(page.getByTestId('ai-stage-LESSON')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toBeVisible();
    await expect(page.getByTestId('ai-lesson-verse-current')).toContainText('Salmo 23:1');
  });

  test('item que não usa o versículo não mostra a ferramenta', async ({ page }) => {
    const lesson = track(await createLessonWithDownstream(api));

    await openLesson(page, lesson, LessonStageType.STANDARD_GAME);
    await expect(page.getByTestId('ai-lesson-verse-tool')).toHaveCount(0);
    await selectStudioStage(page, LessonStageType.MANUAL_WORK, 1440);
    await expect(page.getByTestId('ai-lesson-verse-tool')).toHaveCount(0);
    await selectStudioStage(page, LessonStageType.MEDITATION_YOUNGER, 1440);
    await expect(page.getByTestId('ai-lesson-verse-tool')).toBeVisible();
  });

  test('em revisão final o ciclo não protege os itens: todos ficam desatualizados', async ({
    page,
  }) => {
    const submitted = track(await createLessonWithDownstream(api, { reviewCycle: true }));
    const lesson = submitted;
    expect(stageStatusesOf(submitted)[LessonStageType.LESSON]).toBe('IN_REVIEW');
    expect(submitted.status).toBe(LessonStatus.IN_REVIEW);
    await openLesson(page, submitted);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    await dialog.getByTestId('ai-lesson-verse-acknowledge').check();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();
    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toBeVisible();

    const after = await api.get<Lesson>(PATH(lesson));
    expect(stageOfLesson(after, LessonStageType.LESSON).status).toBe('DRAFT');
    for (const type of AFTER_LESSON) expect(stageOfLesson(after, type).status).toBe('STALE');
    expect(after.status).not.toBe(LessonStatus.IN_REVIEW);
  });

  test('referência inválida: o erro aparece no diálogo e nada é alterado', async ({ page }) => {
    const lesson = track(await createGeneratedLesson(api));
    await openLesson(page, lesson);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, {
      text: NEW_VERSE.text,
      reference: 'qualquer coisa',
    });
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(dialog.getByTestId('ai-lesson-verse-error')).toContainText(
      'Livro capítulo:versículo'
    );
    await expect(dialog).toBeVisible();
    expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))).toMatchObject(FAKE_VERSE);
  });

  test('campos obrigatórios: texto curto e referência vazia bloqueiam o botão', async ({
    page,
  }) => {
    const lesson = track(await createGeneratedLesson(api));
    await openLesson(page, lesson);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, { text: 'curto', reference: '' });
    await expect(dialog.getByTestId('ai-lesson-verse-confirm')).toBeDisabled();
    await expect(dialog).toContainText('ao menos 10 caracteres');
    await expect(dialog).toContainText('Informe a referência');
  });

  test('o mesmo versículo não é uma mudança: botão desabilitado e nenhuma versão criada', async ({
    page,
  }) => {
    const lesson = track(await createGeneratedLesson(api));
    await openLesson(page, lesson);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, {
      text: `“${FAKE_VERSE.text}”`,
      reference: 'João 3:16 — NVI',
    });
    await expect(dialog.getByTestId('ai-lesson-verse-confirm')).toBeDisabled();
    await expect(dialog).toContainText('Altere o texto ou a referência');
    const same = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
      ...FAKE_VERSE,
      lockVersion: stageOfLesson(lesson, LessonStageType.LESSON).lockVersion,
    });
    expect(same.status).toBe(200);
    const after = await api.get<Lesson>(PATH(lesson));
    expect(stageOfLesson(after, LessonStageType.LESSON).versions.length).toBe(
      stageOfLesson(lesson, LessonStageType.LESSON).versions.length
    );
  });

  test('edição não salva no item bloqueia a ferramenta até salvar ou descartar', async ({
    page,
  }) => {
    const lesson = track(await createGeneratedLesson(api));
    await openLesson(page, lesson);

    await page
      .getByTestId('ai-lesson-document-editor')
      .locator('[contenteditable="true"]')
      .first()
      .click();
    await page.keyboard.type(' acréscimo local');
    await expect(page.getByTestId('ai-lesson-verse-change')).toBeDisabled();
    await expect(page.getByTestId('ai-lesson-verse-blocked')).toContainText('Salve ou descarte');
  });

  test('edição antiga (lockVersion velho): a API recusa, o diálogo explica e tentar de novo funciona', async ({
    page,
  }) => {
    const lesson = track(await createLessonWithDownstream(api));
    await openLesson(page, lesson);
    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    await dialog.getByTestId('ai-lesson-verse-acknowledge').check();

    // A tela se atualiza sozinha; o conflito é simulado enviando o lockVersion de antes.
    await page.route('**/memory-verse', async (route) => {
      const body = route.request().postDataJSON() as { lockVersion: number };
      await route.continue({
        postData: JSON.stringify({ ...body, lockVersion: body.lockVersion - 1 }),
      });
    });
    await dialog.getByTestId('ai-lesson-verse-confirm').click();
    await expect(dialog.getByTestId('ai-lesson-verse-error')).toContainText(
      'alterada em outra sessão'
    );
    expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))?.reference).toBe('João 3:16');
    expect(
      stageStatusesOf(await api.get<Lesson>(PATH(lesson)))[LessonStageType.STANDARD_GAME]
    ).toBe('PRODUCER_APPROVED');

    await page.unroute('**/memory-verse');
    await dialog.getByTestId('ai-lesson-verse-confirm').click();
    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toBeVisible();
    expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))?.reference).toBe('Salmo 23:1');
  });

  test('outra sessão salvou o item 1 antes: a tela já traz a versão nova e a troca parte dela', async ({
    page,
  }) => {
    const lesson = track(await createLessonWithDownstream(api));
    await openLesson(page, lesson);
    const stage = stageOfLesson(lesson, LessonStageType.LESSON);

    await api.patch(`${PATH(lesson)}/stages/content`, {
      stage: LessonStageType.LESSON,
      lockVersion: stage.lockVersion,
      tiptapAstJson: studioDocument('Edição de outra sessão'),
      structuredDataJson: {},
    });
    // O fluxo de eventos do servidor atualiza a tela; só então o diálogo abre com o estado novo.
    await expect
      .poll(
        async () =>
          stageOfLesson(await api.get<Lesson>(PATH(lesson)), LessonStageType.LESSON).lockVersion
      )
      .toBeGreaterThan(stage.lockVersion);
    await page.reload();
    await expect(page.getByTestId('ai-stage-LESSON')).toBeVisible();
    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    if (await dialog.getByTestId('ai-lesson-verse-acknowledge').count())
      await dialog.getByTestId('ai-lesson-verse-acknowledge').check();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toBeVisible();
    expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))?.reference).toBe('Salmo 23:1');
  });

  test('lição publicada: a ferramenta fica bloqueada e a API recusa', async ({ page }) => {
    const lesson = track(await createLessonWithDownstream(api));
    prepareStudioFixture(lesson, [], LessonStatus.PUBLISHED);
    await openLesson(page, lesson);

    await expect(page.getByTestId('ai-lesson-verse-change')).toBeDisabled();
    await expect(page.getByTestId('ai-lesson-verse-blocked')).toContainText('Lição publicada');
    const refused = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
      ...NEW_VERSE,
      lockVersion: stageOfLesson(lesson, LessonStageType.LESSON).lockVersion,
      acknowledgeImpact: true,
    });
    expect(refused.status).toBe(409);
    expect(refused.code).toBe('LESSON_9306');
  });

  test.describe('contrato da API', () => {
    test('exige a confirmação quando há itens seguintes e informa o código de erro', async () => {
      const lesson = track(await createLessonWithDownstream(api));
      const lockVersion = stageOfLesson(lesson, LessonStageType.LESSON).lockVersion;

      const refused = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        ...NEW_VERSE,
        lockVersion,
      });
      expect(refused.status).toBe(409);
      expect(refused.code).toBe('LESSON_9315');
      const unchanged = await api.get<Lesson>(PATH(lesson));
      expect(stageOfLesson(unchanged, LessonStageType.LESSON).status).toBe('PRODUCER_APPROVED');
      expect(memoryVerseOf(unchanged)?.reference).toBe('João 3:16');

      const accepted = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        ...NEW_VERSE,
        lockVersion,
        acknowledgeImpact: true,
      });
      expect(accepted.status).toBe(200);
    });

    test('valida o corpo: texto curto, referência vazia, campo desconhecido e sem login de outro papel', async () => {
      const lesson = track(await createGeneratedLesson(api));
      const lockVersion = stageOfLesson(lesson, LessonStageType.LESSON).lockVersion;
      const send = (body: Record<string, unknown>) =>
        api.send('PATCH', `${PATH(lesson)}/memory-verse`, body);

      expect((await send({ text: 'curto', reference: 'Salmo 23:1', lockVersion })).status).toBe(
        400
      );
      expect((await send({ text: NEW_VERSE.text, reference: '', lockVersion })).status).toBe(400);
      expect((await send({ ...NEW_VERSE, lockVersion, version: 'ARA' })).status).toBe(400);
      expect((await send({ ...NEW_VERSE })).status).toBe(400);
      // Tudo recusado: o versículo continua o gerado.
      expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))).toMatchObject(FAKE_VERSE);
    });

    test('grava sempre NVI, tira as aspas e normaliza a referência', async () => {
      const lesson = track(await createGeneratedLesson(api));
      const lockVersion = stageOfLesson(lesson, LessonStageType.LESSON).lockVersion;

      const result = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        text: '  “Entrega o teu caminho ao Senhor;   confia nele,   e ele agirá.”  ',
        reference: 'Salmo 37:5 — NVI',
        lockVersion,
      });

      expect(result.status).toBe(200);
      expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))).toEqual({
        text: 'Entrega o teu caminho ao Senhor; confia nele, e ele agirá.',
        reference: 'Salmo 37:5',
        version: 'NVI',
      });
    });

    test('lockVersion antigo: recusa com o código de conflito e não altera nada', async () => {
      const lesson = track(await createGeneratedLesson(api));
      const lockVersion = stageOfLesson(lesson, LessonStageType.LESSON).lockVersion;

      const refused = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        ...NEW_VERSE,
        lockVersion: lockVersion - 1,
      });

      expect(refused.status).toBe(409);
      expect(refused.code).toBe('LESSON_9303');
      expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))).toMatchObject(FAKE_VERSE);
    });

    test('lição inexistente e id inválido', async () => {
      expect(
        (
          await api.send(
            'PATCH',
            '/api/v1/lessons/00000000-0000-4000-8000-000000000000/memory-verse',
            {
              ...NEW_VERSE,
              lockVersion: 1,
            }
          )
        ).status
      ).toBe(404);
      expect(
        (await api.send('PATCH', '/api/v1/lessons/nao-e-uuid/memory-verse', NEW_VERSE)).status
      ).toBe(400);
    });

    test('item 1 ainda não gerado: recusa', async () => {
      const lesson = track(
        await api.post<Lesson>('/api/v1/lessons', {
          theme: `studio-e2e-verso-vazio-${Date.now()}`,
          biblicalReference: 'Lucas 15:1-7',
          weekNumber: 23,
          editorialPurpose: 'Mostrar que Deus ama e perdoa.',
        })
      );

      const refused = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        ...NEW_VERSE,
        lockVersion: stageOfLesson(lesson, LessonStageType.LESSON).lockVersion,
      });

      expect(refused.status).toBe(409);
    });

    test('arquivada: recusa', async () => {
      const lesson = track(await createLessonWithDownstream(api));
      prepareStudioFixture(lesson, [], LessonStatus.ARCHIVED);

      const refused = await api.send('PATCH', `${PATH(lesson)}/memory-verse`, {
        ...NEW_VERSE,
        lockVersion: stageOfLesson(lesson, LessonStageType.LESSON).lockVersion,
        acknowledgeImpact: true,
      });

      expect(refused.status).toBe(409);
    });
  });

  test('no celular o diálogo cabe na tela e confirma', async ({ page }) => {
    const lesson = track(await createLessonWithDownstream(api));
    await openLesson(page, lesson, LessonStageType.LESSON, 390);

    await page.getByTestId('ai-lesson-verse-change').click();
    const dialog = await fillVerseDialog(page, NEW_VERSE);
    await dialog.getByTestId('ai-lesson-verse-acknowledge').check();
    const box = await dialog.getByTestId('ai-lesson-verse-confirm').boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 390).toBeTruthy();
    await dialog.getByTestId('ai-lesson-verse-confirm').click();

    await expect(page.getByTestId('ai-lesson-verse-changed-notice')).toBeVisible();
    expect(memoryVerseOf(await api.get<Lesson>(PATH(lesson)))?.reference).toBe('Salmo 23:1');
  });
});
