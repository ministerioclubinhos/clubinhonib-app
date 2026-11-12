import { useState } from 'react';
import { Alert, Box, Button, FormControlLabel, Switch, Typography } from '@mui/material';
import { NOTIFICATION_COPY, NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import { SoundPlayResult } from '../types';
import { useNotificationCenter } from './NotificationContext';
import { NotificationPermissionCard } from './NotificationPermissionCard';

export function NotificationSettings() {
  const {
    soundAvailable,
    browserAvailable,
    preferences,
    soundBlocked,
    setSoundEnabled,
    testSound,
    unlockSound,
  } = useNotificationCenter();
  const [unsupported, setUnsupported] = useState(false);

  return (
    <Box data-testid="notifications-settings" sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {NOTIFICATION_COPY.settingsScope}
      </Typography>

      {soundAvailable && (
        <Box data-testid="notifications-sound-card" sx={{ mt: 2 }}>
          <FormControlLabel
            sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
            control={
              <Switch
                data-testid="notifications-sound-toggle"
                checked={preferences.soundEnabled}
                onChange={(event) => {
                  void setSoundEnabled(event.target.checked);
                }}
              />
            }
            label={NOTIFICATION_COPY.soundLabel}
          />
          <Typography variant="body2" color="text.secondary">
            {NOTIFICATION_COPY.soundHelp}
          </Typography>
          <Button
            data-testid="notifications-sound-test"
            variant="outlined"
            onClick={() => {
              void testSound().then((result) =>
                setUnsupported(result === SoundPlayResult.UNSUPPORTED)
              );
            }}
            sx={{ mt: 1.5, minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          >
            {NOTIFICATION_COPY.soundTest}
          </Button>
          {preferences.soundEnabled && soundBlocked && (
            <Alert
              data-testid="notifications-sound-blocked"
              severity="warning"
              sx={{ mt: 1.5 }}
              action={
                <Button
                  data-testid="notifications-sound-unlock"
                  color="inherit"
                  onClick={() => {
                    void unlockSound();
                  }}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {NOTIFICATION_COPY.soundUnlock}
                </Button>
              }
            >
              {NOTIFICATION_COPY.soundBlocked}
            </Alert>
          )}
          {unsupported && (
            <Alert data-testid="notifications-sound-unsupported" severity="info" sx={{ mt: 1.5 }}>
              {NOTIFICATION_COPY.soundUnsupported}
            </Alert>
          )}
        </Box>
      )}

      {browserAvailable && <NotificationPermissionCard />}

      {!soundAvailable && !browserAvailable && (
        <Typography data-testid="notifications-settings-empty" sx={{ mt: 2 }} color="text.secondary">
          {NOTIFICATION_COPY.settingsEmpty}
        </Typography>
      )}
    </Box>
  );
}
