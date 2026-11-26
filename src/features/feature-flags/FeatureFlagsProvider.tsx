import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { FeatureFlags, MOCKED_FEATURE_FLAGS } from '@/constants/featureFlags';
import type { RootState } from '@/store/slices';
import { isCancelledRequest } from '@/utils/apiError';

import { apiGetFeatureFlagsMap } from './api';

/** O que a aplicação consulta para decidir o que mostrar. */
export interface FeatureFlagsContextValue {
  /** Situação de cada flag para a sessão atual. */
  flags: FeatureFlags;
  /** True enquanto a primeira resposta não chegou. */
  loading: boolean;
  error: string | null;
  /** Consulta uma flag pelo nome, inclusive as criadas depois do build. */
  isEnabled: (key: string) => boolean;
  /** Recarrega o mapa; usado depois de mexer nas flags no painel. */
  refresh: () => Promise<void>;
}

/**
 * Lê uma flag pelo nome.
 *
 * `FeatureFlags` declara as chaves conhecidas em tempo de compilação, e é bom
 * que continue assim: é isso que pega um nome escrito errado. A conversão fica
 * só aqui, para o caso das flags criadas no painel depois do build.
 */
function readFlag(flags: FeatureFlags, key: string): boolean {
  return Boolean((flags as unknown as Record<string, boolean>)[key]);
}

/**
 * Valor usado fora do provedor.
 *
 * Vale para testes de unidade que montam um componente isolado: valem os
 * padrões embutidos, que são os mesmos com que a aplicação nasce.
 */
const FALLBACK: FeatureFlagsContextValue = {
  flags: MOCKED_FEATURE_FLAGS,
  loading: false,
  error: null,
  isEnabled: (key: string) => readFlag(MOCKED_FEATURE_FLAGS, key),
  refresh: async () => {},
};

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>(FALLBACK);

/**
 * Carrega as feature flags uma única vez e as compartilha com a aplicação.
 *
 * Antes cada tela chamava o hook por conta própria: eram várias requisições ao
 * mesmo endpoint, cada uma com sua cópia do resultado, e ligar uma flag no
 * painel não mudava nada nas outras telas até recarregar a página.
 *
 * O mapa depende de quem está logado — uma flag restrita a coordenadores vale
 * `false` para os demais —, então ele é buscado de novo quando a sessão muda.
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { user, initialized } = useSelector((state: RootState) => state.auth);

  const [flags, setFlags] = useState<FeatureFlags>(MOCKED_FEATURE_FLAGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // O que muda o mapa é a identidade e o perfil de quem pergunta.
  const identity = `${user?.id ?? 'anonimo'}:${user?.role ?? 'visitante'}`;

  useEffect(() => {
    // Esperar a sessão ser resolvida evita buscar o mapa como visitante e
    // logo depois de novo como o usuário logado, com a tela piscando no meio.
    if (!initialized) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const map = await apiGetFeatureFlagsMap();
        if (!active) return;
        setFlags({ ...MOCKED_FEATURE_FLAGS, ...map });
      } catch (err: unknown) {
        if (!active || isCancelledRequest(err)) return;
        setError('Não foi possível carregar as feature flags do servidor.');
        // Sem resposta valem os padrões do código: a tela nunca fica sem
        // decisão, e nenhuma área some por causa de uma falha de rede.
        setFlags(MOCKED_FEATURE_FLAGS);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [identity, initialized, reloadToken]);

  const refresh = useCallback(async () => {
    setReloadToken((token) => token + 1);
  }, []);

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      flags,
      loading,
      error,
      isEnabled: (key: string) => readFlag(flags, key),
      refresh,
    }),
    [flags, loading, error, refresh],
  );

  return (
    <FeatureFlagsContext.Provider data-testid="feature-flags-feature-flags-provider" value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/** As feature flags da sessão atual. */
export function useFeatureFlagsContext(): FeatureFlagsContextValue {
  return useContext(FeatureFlagsContext);
}
