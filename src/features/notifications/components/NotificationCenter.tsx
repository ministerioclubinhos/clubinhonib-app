import { Box, Drawer, Popover, useMediaQuery, useTheme } from '@mui/material';
import {
  NOTIFICATIONS_PANEL_MAX_HEIGHT,
  NOTIFICATIONS_POPOVER_WIDTH,
  NOTIFICATIONS_SHEET_MAX_HEIGHT,
  NOTIFICATIONS_SHEET_RADIUS,
} from '../constants';
import { NotificationPanelVariant } from '../types';
import { useNotificationCenter } from './NotificationContext';
import { NotificationPanel } from './NotificationPanel';

/**
 * Mobile first: abaixo de `md`, gaveta que sobe de baixo, com a altura do
 * conteúdo (até 85% da tela) e as ações ao alcance do polegar. No desktop,
 * painel ancorado ao sino, também do tamanho do conteúdo. Nos dois, listas
 * longas rolam por dentro. Fechar devolve o foco ao sino.
 */
export function NotificationCenter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { centerOpen, anchorEl, closeCenter } = useNotificationCenter();
  // Ao fechar, o foco volta ao sino (se ele ainda estiver na tela).
  const restoreFocus = () => {
    if (anchorEl?.isConnected) anchorEl.focus();
  };

  if (isMobile) {
    return (
      <Drawer
        data-testid="notifications-center-dialog"
        anchor="bottom"
        open={centerOpen}
        onClose={closeCenter}
        // Acima da navbar fixa (1300) e do menu lateral.
        sx={{ zIndex: theme.zIndex.modal + 100 }}
        SlideProps={{ onExited: restoreFocus }}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'notifications-center-title',
          sx: {
            maxHeight: NOTIFICATIONS_SHEET_MAX_HEIGHT,
            borderTopLeftRadius: NOTIFICATIONS_SHEET_RADIUS,
            borderTopRightRadius: NOTIFICATIONS_SHEET_RADIUS,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Alça visual da gaveta. */}
        <Box
          aria-hidden="true"
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.400',
            mx: 'auto',
            mt: 1,
            flexShrink: 0,
          }}
        />
        <NotificationPanel variant={NotificationPanelVariant.DIALOG} onClose={closeCenter} />
      </Drawer>
    );
  }

  return (
    <Popover
      data-testid="notifications-center-popover"
      open={centerOpen && Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={closeCenter}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      sx={{ zIndex: theme.zIndex.modal + 100 }}
      TransitionProps={{ onExited: restoreFocus }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-labelledby': 'notifications-center-title',
          sx: {
            mt: 1,
            width: NOTIFICATIONS_POPOVER_WIDTH,
            maxWidth: 'calc(100vw - 32px)',
            // A altura acompanha o conteúdo; o limite só vale para listas longas,
            // que rolam por dentro. Altura fixa deixava um vão branco com poucos avisos.
            maxHeight: NOTIFICATIONS_PANEL_MAX_HEIGHT,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <NotificationPanel variant={NotificationPanelVariant.POPOVER} onClose={closeCenter} />
    </Popover>
  );
}
