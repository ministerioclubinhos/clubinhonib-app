import { APIRequestContext, expect, request } from '@playwright/test';

import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from './env';

/**
 * Acesso direto à API para preparar e conferir dados.
 *
 * Os testes de edição criam a entidade que vão editar (para não depender do
 * que já existe no banco) e, depois de salvar pela tela, releem pela API para
 * provar que a alteração foi persistida — e não só exibida.
 */
export class ApiClient {
  private constructor(
    private readonly ctx: APIRequestContext,
    readonly token: string,
  ) {}

  static async login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD): Promise<ApiClient> {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/auth/login', { data: { email, password } });
    expect(res.ok(), `login da API falhou: ${res.status()}`).toBeTruthy();
    const body = (await res.json()) as { accessToken?: string };
    expect(body.accessToken, 'login da API sem accessToken').toBeTruthy();
    return new ApiClient(ctx, body.accessToken as string);
  }

  private headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}` };
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const res = await this.ctx.get(path, { headers: this.headers(), params });
    const text = await res.text();
    expect(res.ok(), `GET ${path} -> ${res.status()} ${text}`).toBeTruthy();
    // Algumas rotas devolvem corpo vazio no lugar de `null` (ex.: período inexistente).
    return (text ? JSON.parse(text) : null) as T;
  }

  /**
   * Status de um GET, sem exigir sucesso.
   *
   * `get` reprova qualquer resposta que não seja 2xx, então não serve para
   * provar que algo deixou de existir — que é justamente o que os testes de
   * exclusão precisam afirmar.
   */
  async statusOf(path: string): Promise<number> {
    const res = await this.ctx.get(path, { headers: this.headers() });
    return res.status();
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const res = await this.ctx.post(path, { headers: this.headers(), data });
    expect(res.ok(), `POST ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  /** Multipart: `fields` são strings e `files` são `{ name, mimeType, buffer }` por campo. */
  async postMultipart<T>(
    path: string,
    fields: Record<string, string>,
    files: Record<string, { name: string; mimeType: string; buffer: Buffer }> = {},
  ): Promise<T> {
    const res = await this.ctx.post(path, { headers: this.headers(), multipart: { ...fields, ...files } });
    expect(res.ok(), `POST ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
    return (await res.json()) as T;
  }

  async patch<T>(path: string, data?: unknown): Promise<T> {
    const res = await this.ctx.patch(path, { headers: this.headers(), data });
    expect(res.ok(), `PATCH ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
    return (await res.json()) as T;
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const res = await this.ctx.put(path, { headers: this.headers(), data });
    expect(res.ok(), `PUT ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
    return (await res.json()) as T;
  }

  /**
   * Chamada crua: devolve o status e o corpo sem exigir sucesso.
   *
   * É o que os testes de regra precisam para provar uma **recusa** — o código
   * HTTP e o código de erro da API —, coisa que `post`/`patch` reprovariam.
   */
  async send(
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'GET',
    path: string,
    data?: unknown,
  ): Promise<{ status: number; code: string | null; message: string | null; body: unknown }> {
    const res = await this.ctx.fetch(path, { method, headers: this.headers(), data });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    return { status: res.status(), code: error?.code ?? null, message: error?.message ?? null, body };
  }

  /** Remoção tolerante: o que já sumiu não derruba a limpeza do teste. */
  async delete(path: string): Promise<void> {
    await this.ctx.delete(path, { headers: this.headers() });
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }
}

/** Sufixo único para nomes e e-mails criados pelos testes. */
export function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

/** PNG 1x1 real, para os campos de upload. */
export const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
