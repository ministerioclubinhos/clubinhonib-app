import { expect, Page, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { COORDINATOR_EMAIL, COORDINATOR_PASSWORD } from '../support/env';

/**
 * Orientações de criação (`/adm/estudio/orientacoes`), contra a API real.
 *
 * As orientações são pessoais: cada administrador tem as próprias, por tipo de
 * material e por etapa. Os testes mexem só nas orientações do usuário de teste
 * e devolvem tudo ao que estava no fim — salvar uma orientação não gera nada
 * por IA, então não há custo de tokens.
 */
test.describe.configure({ mode: 'serial' });

interface Preference {
  stage: string;
  basePrompt: string;
  customPrompt: string | null;
  effectivePrompt: string;
  lockVersion: number | null;
  updatedAt: string | null;
}

const PATH = '/api/v1/lessons/prompt-preferences/me';
const STAGE = 'VERSE_FIXATION';
const TAB = 'admin-prompts-tab-verse-fixation';

let api: ApiClient;
let initial: Preference[];
let me: { id: string; name: string };

const current = async (category = 'REGULAR') =>
  api.get<Preference[]>(PATH, { category });
const stageOf = (list: Preference[], stage = STAGE) => {
  const found = list.find((item) => item.stage === stage);
  if (!found) throw new Error(`etapa ${stage} não veio na lista`);
  return found;
};

/** Devolve a etapa ao que estava antes do teste. */
async function restore(stage = STAGE) {
  const now = stageOf(await current(), stage);
  const before = stageOf(initial, stage);
  if (now.lockVersion !== null) {
    await api.send('POST', `${PATH}/reset`, { stage, lockVersion: now.lockVersion });
  }
  if (before.customPrompt) {
    const afterReset = stageOf(await current(), stage);
    await api.send('PATCH', PATH, {
      stage,
      prompt: before.customPrompt,
      ...(afterReset.lockVersion !== null ? { lockVersion: afterReset.lockVersion } : {}),
    });
  }
}

async function openStage(page: Page) {
  await page.goto('/adm/estudio/orientacoes');
  await page.getByTestId(TAB).click();
  const input = page.getByTestId(`admin-prompt-page-input-${STAGE}`).getByRole('textbox');
  await expect(input).toBeVisible();
  return input;
}

test.beforeAll(async () => {
  api = await ApiClient.login();
  me = await api.get<{ id: string; name: string }>('/auth/me');
  initial = await current();
});

test.beforeEach(async () => {
  // Cada cenário parte da etapa sem orientação.
  const now = stageOf(await current());
  if (now.customPrompt && now.lockVersion !== null) {
    await api.send('POST', `${PATH}/reset`, { stage: STAGE, lockVersion: now.lockVersion });
  }
});

test.afterAll(async () => {
  await restore();
  await api.dispose();
});

test.describe('Orientações de criação', () => {
  test('a tela diz de quem são as orientações e resume as etapas personalizadas', async ({ page }) => {
    await page.goto('/adm/estudio/orientacoes');

    const notice = page.getByTestId('admin-prompts-personal-notice');
    await expect(notice).toContainText('Estas orientações são só suas');
    await expect(notice).toContainText(me.name.trim().split(/\s+/)[0]);
    await expect(notice).toContainText('Cada administrador tem as próprias');

    const customised = (await current()).filter((item) => item.customPrompt?.trim()).length;
    const summary = page.getByTestId('admin-prompts-summary');
    if (customised === 0) await expect(summary).toHaveText('Todas as etapas no padrão oficial');
    else await expect(summary).toContainText(`${customised} `);
  });

  test('salvar grava a orientação do usuário e a prévia mostra o que a IA recebe', async ({ page }) => {
    const text = `Use gestos para cada trecho do versículo. ${uniqueSuffix()}`;
    const input = await openStage(page);

    await expect(page.getByTestId('admin-prompts-stage-status')).toHaveText('Padrão oficial');
    await input.fill(text);
    await expect(page.getByTestId(TAB)).toHaveAttribute('data-state', 'pending');
    await page.getByTestId('admin-prompts-save').click();
    await expect(page.getByTestId('admin-prompts-feedback')).toContainText('Orientação salva');

    await expect(page.getByTestId('admin-prompts-stage-status')).toHaveText('Personalizada');
    await expect(page.getByTestId(TAB)).toHaveAttribute('data-state', 'custom');
    await expect(page.getByTestId('admin-prompts-saved-at')).toContainText('salva em');

    const saved = stageOf(await current());
    expect(saved.customPrompt).toBe(text);
    expect(saved.updatedAt).toBeTruthy();
    // O que a IA recebe é a regra oficial mais a orientação, e a tela mostra isso.
    expect(saved.effectivePrompt).toContain(saved.basePrompt);
    expect(saved.effectivePrompt).toContain(text);
    await page.getByRole('button', { name: /Como a IA vai receber/ }).click();
    await expect(page.getByTestId('admin-prompts-effective-preview').getByRole('textbox')).toHaveValue(
      saved.effectivePrompt,
    );

    // Recarregar mostra o que ficou gravado.
    await page.reload();
    await page.getByTestId(TAB).click();
    await expect(page.getByTestId(`admin-prompt-page-input-${STAGE}`).getByRole('textbox')).toHaveValue(text);
  });

  test('Ctrl+S salva a etapa aberta', async ({ page }) => {
    const text = `Dinâmica em roda, sem material. ${uniqueSuffix()}`;
    const input = await openStage(page);

    await input.fill(text);
    await input.press('Control+s');

    await expect(page.getByTestId('admin-prompts-feedback')).toContainText('Orientação salva');
    expect(stageOf(await current()).customPrompt).toBe(text);
  });

  test('apagar o texto de uma orientação salva devolve a etapa ao padrão oficial', async ({ page }) => {
    const before = stageOf(await current());
    await api.send('PATCH', PATH, {
      stage: STAGE,
      prompt: `Orientação a remover ${uniqueSuffix()}`,
      ...(before.lockVersion !== null ? { lockVersion: before.lockVersion } : {}),
    });
    const input = await openStage(page);
    await expect(page.getByTestId('admin-prompts-stage-status')).toHaveText('Personalizada');

    await input.fill('');
    // Campo vazio não trava a tela: o botão principal passa a remover a orientação.
    await expect(page.getByTestId('admin-prompts-save')).toHaveCount(0);
    await page.getByTestId('admin-prompts-remove').click();
    await page.getByTestId('admin-prompts-reset-confirm').click();

    await expect(page.getByTestId('admin-prompts-feedback')).toContainText('voltou ao padrão oficial');
    await expect(page.getByTestId('admin-prompts-stage-status')).toHaveText('Padrão oficial');
    const after = stageOf(await current());
    expect(after.customPrompt).toBeNull();
    expect(after.effectivePrompt).toBe(after.basePrompt);
  });

  test('texto curto demais não é salvo, e a tela explica o motivo', async ({ page }) => {
    const input = await openStage(page);

    await input.fill('curto');

    await expect(
      page.getByTestId(`admin-prompt-page-input-${STAGE}`).getByText('Escreva pelo menos 10 caracteres.'),
    ).toBeVisible();
    await expect(page.getByTestId('admin-prompts-save')).toBeDisabled();
    const refused = await api.send('PATCH', PATH, { stage: STAGE, prompt: 'curto' });
    expect(refused.status).toBe(400);
    expect(stageOf(await current()).customPrompt).toBeNull();
  });

  test('material semanal e material especial têm orientações separadas', async ({ page }) => {
    const text = `Só para o material semanal. ${uniqueSuffix()}`;
    const before = stageOf(await current(), 'LESSON');
    try {
      await api.send('PATCH', PATH, {
        stage: 'LESSON',
        prompt: text,
        ...(before.lockVersion !== null ? { lockVersion: before.lockVersion } : {}),
      });

      await page.goto('/adm/estudio/orientacoes');
      const lesson = page.getByTestId('admin-prompt-page-input-LESSON').getByRole('textbox');
      await expect(lesson).toHaveValue(text);

      await page.getByTestId('admin-prompts-category-special').click();
      await expect(page.getByTestId('admin-prompts-stage-tabs').getByRole('tab')).toHaveCount(3);
      await expect(lesson).not.toHaveValue(text);
      expect(stageOf(await current('SPECIAL'), 'LESSON').customPrompt ?? '').not.toBe(text);
    } finally {
      await restore('LESSON');
    }
  });

  test('a orientação de um administrador não aparece para outro usuário', async ({ request }) => {
    const text = `Orientação pessoal do administrador. ${uniqueSuffix()}`;
    // A gravação é versionada: quem já tem linha para a etapa manda a versão que leu.
    const before = stageOf(await current());
    const saved = await api.send('PATCH', PATH, {
      stage: STAGE,
      prompt: text,
      ...(before.lockVersion !== null ? { lockVersion: before.lockVersion } : {}),
    });
    expect(saved.status).toBe(200);
    expect(stageOf(await current()).customPrompt).toBe(text);

    const login = await request.post(`${process.env.E2E_API_URL ?? 'http://localhost:3000'}/auth/login`, {
      data: { email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD },
    });
    test.skip(!login.ok(), 'usuário de automação (coordenador) não existe neste banco');
    const other = await ApiClient.login(COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    const seen = await other.send('GET', PATH);
    await other.dispose();

    // Ou o outro usuário nem acessa o Estúdio, ou vê as próprias orientações — nunca as do administrador.
    if (seen.status === 200) {
      const theirs = (seen.body as Preference[]).find((item) => item.stage === STAGE);
      expect(theirs?.customPrompt ?? null).not.toBe(text);
      expect(theirs?.effectivePrompt ?? '').not.toContain(text);
    } else {
      expect([401, 403]).toContain(seen.status);
    }
  });
});

for (const width of [320, 390, 1440]) {
  test(`a tela de orientações cabe em ${width}px e mantém o salvar à mão`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const input = await openStage(page);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      ),
    ).toBe(false);

    await input.fill(`Texto de teste de layout ${uniqueSuffix()}`);
    const save = page.getByTestId(width < 600 ? 'admin-prompts-save-mobile' : 'admin-prompts-save');
    await expect(save).toBeVisible();
    await expect(save).toBeEnabled();
    expect((await save.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    // O texto não foi salvo: o teste só confere o layout.
    await page.getByTestId('admin-prompts-discard-draft').click();
  });
}
