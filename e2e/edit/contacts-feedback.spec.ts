import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type Contact = { id: string; email: string; read: boolean };
type Feedback = { id: string; read: boolean; comment: string };

/**
 * Contatos e avaliações só têm uma edição pelo painel: marcar como lido ou
 * não lido, direto no card.
 */
test.describe('Contatos e avaliações: lido / não lido', () => {
  let api: ApiClient;
  let contact: Contact | null = null;
  let feedback: Feedback;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    // O contato é público e dispara e-mail; se o SMTP local demorar/falhar, guarda o nulo.
    try {
      contact = await api.post<Contact>('/contact', {
        name: `E2E Contato ${suffix}`,
        email: `e2e.contato.${suffix}@teste.clubinhonib.com`,
        phone: '11999990000',
        message: 'Mensagem de contato enviada pelo Playwright para o teste de leitura.',
      });
    } catch {
      contact = null;
    }
    feedback = await api.post<Feedback>('/site-feedbacks', {
      rating: 4,
      comment: `E2E feedback ${suffix}`,
      category: 'suggestion',
    });
  });

  test.afterAll(async () => {
    if (contact) await api.delete(`/contact/${contact.id}`);
    await api.delete(`/site-feedbacks/${feedback.id}`);
    await api.dispose();
  });

  test('marca um contato como lido e depois como não lido', async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!contact, 'contato não pôde ser criado (SMTP local)');

    await page.goto('/adm/contatos');
    await expect(page.getByTestId('contacts-contacts-manager')).toBeVisible();

    await searchListing(page, suffix);
    const card = cardOf(page, 'contacts', 'contact-card', contact!.id);
    await expect(card).toBeVisible();

    // 1. Marcar como lido
    const readBtn = card.getByRole('button', { name: 'Marcar como lido' });
    await expect(readBtn).toBeVisible();
    await readBtn.click();

    // Aguarda atualização na API e a transição visual do botão no DOM
    await expect.poll(async () => (await api.get<Contact>(`/contact/${contact!.id}`)).read).toBe(true);
    const unreadBtn = card.getByRole('button', { name: 'Marcar como não lido' });
    await expect(unreadBtn).toBeVisible();

    // 2. Marcar como não lido
    await unreadBtn.click();
    await expect.poll(async () => (await api.get<Contact>(`/contact/${contact!.id}`)).read).toBe(false);
  });

  test('marca uma avaliação como lida e depois como não lida', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/adm/feedbacks');
    await expect(page.getByTestId('feedback-feedback-manager')).toBeVisible();

    await searchListing(page, suffix);
    const card = cardOf(page, 'feedback', 'feedback-card', feedback.id);
    await expect(card).toBeVisible();

    // 1. Marcar como lida
    const readBtn = card.getByRole('button', { name: 'Marcar como lida' });
    await expect(readBtn).toBeVisible();
    await readBtn.click();

    // Aguarda atualização na API e transição do botão no DOM
    await expect.poll(async () => (await api.get<Feedback>(`/site-feedbacks/${feedback.id}`)).read).toBe(true);
    const unreadBtn = card.getByRole('button', { name: 'Marcar como não lida' });
    await expect(unreadBtn).toBeVisible();

    // 2. Marcar como não lida
    await unreadBtn.click();
    await expect.poll(async () => (await api.get<Feedback>(`/site-feedbacks/${feedback.id}`)).read).toBe(false);
  });
});
