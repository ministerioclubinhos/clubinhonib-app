import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/config/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/config/axiosConfig';

import {
  createWeekMaterial,
  deleteWeekMaterial,
  getCurrentWeekMaterial,
  getWeekMaterial,
  listWeekMaterials,
  setCurrentWeek,
  updateWeekMaterial,
} from './api';
import { MULTIPART_HEADERS, WEEK_MATERIALS_ENDPOINT } from './constants';
import { WeekMaterialResponse } from './types';

// The shared client is typed with Axios' overloads, which do not carry the mock
// helpers; narrowing each method keeps the assertions typed without `any`.
const mocked = {
  get: api.get as unknown as Mock,
  post: api.post as unknown as Mock,
  patch: api.patch as unknown as Mock,
  delete: api.delete as unknown as Mock,
};

const material = (id: string, createdAt: string): WeekMaterialResponse =>
  ({ id, createdAt }) as WeekMaterialResponse;

describe('week materials api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('manda paginação, busca e ordenação para a API', async () => {
    // A ordem e o filtro deixaram de ser feitos aqui: quem resolve é o banco.
    mocked.get.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 12, pageCount: 0 },
    });

    const query = {
      page: 2,
      limit: 12,
      searchString: 'gratidão',
      currentWeek: true,
      sort: 'title' as const,
      order: 'ASC' as const,
    };

    const result = await listWeekMaterials(query);

    expect(mocked.get).toHaveBeenCalledWith(WEEK_MATERIALS_ENDPOINT, {
      params: query,
    });
    expect(result.total).toBe(0);
  });

  it('repassa o sinal de cancelamento da requisição', async () => {
    mocked.get.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 12, pageCount: 0 },
    });

    const controller = new AbortController();
    await listWeekMaterials({ page: 1 }, { signal: controller.signal });

    const [, config] = mocked.get.mock.calls[0] as [
      string,
      { signal?: AbortSignal },
    ];
    expect(config.signal).toBe(controller.signal);
  });

  it('loads one page by id', async () => {
    mocked.get.mockResolvedValue({ data: material('page-1', '') });

    await getWeekMaterial('page-1');

    // O segundo argumento é a configuração do Axios, que agora carrega o
    // sinal de cancelamento quando a tela informa um.
    expect(mocked.get).toHaveBeenCalledWith(
      `${WEEK_MATERIALS_ENDPOINT}/page-1`,
      undefined,
    );
  });

  it('loads the published page of the week', async () => {
    mocked.get.mockResolvedValue({ data: null });

    await expect(getCurrentWeekMaterial()).resolves.toBeNull();
    expect(mocked.get).toHaveBeenCalledWith(
      `${WEEK_MATERIALS_ENDPOINT}/current-week`,
    );
  });

  it('creates a page with a multipart body', async () => {
    const formData = new FormData();
    mocked.post.mockResolvedValue({ data: material('page-1', '') });

    await createWeekMaterial(formData);

    expect(mocked.post).toHaveBeenCalledWith(
      WEEK_MATERIALS_ENDPOINT,
      formData,
      { headers: MULTIPART_HEADERS },
    );
  });

  it('updates a page with PATCH and a multipart body', async () => {
    const formData = new FormData();
    mocked.patch.mockResolvedValue({ data: material('page-1', '') });

    await updateWeekMaterial('page-1', formData);

    expect(mocked.patch).toHaveBeenCalledWith(
      `${WEEK_MATERIALS_ENDPOINT}/page-1`,
      formData,
      { headers: MULTIPART_HEADERS },
    );
  });

  it('deletes a page', async () => {
    mocked.delete.mockResolvedValue({ data: undefined });

    await deleteWeekMaterial('page-1');

    expect(mocked.delete).toHaveBeenCalledWith(
      `${WEEK_MATERIALS_ENDPOINT}/page-1`,
    );
  });

  it('publishes a page as the current week material and returns it', async () => {
    mocked.post.mockResolvedValue({ data: material('page-1', '') });

    await expect(setCurrentWeek('page-1')).resolves.toMatchObject({
      id: 'page-1',
    });
    expect(mocked.post).toHaveBeenCalledWith(
      `${WEEK_MATERIALS_ENDPOINT}/current-week/page-1`,
    );
  });
});
