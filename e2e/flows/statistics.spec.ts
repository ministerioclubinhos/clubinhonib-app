import { expect, test, type Page } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { launchWindow, pagelaBody, removeChild, seedChild, type SeededChild } from '../support/children';
import { expectNoHorizontalOverflow } from '../support/responsive';

/**
 * Página de estatísticas (`/adm/estatisticas`), contra a API real.
 *
 * Cinco visões (resumo, crianças, clubinhos, professores, coordenadores) e um
 * filtro de período. Os números na tela são conferidos contra a própria API —
 * se o back mudar o contrato ou a conta, estes testes percebem.
 */
interface Overview {
  summary: { totalChildren: number; totalClubs: number; totalTeachers: number };
}
interface ChildrenStats {
  summary: { totalChildren: number };
}
interface ClubsStats {
  clubs: { clubId: string }[];
}
interface CoordinatorPage {
  items: { clubs: unknown[] }[];
  total: number;
}

const TABS = [
  { aba: 'resumo', label: 'Resumo', view: 'statistics-summary-view' },
  { aba: 'criancas', label: 'Crianças', view: 'statistics-children-view' },
  { aba: 'clubinhos', label: 'Clubinhos', view: 'statistics-clubs-view' },
  { aba: 'professores', label: 'Professores', view: 'statistics-teachers-view' },
  { aba: 'coordenadores', label: 'Coordenadores', view: 'statistics-coordinators-view' },
] as const;

let api: ApiClient;

test.beforeAll(async () => {
  api = await ApiClient.login();
});

test.afterAll(async () => {
  await api.dispose();
});

const tile = (page: Page, id: string) => page.getByTestId(`${id}-value`);

