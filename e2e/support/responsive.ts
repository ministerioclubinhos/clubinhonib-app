import { expect, type Locator, type Page } from '@playwright/test';

export const MEDIA_TEST_VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
];

export async function expectNoHorizontalOverflow(page: Page, root: Locator): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await expect
    .poll(() => root.evaluate((element) => element.scrollWidth <= element.clientWidth + 1))
    .toBe(true);
}

export async function expectTouchTarget(control: Locator): Promise<void> {
  const size = await control.boundingBox();
  expect(size).not.toBeNull();
  expect(size!.width).toBeGreaterThanOrEqual(44);
  expect(size!.height).toBeGreaterThanOrEqual(44);
}
