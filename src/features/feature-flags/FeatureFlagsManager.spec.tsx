import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FeatureFlagResponse, FeatureFlagStats } from './types';

/** Larguras de tela no jsdom, que não implementa `matchMedia`. */
function mockViewport(width: number): void {
  vi.stubGlobal('matchMedia', (query: string): MediaQueryList => {
    const maxWidth = /max-width:\s*([\d.]+)px/.exec(query);
    const minWidth = /min-width:\s*([\d.]+)px/.exec(query);
    const matches = maxWidth
      ? width <= Number(maxWidth[1])
      : minWidth
        ? width >= Number(minWidth[1])
        : false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  });
}

const stats: FeatureFlagStats = {
  total: 30,
  enabled: 28,
  disabled: 2,
  byAudience: {
    EVERYONE: 12,
    ADMIN: 3,
    COORDINATOR: 0,
    TEACHER: 0,
    ADMIN_COORDINATOR: 4,
    ADMIN_TEACHER: 0,
    COORDINATOR_TEACHER: 0,
    ALL_ROLES: 11,
  },
};

const flag: FeatureFlagResponse = {
  id: 'flag-1',
  key: 'statistics',
  name: 'Estatísticas',
  description: 'Painel de métricas',
  enabled: true,
  targetRoles: [],
  audience: 'ADMIN',
  metadata: null,
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-11T12:00:00.000Z',
};

vi.mock('./hooks', () => ({
  useFeatureFlagsList: () => ({
    items: [flag],
    total: 1,
    stats,
    page: 1,
    setPage: () => {},
    pageSize: 12,
    setPageSize: () => {},
    search: '',
    setSearch: () => {},
    filters: { status: '', audience: '', sort: 'name', order: 'ASC' },
    setFilters: () => {},
    loading: false,
    error: '',
    setError: () => {},
    refresh: () => {},
  }),
  useFeatureFlagMutations: () => ({
    saving: false,
    actionError: '',
    setActionError: () => {},
    actionMessage: '',
    setActionMessage: () => {},
    save: async () => true,
    toggle: async () => true,
    remove: async () => true,
    syncCatalog: async () => true,
  }),
}));

vi.mock('./FeatureFlagsProvider', () => ({
  useFeatureFlagsContext: () => ({ refresh: async () => {} }),
}));

import FeatureFlagsManager from './FeatureFlagsManager';

const renderPanel = () =>
  render(
    <MemoryRouter>
      <FeatureFlagsManager />
    </MemoryRouter>,
  );

describe('FeatureFlagsManager · mobile', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('mantém a ação principal e a listagem à mão no celular', () => {
    mockViewport(390);

    renderPanel();

    expect(screen.getByRole('button', { name: /nova flag/i })).toBeInTheDocument();
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
    // O alvo de toque do interruptor é declarado no card.
    expect(screen.getByLabelText('Alternar Estatísticas')).toBeInTheDocument();
  });

  it('mostra a contagem essencial do acervo', () => {
    mockViewport(390);

    renderPanel();

    expect(screen.getByText('30 no total')).toBeInTheDocument();
    expect(screen.getByText('28 ligadas')).toBeInTheDocument();
    expect(screen.getByText('2 desligadas')).toBeInTheDocument();
  });

  it('oferece a conferência do catálogo também no celular', () => {
    mockViewport(390);

    renderPanel();

    // A conferência do catálogo vive dentro de um Tooltip, que atrapalha o
    // nome acessível; o rótulo visível é o que interessa aqui.
    expect(screen.getByText('Conferir catálogo')).toBeInTheDocument();
  });

  it('mostra busca e filtros no desktop', () => {
    mockViewport(1440);

    renderPanel();

    expect(screen.getByLabelText('Situação')).toBeInTheDocument();
    expect(screen.getByLabelText('Público')).toBeInTheDocument();
  });
});