test.describe('Estatísticas: abas', () => {
  test('mostra as cinco visões e nenhuma pede à API algo que o contrato recusa', async ({ page }) => {
    const falhas: string[] = [];
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (!url.pathname.includes('/statistics/') || response.ok()) return;
      falhas.push(`${response.status()} ${url.pathname}${url.search}`);
    });

    await page.goto('/adm/estatisticas');
    const tabs = page.getByTestId('statistics-tabs');
    await expect(tabs.getByRole('tab')).toHaveText(TABS.map((tab) => tab.label));

    for (const tab of TABS) {
      await tabs.getByRole('tab', { name: tab.label }).click();
      await expect(page.getByTestId(tab.view)).toBeVisible({ timeout: 20_000 });
      // A visão padrão não escreve nada na URL; as outras escrevem.
      if (tab.aba !== 'resumo') await expect(page).toHaveURL(new RegExp(`aba=${tab.aba}`));
      await page.waitForLoadState('networkidle');
      await expect(page.getByTestId('statistics-plain-data-state-error')).toHaveCount(0);
    }

    expect(falhas, `requisições recusadas:\n${falhas.join('\n')}`).toEqual([]);
  });

  test('a visão escolhida fica na URL e volta ao recarregar; valor inválido cai no resumo', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=professores');
    await expect(page.getByTestId('statistics-teachers-view')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('statistics-teachers-view')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Professores' })).toHaveAttribute('aria-selected', 'true');

    await page.goto('/adm/estatisticas?aba=qualquer-coisa&periodo=nada');
    await expect(page.getByTestId('statistics-summary-view')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Este ano' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('o período escolhido vai para a API e para a URL', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=clubinhos');
    await expect(page.getByTestId('statistics-clubs-view')).toBeVisible();

    const request = page.waitForRequest((req) => req.url().includes('/statistics/clubs') && req.url().includes('period=this_month'));
    await page.getByRole('button', { name: 'Este mês' }).click();
    await request;
    await expect(page).toHaveURL(/periodo=this_month/);
    await expect(page.getByRole('button', { name: 'Este mês' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('"Atualizar" refaz só as consultas das estatísticas', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-view')).toBeVisible();
    await page.waitForLoadState('networkidle');

    const urls: string[] = [];
    page.on('request', (req) => urls.push(new URL(req.url()).pathname));
    await page.getByTestId('statistics-refresh').click();
    await expect.poll(() => urls.some((path) => path.endsWith('/statistics/overview'))).toBe(true);
    expect(urls.filter((path) => path.includes('/club-control'))).toEqual([]);
  });

  test('o rodapé mostra a hora em que o dado foi buscado', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-last-updated')).toContainText(/Dados de \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  test('a linguagem é de gente: sem "taxa", "score" ou "engajamento"', async ({ page }) => {
    for (const tab of TABS) {
      await page.goto(`/adm/estatisticas?aba=${tab.aba}`);
      await expect(page.getByTestId(tab.view)).toBeVisible({ timeout: 20_000 });
      await page.waitForLoadState('networkidle');
      const text = (await page.getByTestId('statistics-page').innerText()).toLowerCase();
      for (const jargon of ['taxa', 'score', 'engajamento', 'performance', 'dashboard']) {
        expect(text, `${tab.label}: "${jargon}"`).not.toContain(jargon);
      }
    }
  });
});

test.describe('Estatísticas: números batem com a API', () => {
  test('resumo: crianças, clubinhos e a frase da presença', async ({ page }) => {
    const overview = await api.get<Overview>('/statistics/overview');
    await page.goto('/adm/estatisticas');

    await expect(tile(page, 'statistics-summary-children')).toHaveText(String(overview.summary.totalChildren));
    await expect(tile(page, 'statistics-summary-clubs')).toHaveText(String(overview.summary.totalClubs));
    await expect(page.getByTestId('statistics-summary-presence')).toContainText(/\d+%\s*\d+ de cada 10 crianças esperadas vieram/);
    await expect(page.getByTestId('statistics-summary-weeks')).toBeVisible();
    await expect(page.getByTestId('statistics-summary-attention')).toBeVisible();
    await expect(page.getByTestId('statistics-plain-attention-list').or(page.getByTestId('statistics-plain-attention-list-ok'))).toBeVisible();
  });

  test('o aviso do resumo leva para a visão certa', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-attention')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const alert = page.getByTestId('statistics-plain-attention-item').filter({ has: page.getByRole('button', { name: /^Ver / }) }).first();
    test.skip((await alert.count()) === 0, 'nada pedindo atenção neste banco');

    await alert.getByRole('button').first().click();
    await alert.getByRole('button', { name: /^Ver / }).click();
    await expect(page).toHaveURL(/aba=(clubinhos|criancas)/);
  });

  test('crianças: total, listas e distribuições', async ({ page }) => {
    const stats = await api.get<ChildrenStats>('/statistics/children', { period: 'this_year', limit: 1 });
    await page.goto('/adm/estatisticas?aba=criancas');

    await expect(tile(page, 'statistics-children-total')).toHaveText(String(stats.summary.totalChildren));
    for (const id of ['statistics-children-top', 'statistics-children-low', 'statistics-children-gender', 'statistics-children-ages', 'statistics-children-time']) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
    // Idades e tempo vêm na ordem natural, não na do tamanho do grupo.
    const ages = await page
      .getByTestId('statistics-children-ages')
      .getByTestId('statistics-plain-chart-item')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label') ?? ''));
    const order = ['Até 5 anos', 'De 6 a 10 anos', 'De 11 a 15 anos', '16 anos ou mais'];
    const positions = ages.map((row) => order.findIndex((label) => row.startsWith(label)));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test('clubinhos: uma linha por clubinho, e quem nunca lançou pagela diz "Sem pagelas"', async ({ page }) => {
    const stats = await api.get<ClubsStats>('/statistics/clubs', { period: 'this_year', limit: 100 });
    await page.goto('/adm/estatisticas?aba=clubinhos');

    const rows = page.getByTestId('statistics-clubs-presence-list').getByTestId('statistics-plain-chart-item');
    await expect(rows).toHaveCount(stats.clubs.length);
    // Quem nunca lançou pagela não aparece como "0%": o anel diz "Sem pagelas".
    const labels = await rows.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label') ?? ''));
    for (const label of labels) expect(label).not.toMatch(/: 0%$/);
  });

  test('professores: total do cadastro e quem ainda não lançou', async ({ page }) => {
    const overview = await api.get<Overview>('/statistics/overview');
    await page.goto('/adm/estatisticas?aba=professores');

    await expect(tile(page, 'statistics-teachers-total')).toHaveText(String(overview.summary.totalTeachers));
    await expect(page.getByTestId('statistics-teachers-top')).toBeVisible();
    await expect(page.getByTestId('statistics-teachers-attention')).toBeVisible();
  });

  test('coordenadores: total e quantos cuidam de clubinho vêm do cadastro', async ({ page }) => {
    const coordinators = await api.get<CoordinatorPage>('/coordinator-profiles', { page: 1, limit: 100 });
    const withClubs = coordinators.items.filter((item) => item.clubs.length > 0).length;
    await page.goto('/adm/estatisticas?aba=coordenadores');

    await expect(tile(page, 'statistics-coordinators-total')).toHaveText(String(coordinators.items.length));
    await expect(tile(page, 'statistics-coordinators-with-clubs')).toHaveText(String(withClubs));
    await expect(tile(page, 'statistics-coordinators-without-clubs')).toHaveText(String(coordinators.items.length - withClubs));
    await expect(page.getByTestId('statistics-coordinators-list').getByTestId('statistics-coordinators-row')).toHaveCount(withClubs);
  });
});

test.describe('Estatísticas: números em destaque, avisos compactos', () => {
  test('os números grandes vêm antes dos avisos e os avisos começam fechados', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    const tiles = page.getByTestId('statistics-plain-stat-tile-grid').first();
    const attention = page.getByTestId('statistics-summary-attention');
    await expect(attention).toBeVisible();
    await expect(tiles).toBeVisible();

    const tilesBox = await tiles.boundingBox();
    const attentionBox = await attention.boundingBox();
    expect(tilesBox!.y).toBeLessThan(attentionBox!.y);

    const items = page.getByTestId('statistics-plain-attention-item');
    const count = await items.count();
    test.skip(count === 0, 'nada pedindo atenção neste banco');
    for (let index = 0; index < count; index += 1) {
      await expect(items.nth(index).getByRole('button').first()).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('tocar num aviso abre quem está na situação; tocar de novo fecha', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-attention')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const item = page.getByTestId('statistics-plain-attention-item').first();
    test.skip((await item.count()) === 0, 'nada pedindo atenção neste banco');

    const header = item.getByRole('button').first();
    await header.click();
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(item.getByRole('button', { name: /^Ver / })).toBeVisible();
    await header.click();
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  test('no celular, o primeiro aviso fechado ocupa uma linha só (até 64px)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-attention')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const item = page.getByTestId('statistics-plain-attention-item').first();
    test.skip((await item.count()) === 0, 'nada pedindo atenção neste banco');
    const box = await item.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(96);
  });
});

test.describe('Estatísticas: cores que dão o recado', () => {
  const toneOf = (rate: number) => (rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'error');

  test('a presença é verde, amarela ou vermelha conforme o número da API', async ({ page }) => {
    const stats = await api.get<{ overall: { averagePresenceRate: number } }>('/statistics/pagelas', { period: 'this_year' });
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-presence')).toHaveAttribute(
      'data-tone',
      toneOf(stats.overall.averagePresenceRate),
    );
  });

  test('a presença de cada clubinho usa a mesma régua de cores', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=clubinhos');
    const rows = page.getByTestId('statistics-clubs-presence-list').getByTestId('statistics-plain-chart-item');
    await expect(rows.first()).toBeVisible();
    await expect(page.getByTestId('statistics-clubs-presence')).toHaveAttribute('data-tone', /^(success|warning|error)$/);
  });

  test('a faixa de situação e a legenda aparecem no resumo', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-plain-status-banner')).toHaveAttribute('data-tone', /^(success|warning|error)$/);
    await expect(page.getByTestId('statistics-plain-tone-legend-item')).toHaveText(['Vai bem', 'Atenção', 'Precisa de ajuda', 'Informação']);
  });
});

