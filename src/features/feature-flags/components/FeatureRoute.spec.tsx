import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import type { FeatureFlagsContextValue } from '../FeatureFlagsProvider';

/** O provedor é substituído para o teste controlar mapa e carregamento. */
let context: Pick<FeatureFlagsContextValue, 'isEnabled' | 'loading'>;

vi.mock('../FeatureFlagsProvider', () => ({
  useFeatureFlagsContext: () => context,
}));

import FeatureRoute from './FeatureRoute';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>casa</div>} />
        <Route element={<FeatureRoute flag="events_section" />}>
          <Route path="/eventos" element={<div>eventos</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('FeatureRoute', () => {
  it('abre a rota quando a flag está ligada', () => {
    context = { isEnabled: () => true, loading: false };

    renderAt('/eventos');

    expect(screen.getByText('eventos')).toBeInTheDocument();
  });

  it('redireciona quando a flag está desligada', () => {
    context = { isEnabled: () => false, loading: false };

    renderAt('/eventos');

    expect(screen.queryByText('eventos')).not.toBeInTheDocument();
    expect(screen.getByText('casa')).toBeInTheDocument();
  });

  it('espera o mapa chegar antes de decidir', () => {
    // Redirecionar durante o carregamento jogaria para fora quem tem acesso,
    // só porque a resposta ainda não voltou.
    context = { isEnabled: () => false, loading: true };

    renderAt('/eventos');

    expect(screen.queryByText('casa')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Carregando recursos disponíveis'),
    ).toBeInTheDocument();
  });

  it('consulta exatamente a flag declarada', () => {
    const isEnabled = vi.fn(() => true);
    context = { isEnabled, loading: false };

    renderAt('/eventos');

    expect(isEnabled).toHaveBeenCalledWith('events_section');
  });
});
