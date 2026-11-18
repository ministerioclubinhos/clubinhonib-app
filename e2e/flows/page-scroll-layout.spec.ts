import { expect, test, type Page } from '@playwright/test';
import { loginAs } from '../support/session';
import {
  COORDINATOR_EMAIL,
  COORDINATOR_PASSWORD,
  TEACHER_EMAIL,
  TEACHER_PASSWORD,
} from '../support/env';

/**
 * Layout geral: quem rola é o documento, e a página termina no footer.
 *
 * Regressão de dois defeitos: `html`, `body` e `#root` com altura fixa e
 * `overflow-x: hidden` viravam três áreas de rolagem empilhadas (no celular,
 * passava do footer e sobrava uma faixa branca); e a região `aria-live` do
 * sino usava `width: 1`/`height: 1` no `sx` (100%), esticando a página uma tela
 * inteira abaixo do footer para quem estava logado.
 */
async function expectPageEndsAtFooter(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId('footer')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      page.evaluate(() => {
        const footer = document.querySelector('footer');
        if (!footer) return Number.POSITIVE_INFINITY;
        const footerBottom = footer.getBoundingClientRect().bottom + window.scrollY;
        return Math.round(document.documentElement.scrollHeight - footerBottom);
      })
    )
    .toBeLessThanOrEqual(1);
  const innerScrollers = await page.evaluate(() =>
    ['body', '#root'].filter((selector) => {
      const element = document.querySelector(selector);
      return Boolean(element && element.scrollHeight > element.clientHeight + 1);
    })
  );
  expect(innerScrollers).toEqual([]);
}

const viewports = [
  { name: 'celular', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const viewport of viewports) {
  test.describe(`layout de rolagem (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('administrador: página termina no footer', async ({ page }) => {
      for (const path of ['/', '/feed-clubinho', '/adm', '/perfil']) {
        await expectPageEndsAtFooter(page, path);
      }
    });

    for (const [role, email, password] of [
      ['professor', TEACHER_EMAIL, TEACHER_PASSWORD],
      ['coordenador', COORDINATOR_EMAIL, COORDINATOR_PASSWORD],
    ] as const) {
      test(`${role}: página termina no footer`, async ({ browser }) => {
        const page = await loginAs(browser, email, password);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        try {
          for (const path of ['/', '/feed-clubinho', '/perfil']) {
            await expectPageEndsAtFooter(page, path);
          }
        } finally {
          await page.context().close();
        }
      });
    }
  });
}
