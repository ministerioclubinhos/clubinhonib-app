import { expect, test, type BrowserContext, type Page } from '@playwright/test';

import { ApiClient } from '../support/api';
import { COORDINATOR_EMAIL, COORDINATOR_PASSWORD } from '../support/env';
import { loginAs } from '../support/session';

type Flag = { id: string; key: string; name: string; enabled: boolean };

type WeeklySummary = {
  year: number;
  availableYears: number[];
  currentWeek: number | null;
  period: { totalWeeks: number } | null;
  clubs: Array<{ clubId: string; clubNumber: number }>;
  weeks: Array<{ week: number }>;
};

const FLAG_KEY = 'club_weekly_summary';
const MENU_ITEM = 'Resumo Semanal';

/**
 * Resumo dos clubinhos (`/adm/resumo-semanal`): a tela que o e-mail de
 * segunda-feira abre.
 *
 * É **do coordenador**. O administrador tem as Estatísticas, e o público da
 * flag `club_weekly_summary` é só `coordinator` — por isso os testes de tela
 * rodam numa sessão de coordenador, e não na sessão de administrador que o
 * projeto guarda por padrão.
 */
test.describe('Resumo dos clubinhos', () => {
  /** Sessão do coordenador, aberta uma vez e reaproveitada. */
  let coordinatorContext: BrowserContext;
  /** Cliente do coordenador: é o alcance que o endpoint responde. */
  let api: ApiClient;
  /** Cliente do administrador, só para mexer na flag (rota exclusiva dele). */
  let admin: ApiClient;
  let summary: WeeklySummary;

  test.beforeAll(async ({ browser }) => {
    const page = await loginAs(browser, COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    coordinatorContext = page.context();
    await page.close();

    api = await ApiClient.login(COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    admin = await ApiClient.login();
    summary = await api.get<WeeklySummary>('/club-control/weekly-summary');
  });

  test.afterAll(async () => {
    await coordinatorContext.close();
    await api.dispose();
    await admin.dispose();
  });

  /** Uma página nova na sessão do coordenador; o viewport não vaza entre testes. */
  async function asCoordinator(run: (page: Page) => Promise<void>): Promise<void> {
    const page = await coordinatorContext.newPage();
    try {
      await run(page);
    } finally {
      await page.close();
    }
  }

  /** Pula quando o ambiente não tem o que desenhar. */
  function skipWithoutData(): void {
    test.skip(
      !summary.period || summary.clubs.length === 0,
      'coordenador fixo sem período letivo ou sem clubinho',
    );
  }

  test('o administrador não enxerga a tela: ele tem as Estatísticas', async ({ page }) => {
    // A sessão padrão do projeto é a do administrador. Fora do público da
    // flag, a rota redireciona e o item some do menu.
    await page.goto('/adm/resumo-semanal');
    await expect(page).toHaveURL(/\/adm\/?$/);

    // O escopo é a barra lateral, e não o layout inteiro: os mesmos rótulos
    // aparecem nos cards do painel logo ao lado.
    const sidebar = page.getByTestId('adm-admin-sidebar');
    await expect(sidebar.getByText(MENU_ITEM, { exact: true })).toHaveCount(0);
    // Contagem, e não visibilidade: em `/adm` nenhuma seção do menu está
    // aberta, e o item existe no DOM recolhido. Serve de controle — prova que
    // o menu carregou, e que o zero acima é ausência, não tela vazia.
    await expect(sidebar.getByText('Estatísticas', { exact: true })).toHaveCount(1);
  });

  test('o coordenador abre no período atual e vê os números do recorte', async () => {
    await asCoordinator(async (page) => {
      await page.goto('/adm/resumo-semanal');

      await expect(page.getByTestId('club-weekly-summary-page')).toBeVisible();
      await expect(page.getByTestId('club-weekly-summary-filters')).toBeVisible();

      if (summary.clubs.length === 0) {
        await expect(page.getByTestId('club-weekly-summary-no-clubs')).toBeVisible();
        return;
      }
      if (!summary.period) {
        await expect(page.getByTestId('club-weekly-summary-no-period')).toBeVisible();
        return;
      }

      await expect(page.getByTestId('club-weekly-summary-range-navigator')).toBeVisible();
      // Abrir já no agora: o atalho "voltar para o atual" nasce desabilitado.
      await expect(page.getByTestId('club-weekly-summary-range-current')).toBeDisabled();

      await expect(page.getByTestId('club-weekly-summary-range-stats')).toBeVisible();
      await expect(page.getByTestId('club-weekly-summary-club-breakdown')).toBeVisible();
      await expect(page.getByTestId('club-weekly-summary-chart')).toBeVisible();
      await expect(page.getByTestId('club-weekly-summary-heat-strip')).toBeVisible();
    });
  });

  test('o item do resumo aparece no menu do coordenador', async () => {
    await asCoordinator(async (page) => {
      // A seção da rota atual abre sozinha, então o item fica visível de fato
      // — e não apenas presente no DOM recolhido.
      await page.goto('/adm/resumo-semanal');
      const sidebar = page.getByTestId('adm-admin-sidebar');
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByText(MENU_ITEM, { exact: true })).toBeVisible();
    });
  });

  test('as setas andam um período por vez e o atalho volta ao atual', async () => {
    skipWithoutData();

    await asCoordinator(async (page) => {
      await page.goto('/adm/resumo-semanal');
      await expect(page.getByTestId('club-weekly-summary-range-navigator')).toBeVisible();

      const rotulo = page.getByTestId('club-weekly-summary-range-label');
      const inicial = await rotulo.textContent();

      await page.getByTestId('club-weekly-summary-range-previous').click();
      await expect(rotulo).not.toHaveText(inicial ?? '');

      await page.getByTestId('club-weekly-summary-range-current').click();
      await expect(rotulo).toHaveText(inicial ?? '');
      await expect(page.getByTestId('club-weekly-summary-range-current')).toBeDisabled();
    });
  });

  test('as quatro visões trocam o recorte mostrado', async () => {
    skipWithoutData();

    await asCoordinator(async (page) => {
      await page.goto('/adm/resumo-semanal');
      await expect(page.getByTestId('club-weekly-summary-range-navigator')).toBeVisible();
      const rotulo = page.getByTestId('club-weekly-summary-range-label');

      await expect(rotulo).toHaveText(/^Semana \d+$/);

      await page.getByTestId('club-weekly-summary-granularity-month').click();
      await expect(rotulo).toHaveText(/de \d{4}$/);

      await page.getByTestId('club-weekly-summary-granularity-quarter').click();
      await expect(rotulo).toHaveText(/trimestre de \d{4}$/);

      await page.getByTestId('club-weekly-summary-granularity-year').click();
      await expect(rotulo).toHaveText(/^Ano letivo \d{4}$/);
    });
  });

  test('a faixa do ano salta para o período daquela semana', async () => {
    skipWithoutData();

    await asCoordinator(async (page) => {
      await page.goto('/adm/resumo-semanal');
      const faixa = page.getByTestId('club-weekly-summary-heat-strip');
      await expect(faixa).toBeVisible();

      const primeira = faixa.locator('[data-testid^="club-weekly-summary-strip-"]').first();
      const numero = await primeira.textContent();
      await primeira.click();

      await expect(page.getByTestId('club-weekly-summary-range-label')).toHaveText(
        `Semana ${numero?.trim()}`,
      );
    });
  });

  test('trocar o ano refaz a consulta com o ano escolhido', async () => {
    const outroAno = summary.availableYears.find((year) => year !== summary.year);
    test.skip(outroAno === undefined, 'só há um ano letivo cadastrado neste ambiente');

    await asCoordinator(async (page) => {
      await page.goto('/adm/resumo-semanal');
      await expect(page.getByTestId('club-weekly-summary-page')).toBeVisible();

      const pedido = page.waitForRequest(
        (request) =>
          request.url().includes('/club-control/weekly-summary') &&
          request.url().includes(`year=${outroAno}`),
      );

      await page.getByRole('combobox', { name: 'Ano' }).click();
      await page.getByRole('option', { name: String(outroAno) }).click();

      await pedido;
    });
  });

  test('no celular ocupa 98% da largura, sem empurrar a página para o lado', async () => {
    skipWithoutData();

    await asCoordinator(async (page) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/adm/resumo-semanal');
      const screen = page.getByTestId('club-weekly-summary-page');
      await expect(screen).toBeVisible();

      // O atalho de voltar ao período atual desce para a própria linha: entre
      // as setas ele não caberia junto do rótulo do período.
      await expect(page.getByTestId('club-weekly-summary-range-current-mobile')).toBeVisible();
      await expect(page.getByTestId('club-weekly-summary-range-current')).toBeHidden();

      const largura = await screen.evaluate(
        (element) =>
          element.getBoundingClientRect().width /
          element.ownerDocument.documentElement.clientWidth,
      );
      expect(largura).toBeGreaterThan(0.95);
      expect(largura).toBeLessThanOrEqual(0.99);

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflows).toBe(false);
    });
  });

  test('no desktop ocupa 95% da largura', async () => {
    skipWithoutData();

    await asCoordinator(async (page) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/adm/resumo-semanal');
      const screen = page.getByTestId('club-weekly-summary-page');
      await expect(screen).toBeVisible();

      const largura = await screen.evaluate((element) => {
        const parent = element.parentElement;
        if (!parent) return 0;
        // `width: 95%` é sobre a caixa de conteúdo do pai. O retângulo do pai
        // inclui o padding do layout do painel, e comparar com ele dava 0,899.
        const estilo = getComputedStyle(parent);
        const conteudo =
          parent.clientWidth -
          parseFloat(estilo.paddingLeft) -
          parseFloat(estilo.paddingRight);
        return element.getBoundingClientRect().width / conteudo;
      });
      expect(largura).toBeGreaterThan(0.94);
      expect(largura).toBeLessThanOrEqual(0.96);
    });
  });

  test('flag desligada fecha a rota e esconde o item do menu; ligada de novo, tudo volta', async () => {
    // Mexer na flag é rota de administrador; conferir o efeito é na tela do
    // coordenador, que é quem enxerga o recurso.
    const flag = await admin.get<Flag>(`/feature-flags/${FLAG_KEY}`);
    test.skip(!flag.enabled, `a flag ${FLAG_KEY} já está desligada neste ambiente`);

    await asCoordinator(async (page) => {
      try {
        await admin.patch(`/feature-flags/${flag.key}`, { enabled: false });

        await page.goto('/adm/resumo-semanal');
        await expect(page).toHaveURL(/\/adm\/?$/);
        await expect(
          page.getByTestId('adm-admin-sidebar').getByText(MENU_ITEM, { exact: true }),
        ).toHaveCount(0);
      } finally {
        await admin.patch(`/feature-flags/${flag.key}`, { enabled: true });
      }

      await page.goto('/adm/resumo-semanal');
      await expect(page).toHaveURL(/\/adm\/resumo-semanal$/);
      await expect(
        page.getByTestId('adm-admin-sidebar').getByText(MENU_ITEM, { exact: true }),
      ).toBeVisible();
    });
  });
});
