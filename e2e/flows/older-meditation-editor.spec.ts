import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });
for (const width of [375, 1440]) {
  test(`editor dos maiores preserva edição e informa excesso de conteúdo em ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/e2e/fixtures/older-meditation-editor.html', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByTestId('older-meditation-editor')).toBeVisible();
    await expect(page.getByTestId('older-meditation-overflow')).toHaveCount(0);
    const sheet = page.getByTestId('older-meditation-a4-page');
    const first = page.getByTestId('older-meditation-first-activity');
    const second = page.getByTestId('older-meditation-second-activity');
    const third = page.getByTestId('older-meditation-third-activity');
    await expect(first).toContainText('Complete usando o banco');
    await expect(second).toContainText('Marque uma resposta');
    await expect(third).toContainText('No recreio');
    await expect(sheet).not.toContainText('Aceitar atitudes concretas');
    // Modelo das folhas: relatos entre parênteses sob o tema, sem quadro "TEXTO BÍBLICO".
    await expect(page.getByTestId('older-meditation-subtitle')).toHaveText('(O bom samaritano)');
    await expect(sheet).not.toContainText('TEXTO BÍBLICO');
    await expect(page.getByTestId('older-meditation-fourth-activity')).toHaveCount(0);
    // As questões ocupam a folha inteira: a oração fecha a página, sem sobra no meio.
    const thirdBox = await page
      .getByTestId('older-meditation-third-activity-activity')
      .boundingBox();
    const prayerBox = await page.getByTestId('older-meditation-prayer').boundingBox();
    expect(prayerBox!.y - (thirdBox!.y + thirdBox!.height)).toBeLessThan(40);
    await sheet.screenshot({ path: testInfo.outputPath('older-meditation-sheet.png') });
    await third.fill(
      'Situação revisada pela equipe. Escreva como você pode ajudar. ____________________'
    );
    await page.getByTestId('older-meditation-harness-save').click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('older-meditation-third-activity')).toContainText(
      'Situação revisada pela equipe.'
    );
    await page
      .getByTestId('older-meditation-first-activity')
      .fill('Caça-palavras: encontre AMOR.\nA M O R\nB C D E\nF G H I\nPalavras: AMOR');
    await expect(
      page.getByTestId('older-meditation-first-activity').locator('span[style*="Courier"]')
    ).toHaveCount(3);
    await page
      .getByTestId('older-meditation-first-activity')
      .fill('Texto extenso para verificar a folha. '.repeat(1000));
    await expect(page.getByTestId('older-meditation-overflow')).toBeVisible();
  });
}
