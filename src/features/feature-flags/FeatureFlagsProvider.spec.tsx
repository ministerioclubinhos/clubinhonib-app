import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCKED_FEATURE_FLAGS } from '@/constants/featureFlags';

const getMap = vi.fn();

vi.mock('./api', () => ({
  apiGetFeatureFlagsMap: (...args: unknown[]) => getMap(...args) as unknown,
}));

/** Sessão simulada; o teste troca o usuário para exercitar a recarga. */
let auth = { user: null as { id: string; role: string } | null, initialized: true };

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({ auth }),
}));

import { FeatureFlagsProvider, useFeatureFlagsContext } from './FeatureFlagsProvider';

function Probe() {
  const { flags, loading, isEnabled } = useFeatureFlagsContext();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="events">{String(flags.events_section)}</span>
      <span data-testid="dinamica">{String(isEnabled('flag_criada_no_painel'))}</span>
    </div>
  );
}

const renderProvider = () =>
  render(
    <FeatureFlagsProvider>
      <Probe />
    </FeatureFlagsProvider>,
  );

describe('FeatureFlagsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth = { user: null, initialized: true };
  });

  it('busca o mapa uma vez e compartilha o resultado', async () => {
    getMap.mockResolvedValue({ events_section: false });

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('events').textContent).toBe('false'),
    );
    expect(getMap).toHaveBeenCalledTimes(1);
  });

  it('enxerga flags criadas depois do build', async () => {
    getMap.mockResolvedValue({ flag_criada_no_painel: true });

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('dinamica').textContent).toBe('true'),
    );
  });

  it('mantém os padrões embutidos quando a busca falha', async () => {
    // Uma falha de rede não pode fazer áreas inteiras sumirem da tela.
    getMap.mockRejectedValue(new Error('sem rede'));

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('events').textContent).toBe(
      String(MOCKED_FEATURE_FLAGS.events_section),
    );
  });

  it('não busca nada antes de a sessão ser resolvida', () => {
    auth = { user: null, initialized: false };
    getMap.mockResolvedValue({});

    renderProvider();

    expect(getMap).not.toHaveBeenCalled();
  });

  it('busca de novo quando o perfil da sessão muda', async () => {
    // O mapa depende do perfil: continuar com o do visitante depois do login
    // esconderia o que o usuário passou a poder ver.
    getMap.mockResolvedValue({ events_section: true });

    const { rerender } = renderProvider();
    await waitFor(() => expect(getMap).toHaveBeenCalledTimes(1));

    auth = { user: { id: 'u1', role: 'admin' }, initialized: true };
    rerender(
      <FeatureFlagsProvider>
        <Probe />
      </FeatureFlagsProvider>,
    );

    await waitFor(() => expect(getMap).toHaveBeenCalledTimes(2));
  });
});
