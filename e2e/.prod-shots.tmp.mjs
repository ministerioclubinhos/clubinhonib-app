import { chromium } from '@playwright/test';
const out = process.argv[2];
const base = 'http://localhost:5173/adm/estudio/licoes/d1f99ad0-1128-4e8e-aeec-d6fed06ab81d';
const browser = await chromium.launch();
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['360', 360, 780]]) {
  const context = await browser.newContext({ storageState: 'e2e/.auth/admin.json', viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  for (const [suffix, query] of [['stage1', ''], ['stage2', '?stage=LESSON_VISUALS'], ['stage3', '?stage=STANDARD_GAME']]) {
    await page.goto(base + query);
    await page.waitForSelector('[data-testid="ai-lessons-detail"]', { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/prod-${name}-${suffix}.png` });
    await page.screenshot({ path: `${out}/prod-${name}-${suffix}-full.png`, fullPage: true });
    const m = await page.evaluate(() => {
      const small = [...document.querySelectorAll('[data-testid="ai-lessons-detail"] button, [data-testid="ai-lessons-detail"] a')]
        .filter((el) => el.offsetParent && el.getBoundingClientRect().height < 44)
        .map((el) => `${el.dataset.testid ?? el.textContent?.slice(0, 30)}:${Math.round(el.getBoundingClientRect().height)}`);
      return {
        scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
        dialogOpen: Boolean(document.querySelector('[data-testid="ai-lesson-generation-error-dialog"]')),
        failedAlert: Boolean(document.querySelector('[data-testid="ai-lesson-stage-generation-failed"]')),
        completeDisabled: document.querySelector('[data-testid="ai-lesson-complete-stage"]')?.disabled,
        completeText: document.querySelector('[data-testid="ai-lesson-complete-stage"]')?.textContent,
        contained: [...document.querySelectorAll('[data-testid="ai-lesson-stage-actions"] .MuiButton-contained')].map((e) => e.textContent),
        next: document.querySelector('[data-testid="ai-lesson-next-step"]')?.textContent,
        caption: document.querySelector('[data-testid="ai-lesson-provider-caption"]')?.textContent,
        small,
      };
    });
    console.log(name, suffix, JSON.stringify(m));
  }
  console.log(name, 'console errors:', JSON.stringify([...new Set(errors)].slice(0, 5)));
  await context.close();
}
await browser.close();
