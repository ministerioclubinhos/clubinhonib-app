import { useSearchParams } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { useDocumentTitle } from '@/hooks';
import {
  NOTIFICATIONS_QUERY_PARAM,
  NotificationPanel,
  NotificationPanelVariant,
} from '@/features/notifications';

/**
 * Histórico completo. O aviso aberto fica na URL
 * (`/notificacoes?notification=<id>`), para voltar/avançar/recarregar e para
 * o clique do aviso do navegador; o detalhe é sempre buscado na API.
 */
export default function NotificationsPage() {
  useDocumentTitle('Notificações');
  const [params, setParams] = useSearchParams();
  const selectedId = params.get(NOTIFICATIONS_QUERY_PARAM);

  return (
    <Container data-testid="notifications-page" maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 0, sm: 2 } }}>
      <Paper variant="outlined" sx={{ borderRadius: { xs: 0, sm: 2 }, overflow: 'hidden' }}>
        <Box>
          <NotificationPanel
            variant={NotificationPanelVariant.PAGE}
            selectedId={selectedId}
            onSelect={(id) => {
              const next = new URLSearchParams(params);
              if (id) next.set(NOTIFICATIONS_QUERY_PARAM, id);
              else next.delete(NOTIFICATIONS_QUERY_PARAM);
              setParams(next);
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}
