import { useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, Switch, Typography } from '@mui/material';
import { NOTIFICATION_COPY, NOTIFICATIONS_TOUCH_TARGET, PERMISSION_LABELS } from '../constants';
import { BrowserPermissionState } from '../types';
import { useNotificationCenter } from './NotificationContext';

/** Permissão do navegador: pedida só no clique, com todos os estados tratados. */
export function NotificationPermissionCard() {
  const { permission, preferences, setBrowserEnabled, testBrowser } = useNotificationCenter();
  const [failed, setFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const enabled =
    preferences.browserNotificationsEnabled && permission === BrowserPermissionState.GRANTED;

  const toggle = async (next: boolean) => {
    setFailed(false);
    try {
      // Sem chamada de rede antes: o pedido de permissão usa o gesto do clique.
      const result = await setBrowserEnabled(next);
      if (next && result === BrowserPermissionState.DEFAULT) setDismissed(true);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Box data-testid="notifications-browser-card" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <FormControlLabel
          sx={{ mr: 'auto', minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          control={
            <Switch
              data-testid="notifications-browser-toggle"
              checked={enabled}
              disabled={
                permission === BrowserPermissionState.DENIED ||
                permission === BrowserPermissionState.UNSUPPORTED
              }
              onChange={(event) => {
                void toggle(event.target.checked);
              }}
            />
          }
          label={NOTIFICATION_COPY.browserLabel}
        />
        <Chip
          data-testid="notifications-browser-permission"
          size="small"
          label={PERMISSION_LABELS[permission]}
          color={permission === BrowserPermissionState.GRANTED ? 'success' : 'default'}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {NOTIFICATION_COPY.browserHelp}
      </Typography>

      {permission === BrowserPermissionState.DEFAULT && !dismissed && !enabled && (
        <Alert
          data-testid="notifications-browser-ask"
          severity="info"
          sx={{ mt: 1.5 }}
          action={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button
                data-testid="notifications-browser-enable"
                color="inherit"
                onClick={() => {
                  void toggle(true);
                }}
                sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
              >
                {NOTIFICATION_COPY.browserAllow}
              </Button>
              <Button
                data-testid="notifications-browser-later"
                color="inherit"
                onClick={() => setDismissed(true)}
                sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
              >
                {NOTIFICATION_COPY.browserLater}
              </Button>
            </Box>
          }
        >
          {NOTIFICATION_COPY.browserAsk}
        </Alert>
      )}
      {permission === BrowserPermissionState.DENIED && (
        <Alert data-testid="notifications-browser-denied" severity="warning" sx={{ mt: 1.5 }}>
          {NOTIFICATION_COPY.browserDenied}
        </Alert>
      )}
      {permission === BrowserPermissionState.UNSUPPORTED && (
        <Alert data-testid="notifications-browser-unsupported" severity="info" sx={{ mt: 1.5 }}>
          {NOTIFICATION_COPY.browserUnsupported}
        </Alert>
      )}
      {failed && (
        <Alert data-testid="notifications-browser-failed" severity="error" sx={{ mt: 1.5 }}>
          {NOTIFICATION_COPY.browserFailed}
        </Alert>
      )}
      {enabled && (
        <>
          <Button
            data-testid="notifications-browser-test"
            variant="outlined"
            onClick={() => {
              void testBrowser().then((shown) => setFailed(!shown));
            }}
            sx={{ mt: 1.5, minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          >
            {NOTIFICATION_COPY.browserTest}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {NOTIFICATION_COPY.browserLimit}
          </Typography>
        </>
      )}
    </Box>
  );
}
