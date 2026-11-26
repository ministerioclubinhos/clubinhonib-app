import { expect, Locator, Page } from '@playwright/test';

/**
 * Gestos comuns das telas do painel (Material UI).
 *
 * As listagens usam `ListingCard` com `data-testid="<feature>-<card>-<id>"` e
 * botões de ação com `aria-label`; os formulários são `Dialog`s com campos
 * rotulados. Selecionar num `Select` do MUI é abrir o combobox e clicar na
 * opção pelo nome.
 */
export async function selectMuiOption(page: Page, control: Locator, optionName: string | RegExp): Promise<void> {
  await control.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name: optionName }).click();
}

/** Limpa e digita: `fill` sozinho não dispara `onChange` em alguns inputs com máscara. */
export async function replaceText(input: Locator, value: string): Promise<void> {
  await input.click();
  await input.press('ControlOrMeta+a');
  await input.fill(value);
}

/** Abre a listagem e busca pelo termo no campo de busca da `ListingLayout`. */
export async function searchListing(page: Page, term: string): Promise<void> {
  const search = page.getByRole('textbox', { name: /buscar/i }).or(page.getByPlaceholder(/buscar/i)).first();
  await replaceText(search, term);
}

/** O card de uma entidade na listagem, pelo `data-testid` com o id. */
export function cardOf(page: Page, feature: string, card: string, id: string): Locator {
  return page.getByTestId(`${feature}-${card}-${id}`);
}

/** Espera o snackbar de sucesso (notistack ou MUI Snackbar). */
export async function expectSuccessToast(page: Page, text?: string | RegExp): Promise<void> {
  const alert = page.getByRole('alert').filter(text ? { hasText: text } : {}).first();
  await expect(alert).toBeVisible();
}

/** Confirma o diálogo de ativar/desativar (`ToggleActiveConfirmDialog`). */
export async function confirmToggleActive(page: Page): Promise<void> {
  const dialog = page.locator('[aria-labelledby="toggle-active-dialog-title"]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /^(Desativar|Ativar)$/ }).click();
  await expect(dialog).toBeHidden();
}

/** Confirma o `ConfirmDialog` genérico pelo texto do botão. */
export async function confirmDialog(page: Page, buttonName: string | RegExp): Promise<void> {
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: buttonName }).click();
}
