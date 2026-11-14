import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useFeatureFlagsContext } from '../FeatureFlagsProvider';

interface Props {
  /** Chave da flag que libera as rotas filhas. */
  flag: string;
  /** Para onde mandar quem chegou com a flag desligada. */
  redirectTo?: string;
}

/**
 * Fecha um conjunto de rotas quando a flag correspondente está desligada.
 *
 * A decisão espera o mapa chegar: redirecionar antes disso jogaria para fora
 * quem tem acesso, só porque a resposta ainda não voltou.
 */
export default function FeatureRoute({ flag, redirectTo = '/' }: Props) {
  const location = useLocation();
  const { isEnabled, loading } = useFeatureFlagsContext();

  if (loading) {
    return (
      <Box data-testid="feature-flags-feature-route"
        sx={{
          minHeight: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress aria-label="Carregando recursos disponíveis" />
      </Box>
    );
  }

  if (!isEnabled(flag)) {
    return (
      <Navigate data-testid="feature-flags-feature-route"
        to={redirectTo}
        state={{ from: location, error: 'Recurso indisponível' }}
        replace
      />
    );
  }

  return <Outlet data-testid="feature-flags-feature-route" />;
}
