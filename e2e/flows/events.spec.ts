import { expect, Route, test } from '@playwright/test';

const EVENTS_URL = /\/events(?:\?.*)?$/;
const REFERENCE_DATE = new Date('2026-09-08T12:00:00.000Z');

const event = (id: string, title: string, date: string) => ({
  id,
  title,
  date,
  location: 'Salão do Clubinho',
  description: `Descrição de ${title}`,
  audience: 'all',
  public: true,
  isRecurring: false,
  weekday: null,
  occurrences: [date],
  time: null,
  clubId: null,
  media: null,
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
});

const json = (route: Route, body: unknown) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

const EVENTS = [
  event('past', 'Evento anterior', '2026-09-01'),
  event('week', 'Evento desta semana', '2026-09-10'),
  event('month', 'Evento deste mês', '2026-09-22'),
  event('later', 'Evento mais adiante', '2026-10-05'),
];

const rangeOf = (requestUrl: string) => {
  const search = new URL(requestUrl).searchParams;
  return { from: search.get('from'), to: search.get('to') };
};

test.describe('Agenda em cards', () => {
  test('consulta o mês do calendário e os períodos dos cards na API', async ({ page }) => {
    const eventRequests: string[] = [];
    await page.clock.setFixedTime(REFERENCE_DATE);
    await page.route(EVENTS_URL, (route) => {
      const requestUrl = route.request().url();
      const { from, to } = rangeOf(requestUrl);
      eventRequests.push(requestUrl);
      return json(
        route,
        EVENTS.filter((item) => (!from || item.date >= from) && (!to || item.date <= to)),
      );
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
    await expect(cards.getByTestId('event-card-week')).toBeVisible();
    await expect(cards.getByTestId('event-card-month')).toHaveCount(0);
    await expect(cards.getByTestId('event-card-later')).toHaveCount(0);

    await cards.getByTestId('event-cards-period-month').click();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: '2026-09-08', to: '2026-09-30' });
    await expect(cards.getByTestId('event-card-week')).toBeVisible();
    await expect(cards.getByTestId('event-card-month')).toBeVisible();
    await expect(cards.getByTestId('event-card-later')).toHaveCount(0);

    await cards.getByTestId('event-cards-period-all').click();
    await expect
      .poll(() => rangeOf(eventRequests.at(-1) ?? 'http://localhost/events'))
      .toEqual({ from: null, to: null });
    await expect(cards.getByTestId('event-card-week')).toBeVisible();
    await expect(cards.getByTestId('event-card-month')).toBeVisible();
    await expect(cards.getByTestId('event-card-later')).toBeVisible();
  });
});
