import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

import { expect, type Page, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { API_URL, TEACHER_EMAIL, TEACHER_PASSWORD } from '../support/env';
import { assertLocalApi } from '../support/emailFlags';
import { selectMuiOption } from '../support/ui';

/**
 * Entrada, cadastro, confirmação de e-mail e recuperação de senha, pela tela e
 * conferindo a conta na API. Cada cenário começa sem sessão.
 */
test.use({ storageState: { cookies: [], origins: [] } });

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

const emailOf = (tag: string): string => `e2e.${tag}.${uniqueSuffix()}@teste.clubinhonib.com`;
const PASSWORD = 'Senha123@';

function seedToken(kind: 'passwordReset' | 'emailVerification', userId: string, expiresInMinutes = 30): string {
  assertLocalApi();
  const token = randomBytes(32).toString('hex');
  execFileSync(
    process.execPath,
    [resolve('e2e/support/authTokens.mjs'), JSON.stringify({ kind, userId, token, expiresInMinutes })],
    { stdio: 'pipe' }
  );
  return token;
}

const loginForm = (page: Page) => ({
  email: page.getByRole('textbox', { name: 'Email' }),
  password: page.locator('input[type="password"]'),
  submit: page.getByRole('main').getByRole('button', { name: 'Entrar' }),
});

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const form = loginForm(page);
  await form.email.fill(email);
  await form.password.fill(password);
  await form.submit.click();
}

