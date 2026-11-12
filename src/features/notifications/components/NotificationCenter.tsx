import { Dialog, Popover, useMediaQuery, useTheme } from '@mui/material';
import {
  NOTIFICATIONS_PANEL_MAX_HEIGHT,
  NOTIFICATIONS_POPOVER_WIDTH,
} from '../constants';
import { NotificationPanelVariant } from '../types';
import { useNotificationCenter } from './NotificationContext';
import { NotificationPanel } from './NotificationPanel';

/**
 * Desktop: painel ancorado ao sino. Abaixo de `md`: tela cheia com áreas
 * seguras. Fechar devolve o foco ao sino (comportamento do MUI).
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
      <Dialog
        data-testid="notifications-center-dialog"
        open={centerOpen}
        onClose={closeCenter}
        fullScreen
        aria-labelledby="notifications-center-title"
        // Acima da navbar fixa (1300) e do menu lateral.
        sx={{ zIndex: theme.zIndex.modal + 100 }}
        TransitionProps={{ onExited: restoreFocus }}
        PaperProps={{
          sx: {
            height: '100dvh',
            pt: 'env(safe-area-inset-top)',
            boxSizing: 'border-box',
            overflow: 'hidden',
          },
        }}
      >
        <NotificationPanel variant={NotificationPanelVariant.DIALOG} onClose={closeCenter} />
      </Dialog>
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
            height: NOTIFICATIONS_PANEL_MAX_HEIGHT,
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
