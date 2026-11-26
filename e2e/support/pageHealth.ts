import fs from 'node:fs';
import path from 'node:path';

import { expect, type Page } from '@playwright/test';

import { API_URL } from './env';

/** Onde ficam as capturas das telas, para revisão visual. */
export const SWEEP_DIR = process.env.E2E_SWEEP_DIR ?? 'e2e/test-results-sweep';

/** Domínios externos: bloqueados para a varredura não depender de terceiros. */
const EXTERNAL_HOSTS =
  /^https?:\/\/([\w-]+\.)*(google\.com|googleapis\.com|gstatic\.com|youtube\.com|youtube-nocookie\.com|ytimg\.com|vimeo\.com|instagram\.com|facebook\.com|googletagmanager\.com)\//;

/** Ruído do navegador que não é defeito da aplicação. */
const IGNORED_CONSOLE = [/net::ERR_/i, /ERR_BLOCKED_BY_CLIENT/i, /Failed to load resource/i];

export interface PageProblems {
  pageErrors: string[];
  consoleErrors: string[];
  apiFailures: string[];
  duplicateRequests: string[];
  overflow: string[];
}

/** Elementos que estouram a largura da janela e não estão numa área rolável. */
async function findOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    const clipped = (element: Element): boolean => {
      for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
        const { overflowX } = getComputedStyle(node);
        if (overflowX !== 'visible') return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const style = getComputedStyle(element);
      // A calha do Grid do MUI é uma margem negativa que os itens compensam.
      if (element.classList.contains('MuiGrid-container') && parseFloat(style.marginLeft) < 0) continue;
      // Mede o conteúdo: a margem negativa do Grid do MUI é compensada pelo padding.
      const left = box.left + parseFloat(style.paddingLeft);
      const right = box.right - parseFloat(style.paddingRight);
      if (right <= limit + 1 && left >= -1) continue;
      if (style.position === 'fixed' || style.visibility === 'hidden') continue;
      if (clipped(element)) continue;
      const id = element.getAttribute('data-testid') ?? element.className.toString().slice(0, 60);
      found.push(`${element.tagName.toLowerCase()}[${id}] ${Math.round(box.left)}..${Math.round(box.right)} de ${limit}`);
    }
    if (document.documentElement.scrollWidth > limit + 1) {
      found.unshift(`documento rola para o lado: ${document.documentElement.scrollWidth}px em ${limit}px`);
    }
    // Botões fora da tela são defeito mesmo dentro de um contêiner que os
    // esconde; só uma área com rolagem horizontal os alcança.
    const scrollable = (element: Element): boolean => {
      for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
        const { overflowX } = getComputedStyle(node);
        if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth) return true;
        if (node.getAttribute('aria-hidden') === 'true') return true;
      }
      return false;
    };
    for (const button of Array.from(document.querySelectorAll('main button, main a[href]'))) {
      const box = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      if (!box.width || !box.height || style.visibility === 'hidden' || style.opacity === '0') continue;
      if (box.left >= -1 && box.right <= limit + 1) continue;
      if (scrollable(button) || button.closest('.slick-slider, .MuiTabs-root')) continue;
      const label = button.getAttribute('aria-label') ?? button.textContent?.trim().slice(0, 40) ?? '';
      found.push(`botão fora da tela "${label}" ${Math.round(box.left)}..${Math.round(box.right)} de ${limit}`);
    }
    return found.slice(0, 8);
  });
}

/**
 * Abre a rota, espera a tela assentar, captura a imagem e devolve tudo o que
 * indica defeito: exceções, erros de console, respostas de erro da API,
 * requisições repetidas e conteúdo vazando da largura da janela.
 */
export async function inspectPage(page: Page, route: string, screenshotName: string): Promise<PageProblems> {
  const problems: PageProblems = {
    pageErrors: [],
    consoleErrors: [],
    apiFailures: [],
    duplicateRequests: [],
    overflow: [],
  };
  const gets = new Map<string, number>();

  await page.route(EXTERNAL_HOSTS, (r) => r.abort());
  page.on('pageerror', (error) => problems.pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!IGNORED_CONSOLE.some((pattern) => pattern.test(text))) problems.consoleErrors.push(text.slice(0, 400));
  });
  page.on('response', (response) => {
    const url = response.url();
    if (!url.startsWith(API_URL)) return;
    if (response.status() >= 400) {
      problems.apiFailures.push(`${response.request().method()} ${url.slice(API_URL.length)} -> ${response.status()}`);
    }
  });
  page.on('request', (request) => {
    if (request.method() !== 'GET' || !request.url().startsWith(API_URL)) return;
    const key = request.url().slice(API_URL.length);
    gets.set(key, (gets.get(key) ?? 0) + 1);
  });

  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20_000 });
  await expect(page.locator('main').first(), `${route}: conteúdo principal`).toBeVisible();
  await expect(page.getByText('Verificando autenticação...')).toHaveCount(0);
  await expect(page.locator('main .MuiCircularProgress-indeterminate:visible'), `${route}: carregamento preso`).toHaveCount(
    0,
    { timeout: 20_000 },
  );

  await expect(page.locator('main').getByText(/^Carregando[^]{0,40}(…|\.\.\.)$/), `${route}: texto de carregamento preso`).toHaveCount(0, {
    timeout: 20_000,
  });

  for (const [key, count] of gets) if (count > 1) problems.duplicateRequests.push(`${count}x ${key}`);
  // Animações de entrada (JS) terminam antes da leitura e da captura.
  await page.waitForTimeout(800);
  problems.overflow = await findOverflow(page);
  const mains = await page.locator('main').count();
  if (mains !== 1) problems.overflow.push(`a página tem ${mains} elementos <main>`);

  fs.mkdirSync(SWEEP_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SWEEP_DIR, `${screenshotName}.png`), fullPage: true });

  return problems;
}