test.describe('Autenticação', () => {
  let admin: ApiClient;
  const created = new Set<string>();

  test.beforeAll(async () => {
    admin = await ApiClient.login();
  });

  async function findUser(email: string): Promise<UserRow | undefined> {
    const page = await admin.get<{ items: UserRow[] }>('/users', { page: 1, limit: 10, q: email });
    return page.items.find((user) => user.email === email);
  }

  async function createUser(tag: string, active: boolean): Promise<UserRow> {
    const email = emailOf(tag);
    created.add(email);
    await admin.post('/users', {
      name: `E2E ${tag}`,
      email,
      phone: '92999990000',
      password: PASSWORD,
      role: 'teacher',
      completed: true,
      active,
    });
    return (await findUser(email)) as UserRow;
  }

  test.afterAll(async () => {
    for (const email of created) {
      const user = await findUser(email);
      if (user) await admin.delete(`/users/${user.id}`);
    }
    await admin.dispose();
  });

  test.describe('login', () => {
    test('professor entra, chega à Área do Professor e sai', async ({ page }) => {
      await page.goto('/login');
      await signIn(page, TEACHER_EMAIL, TEACHER_PASSWORD);
      await expect(page).toHaveURL(/\/area-do-professor/);

      await page.goto('/meu-perfil');
      await expect(page).toHaveURL(/\/meu-perfil/);
    });

    test('o botão só habilita com e-mail válido e senha de 6 caracteres', async ({ page }) => {
      await page.goto('/login');
      const form = loginForm(page);
      await expect(form.submit).toBeDisabled();
      await form.email.fill('nao-e-email');
      await form.password.fill(PASSWORD);
      await expect(form.submit).toBeDisabled();
      await form.email.fill(TEACHER_EMAIL);
      await form.password.fill('12345');
      await expect(form.submit).toBeDisabled();
      await form.password.fill('123456');
      await expect(form.submit).toBeEnabled();
    });

    test('senha errada mostra o motivo e não abre sessão', async ({ page }) => {
      await page.goto('/login');
      await signIn(page, TEACHER_EMAIL, 'SenhaErrada123');
      await expect(page.getByRole('alert').filter({ hasText: 'Email ou senha incorretos.' })).toBeVisible();
      await page.goto('/area-do-professor');
      await expect(page).toHaveURL(/\/login/);
    });

    test('conta inativa não entra', async ({ page }) => {
      const user = await createUser('inativa', false);
      await page.goto('/login');
      await signIn(page, user.email, PASSWORD);
      await expect(page.getByRole('alert').filter({ hasText: 'Usuário não validado' })).toBeVisible();
      await page.goto('/area-do-professor');
      await expect(page).toHaveURL(/\/login/);
    });

    test('depois do login, só a central de notificações é retomada', async ({ page }) => {
      // Regra de `resolvePostLoginDestination`: nada de redirecionamento aberto;
      // os demais endereços caem na área padrão do perfil.
      await page.goto('/notificacoes');
      await expect(page).toHaveURL(/\/login$/);
      await signIn(page, TEACHER_EMAIL, TEACHER_PASSWORD);
      await expect(page).toHaveURL(/\/notificacoes$/);
    });

    test('outra rota protegida leva ao login e termina na área do perfil', async ({ page }) => {
      await page.goto('/meu-perfil');
      await expect(page).toHaveURL(/\/login$/);
      await signIn(page, TEACHER_EMAIL, TEACHER_PASSWORD);
      await expect(page).toHaveURL(/\/area-do-professor$/);
    });
  });

  test.describe('cadastro', () => {
    async function fillRegistration(page: Page, email: string): Promise<void> {
      await page.getByRole('textbox', { name: 'Nome' }).fill('E2E Cadastro');
      await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
      await page.getByRole('textbox', { name: 'Confirmar Email' }).fill(email);
      await page.getByRole('textbox', { name: 'Telefone' }).fill('92999990000');
      await selectMuiOption(page, page.getByRole('combobox', { name: /Você é/ }), 'Professor');
      await page.getByLabel('Senha', { exact: true }).fill(PASSWORD);
      await page.getByLabel('Confirmar Senha').fill(PASSWORD);
    }

    const submit = (page: Page) => page.getByRole('main').getByRole('button', { name: /Cadastrar|Registrar|Criar/ });

    test('cria a conta inativa com o perfil escolhido', async ({ page }) => {
      const email = emailOf('cadastro');
      created.add(email);
      await page.goto('/cadastrar');
      await fillRegistration(page, email);
      await submit(page).click();

      await expect.poll(async () => findUser(email)).toMatchObject({ role: 'teacher', active: false });
    });

    test('a tela não oferece o perfil de administrador', async ({ page }) => {
      await page.goto('/cadastrar');
      await page.getByRole('combobox', { name: /Você é/ }).click();
      const options = page.getByRole('listbox').getByRole('option');
      await expect(options).toHaveText(['Selecione', 'Professor', 'Coordenador']);
    });

    test('e-mail repetido mostra a mensagem da API', async ({ page }) => {
      // A tela lia `data.message`; a API responde em `error.message`.
      await page.goto('/cadastrar');
      await fillRegistration(page, TEACHER_EMAIL);
      await submit(page).click();
      // Uma única vez: o alerta da tela, sem o toast global repetindo.
      await expect(page.getByRole('alert').filter({ hasText: 'Este email já está em uso' })).toHaveCount(1);
    });

    test('confere campos obrigatórios e confirmações antes de enviar', async ({ page }) => {
      const requests: string[] = [];
      page.on('request', (r) => r.url() === `${API_URL}/auth/register` && requests.push(r.method()));
      await page.goto('/cadastrar');
      await fillRegistration(page, emailOf('invalido'));
      await page.getByRole('textbox', { name: 'Confirmar Email' }).fill('outro@teste.com');
      await page.getByLabel('Confirmar Senha').fill('diferente1');
      await submit(page).click();

      await expect(page.getByText('Os emails não coincidem')).toBeVisible();
      await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
      expect(requests).toEqual([]);
    });

    test('o cadastro do Google sem ter passado pelo Google volta ao login', async ({ page }) => {
      await page.goto('/cadastrar-google');
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('confirmação de e-mail', () => {
    test('o link do e-mail ativa a conta, que então consegue entrar', async ({ page }) => {
      // O link aponta para /confirmar-email/:token, rota que não existia.
      const user = await createUser('confirmar', false);
      const token = seedToken('emailVerification', user.id);

      await page.goto(`/confirmar-email/${token}`);
      await expect(page.getByRole('alert').filter({ hasText: 'Sua conta está ativa' })).toBeVisible();
      await expect.poll(async () => (await findUser(user.email))?.active).toBe(true);

      await page.getByRole('main').getByRole('link', { name: 'Entrar' }).click();
      await signIn(page, user.email, PASSWORD);
      await expect(page).toHaveURL(/\/area-do-professor/);
    });

    test('link já usado ou inválido explica e permite pedir outro', async ({ page }) => {
      const user = await createUser('expirado', false);
      const token = seedToken('emailVerification', user.id, -1);

      await page.goto(`/confirmar-email/${token}`);
      await expect(page.getByRole('alert').filter({ hasText: 'inválido ou expirado' })).toBeVisible();
      expect((await findUser(user.email))?.active).toBe(false);

      await page.getByRole('textbox', { name: 'E-mail cadastrado' }).fill(user.email);
      await page.getByRole('button', { name: 'Reenviar link de confirmação' }).click();
      await expect(page.getByTestId('auth-resend-verification-form').getByRole('alert')).toBeVisible();
    });

    test('as instruções falam do e-mail que o site realmente envia', async ({ page }) => {
      await page.goto('/verificar-email');
      const main = page.getByRole('main');
      await expect(main).toContainText('Confirme seu e-mail - Clubinhos NIB');
      await expect(main).not.toContainText('Amazon');
    });
  });

  test.describe('recuperação de senha', () => {
    test('o link troca a senha uma única vez', async ({ page }) => {
      const user = await createUser('recuperar', true);
      const token = seedToken('passwordReset', user.id);

      await page.goto(`/recuperar-senha/${token}`);
      await expect(page.getByRole('main')).toContainText(user.email);
      await page.getByLabel(/^Nova Senha/).fill('OutraSenha123@');
      await page.getByLabel(/^Confirmar Nova Senha/).fill('OutraSenha123@');
      await page.getByRole('button', { name: 'Redefinir Senha' }).click();
      await expect(page.getByRole('alert').filter({ hasText: /alterada com sucesso/i })).toBeVisible();

      const session = await ApiClient.login(user.email, 'OutraSenha123@');
      await session.dispose();
      const reused = await admin.send('POST', '/auth/reset-password', { token, newPassword: 'Terceira123@' });
      expect(reused.status).toBeGreaterThanOrEqual(400);
    });

    test('link expirado oferece pedir outro', async ({ page }) => {
      const user = await createUser('vencido', true);
      const token = seedToken('passwordReset', user.id, -1);
      await page.goto(`/recuperar-senha/${token}`);
      await expect(page.getByRole('button', { name: 'Solicitar Nova Recuperação' })).toBeVisible();
    });

    test('validar sem token não entrega o e-mail de ninguém', async () => {
      // `where: { token: undefined }` devolvia a primeira linha da tabela.
      const user = await createUser('vazamento', true);
      seedToken('passwordReset', user.id);
      for (const query of ['', '?token=']) {
        const result = await admin.send('GET', `/auth/reset-password/validate${query}`);
        expect(result.status, query).toBeGreaterThanOrEqual(400);
        expect(JSON.stringify(result.body)).not.toContain('@');
      }
    });
  });
});
