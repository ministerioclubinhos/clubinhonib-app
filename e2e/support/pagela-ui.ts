import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Atalhos da tela de pagelas da criança (`/area-das-criancas/:childId`).
 *
 * Só localizam elementos e repetem passos de tela; as verificações de
 * verdade (o que ficou gravado) continuam nos testes, pela API.
 */

/** O botão de nova pagela: no computador é botão, no celular é o flutuante. */
export const createButton = (page: Page): Locator => page.getByTestId(/^pagela-create-(button|fab)$/);

export const editorDialog = (page: Page): Locator => page.getByTestId('pagela-teacher-editor-dialog');

export const pagelaForm = (page: Page): Locator => page.getByTestId('pagela-teacher-pagela-quick-form');

export const pagelaCards = (page: Page): Locator => page.getByTestId('pagela-teacher-pagela-card');

/** O cartão de uma semana, achado pelo rótulo "Ano: AAAA Semana: SS". */
export const cardOfWeek = (page: Page, week: number): Locator =>
  pagelaCards(page).filter({ hasText: `Semana: ${String(week).padStart(2, '0')}` });

/** Abre o editor para uma pagela nova e espera o formulário. */
export async function openCreateForm(page: Page): Promise<Locator> {
  await createButton(page).click();
  const form = pagelaForm(page);
  await expect(form).toBeVisible();
  return form;
}

/** Abre o editor para corrigir a pagela de uma semana. */
export async function openEditForm(page: Page, week: number): Promise<Locator> {
  await cardOfWeek(page, week).getByRole('button', { name: 'Editar pagela' }).click();
  const form = pagelaForm(page);
  await expect(form).toBeVisible();
  await expect(page.getByTestId('pagela-editor-week')).toContainText(`Semana ${week}`);
  return form;
}

export const saveButton = (page: Page): Locator => page.getByTestId('pagela-editor-save');

/** Largura e altura de um elemento, para provar o alvo de toque de 44 px. */
export async function sizeOf(locator: Locator): Promise<{ width: number; height: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('elemento sem caixa na tela');
  return { width: box.width, height: box.height };
}