test.describe('Estatísticas: avisos de quem não lançou a pagela', () => {
  test.describe.configure({ mode: 'serial' });

  let clubId = '';
  let clubNumber = 0;
  let child: SeededChild | undefined;

  test.beforeEach(async () => {
    // Clubinho de segunda-feira com uma criança desde o começo do ano: na semana
    // passada ele era esperado e não lançou nada.
    clubNumber = 4000 + Math.floor(Math.random() * 900);
    const club = await api.post<{ id: string }>('/clubs', {
      number: clubNumber,
      weekday: 'monday',
      time: '09:00',
      address: { district: 'Centro', city: 'Campinas', state: 'SP' },
    });
    clubId = club.id;
    child = await seedChild(api, { name: `E2E Aviso ${uniqueSuffix()}`, clubId, joinedAt: '2026-02-03' });
  });

  test.afterEach(async () => {
    await removeChild(api, child);
    if (clubId) await api.delete(`/clubs/${clubId}`);
    child = undefined;
    clubId = '';
  });

  const missingLastWeek = async () => {
    const launch = await launchWindow(api);
    const lastWeek = (launch.currentWeek ?? 0) - 1;
    const weekly = await api.get<{ clubs: { clubId: string; status: string }[] }>('/statistics/attendance/week', {
      year: launch.year ?? 0,
      week: lastWeek,
      limit: 100,
    });
    return { launch, lastWeek, status: weekly.clubs.find((club) => club.clubId === clubId)?.status };
  };

  test('clubinho que não lançou a pagela da semana passada aparece pelo nome no resumo e em Clubinhos', async ({ page }) => {
    const { status } = await missingLastWeek();
    test.skip(status !== 'missing', `a API não o considera faltante na semana passada (${status})`);

    // Pagela faltando é grave: faixa e aviso ficam vermelhos.
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-plain-status-banner')).toHaveAttribute('data-tone', 'error');
    await expect(
      page.getByTestId('statistics-plain-attention-item').filter({ hasText: 'semana passada' }).first(),
    ).toHaveAttribute('data-severity', 'error');

    for (const aba of ['resumo', 'clubinhos']) {
      await page.goto(`/adm/estatisticas?aba=${aba}`);
      const alert = page.getByTestId('statistics-plain-attention-item').filter({ hasText: 'não lançou' }).or(
        page.getByTestId('statistics-plain-attention-item').filter({ hasText: 'não lançaram' }),
      );
      await expect(alert.filter({ hasText: 'semana passada' }).first()).toContainText(`Clubinho ${clubNumber}`);
    }
  });

  test('depois de lançar a pagela da semana passada, o clubinho some do aviso', async ({ page }) => {
    const { launch, lastWeek, status } = await missingLastWeek();
    test.skip(status !== 'missing' || !launch.open || lastWeek < 1, 'cenário indisponível neste banco');

    await api.post('/pagelas', pagelaBody(child!.id, launch, { week: lastWeek }));
    await page.goto('/adm/estatisticas?aba=clubinhos');
    await expect(page.getByTestId('statistics-clubs-view')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId('statistics-clubs-attention').getByText(`Clubinho ${clubNumber}`, { exact: true }),
    ).toHaveCount(0);
  });

  test('o resumo mostra quantos clubinhos lançaram a pagela da semana passada', async ({ page }) => {
    const { status } = await missingLastWeek();
    test.skip(status !== 'missing', 'cenário indisponível neste banco');

    await page.goto('/adm/estatisticas');
    const progress = page.getByTestId('statistics-summary-pagelas').getByTestId('statistics-plain-progress-line').first();
    await expect(progress).toContainText('Semana passada');
    await expect(progress).toContainText(/\d+ de \d+/);
  });
});

test.describe('Estatísticas: celular', () => {
  test.use({ viewport: { width: 360, height: 780 }, hasTouch: true });

  test('todas as visões cabem na tela, sem rolar para o lado', async ({ page }) => {
    for (const tab of TABS) {
      await page.goto(`/adm/estatisticas?aba=${tab.aba}`);
      await expect(page.getByTestId(tab.view)).toBeVisible({ timeout: 20_000 });
      await page.waitForLoadState('networkidle');
      await expectNoHorizontalOverflow(page, page.getByTestId('statistics-page'));
    }
  });

  test('abas e período têm alvo de toque de 44px e dá para chegar em todas as abas', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-summary-view')).toBeVisible();

    for (const control of [page.getByRole('tab').first(), page.getByRole('button', { name: 'Este mês' }), page.getByTestId('statistics-refresh')]) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole('tab', { name: 'Coordenadores' }).click();
    await expect(page.getByTestId('statistics-coordinators-view')).toBeVisible();
  });
});
