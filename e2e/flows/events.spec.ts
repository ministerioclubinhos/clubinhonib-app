import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { API_URL } from '../support/env';

const REFERENCE_DATE = new Date('2026-09-08T12:00:00.000Z');
const SCENARIOS = {
  past: '2026-09-01',
  week: '2026-09-10',
  month: '2026-09-22',
  later: '2026-10-05',
} as const;
type Scenario = keyof typeof SCENARIOS;

/** Eventos reais no banco; o relógio da tela é fixado para os períodos serem estáveis. */
let api: ApiClient;
const ids = {} as Record<Scenario, string>;

test.beforeAll(async () => {
  api = await ApiClient.login();
  const suffix = uniqueSuffix();
  for (const [name, date] of Object.entries(SCENARIOS) as [Scenario, string][]) {
    const event = await api.postMultipart<{ id: string }>('/events', {
      eventData: JSON.stringify({
        title: `E2E Agenda ${name} ${suffix}`,
        date,
        location: 'Salão do Clubinho',
        description: 'Evento do teste da agenda',
        audience: 'all',
      }),
    });
    ids[name] = event.id;
  }
});

test.afterAll(async () => {
  for (const id of Object.values(ids)) await api.delete(`/events/${id}`);
  await api?.dispose();
});

const rangeOf = (requestUrl: string) => {
  const search = new URL(requestUrl).searchParams;
  return { from: search.get('from'), to: search.get('to') };
};

test.describe('Agenda em cards', () => {
  test('consulta o mês do calendário e os períodos dos cards na API', async ({ page }) => {
    const eventRequests: string[] = [];
    await page.clock.setFixedTime(REFERENCE_DATE);
    page.on('request', (request) => {
      if (request.url().startsWith(`${API_URL}/events?`) || request.url() === `${API_URL}/events`)
        eventRequests.push(request.url());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/eventos');

    const calendar = page.getByTestId('event-events-calendar-view');
    await expect(calendar).toBeVisible();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: '2026-09-01', to: '2026-09-30' });

    const nextMonth = calendar.getByTestId('event-calendar-next-month');
    expect(await nextMonth.evaluate((button) => button.getBoundingClientRect().height)).toBe(44);
    await nextMonth.click();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: '2026-10-01', to: '2026-10-31' });

    await page.getByRole('button', { name: 'Cards' }).click();

    const cards = page.getByTestId('event-events-cards-view');
    const filter = cards.getByTestId('event-cards-period-filter');
    const periodButtons = filter.getByRole('button');
    await expect(filter).toBeVisible();
    await expect(periodButtons).toHaveCount(3);
    expect(
      await periodButtons.evaluateAll((buttons) =>
        buttons.every((button) => button.getBoundingClientRect().height >= 44),
      ),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(cards.getByTestId('event-cards-period-week')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: '2026-09-08', to: '2026-09-13' });
    await expect(cards.getByTestId(`event-card-${ids.week}`)).toBeVisible();
    await expect(cards.getByTestId(`event-card-${ids.month}`)).toHaveCount(0);
    await expect(cards.getByTestId(`event-card-${ids.later}`)).toHaveCount(0);

    await cards.getByTestId('event-cards-period-month').click();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: '2026-09-08', to: '2026-09-30' });
    await expect(cards.getByTestId(`event-card-${ids.week}`)).toBeVisible();
    await expect(cards.getByTestId(`event-card-${ids.month}`)).toBeVisible();
    await expect(cards.getByTestId(`event-card-${ids.later}`)).toHaveCount(0);

    await cards.getByTestId('event-cards-period-all').click();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: null, to: null });
    await expect(cards.getByTestId(`event-card-${ids.week}`)).toBeVisible();
    await expect(cards.getByTestId(`event-card-${ids.month}`)).toBeVisible();
    await expect(cards.getByTestId(`event-card-${ids.later}`)).toBeVisible();
  });
});
