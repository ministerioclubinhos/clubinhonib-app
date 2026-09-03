import { useFeatureFlagsContext } from '@/features/feature-flags/FeatureFlagsProvider';
import type { FeatureFlags } from '@/constants/featureFlags';

export interface UseFeatureFlagsReturn {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * As feature flags que valem para a sessão atual.
 *
 * A busca acontece uma vez só, no `FeatureFlagsProvider`: todas as telas leem
 * o mesmo estado, e ligar uma flag no painel se reflete em todas elas sem
 * recarregar a página.
 */
export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const { flags, loading, error, refresh } = useFeatureFlagsContext();
  return { flags, loading, error, refresh };
};

/**
 * Uma flag específica, inclusive as criadas no painel depois do build.
 *
 * Enquanto o mapa não chega vale o padrão embutido, e não `false`: esconder
 * tudo durante o carregamento faria a tela piscar a cada navegação.
 */
export const useFeatureEnabled = (key: string): boolean => {
  const { isEnabled } = useFeatureFlagsContext();
  return isEnabled(key);
};

export default useFeatureFlags;
