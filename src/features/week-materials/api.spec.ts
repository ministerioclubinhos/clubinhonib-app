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

  it('lists pages sorted from the newest to the oldest', async () => {
    mocked.get.mockResolvedValue({
      data: [
        material('old', '2025-01-01T00:00:00.000Z'),
        material('new', '2026-01-01T00:00:00.000Z'),
      ],
    });

    const result = await listWeekMaterials();

    expect(mocked.get).toHaveBeenCalledWith(WEEK_MATERIALS_ENDPOINT);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('loads one page by id', async () => {
    mocked.get.mockResolvedValue({ data: material('page-1', '') });

    await getWeekMaterial('page-1');

    expect(mocked.get).toHaveBeenCalledWith(`${WEEK_MATERIALS_ENDPOINT}/page-1`);
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
