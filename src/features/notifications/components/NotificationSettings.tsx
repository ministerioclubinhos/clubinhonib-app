import { Alert, Box, Button, CircularProgress, Switch } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import { NOTIFICATION_COPY, NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import { useEmailPreferences } from '../hooks/useEmailPreferences';
import { useNotificationCenter } from './NotificationContext';
import { NotificationPermissionCard } from './NotificationPermissionCard';
import { NotificationSettingRow, NotificationSettingsSection } from './NotificationSettingRow';

/**
 * Configurações de notificação. "Por e-mail" vale para a conta (servidor);
 * "Neste aparelho" vale só para este navegador.
 */
export function NotificationSettings() {
  const {
    userId,
    soundAvailable,
    browserAvailable,
    preferences,
    soundBlocked,
    setSoundEnabled,
    unlockSound,
  } = useNotificationCenter();
  const email = useEmailPreferences(userId);
  const emailLoading = email.query.isPending && email.query.fetchStatus !== 'idle';

  return (
    <Box data-testid="notifications-settings" sx={{ p: 2 }}>
      <NotificationSettingsSection
        title={NOTIFICATION_COPY.emailSection}
        data-testid="notifications-email-section"
      >
        <NotificationSettingRow
          data-testid="notifications-email-card"
          icon={<MailOutlineIcon />}
          titleId="notifications-email-label"
          title={NOTIFICATION_COPY.emailLabel}
          description={NOTIFICATION_COPY.emailHelp}
          control={
            emailLoading ? (
              <Box
                sx={{
                  width: 58,
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: NOTIFICATIONS_TOUCH_TARGET,
                  alignItems: 'center',
                }}
              >
                <CircularProgress size={20} aria-label={NOTIFICATION_COPY.emailLoading} />
              </Box>
            ) : (
              <Switch
                data-testid="notifications-email-toggle"
                checked={email.query.data?.noticesEnabled ?? false}
                disabled={!email.query.data || email.update.isPending}
                onChange={(event) => email.update.mutate(event.target.checked)}
                slotProps={{ input: { 'aria-labelledby': 'notifications-email-label' } }}
              />
            )
          }
        >
          {email.query.isError && (
            <Alert
              data-testid="notifications-email-load-error"
              severity="error"
              sx={{ mt: 1 }}
              action={
                <Button
                  color="inherit"
                  onClick={() => void email.query.refetch()}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {NOTIFICATION_COPY.retry}
                </Button>
              }
            >
              {NOTIFICATION_COPY.emailLoadError}
            </Alert>
          )}
          {email.update.isError && (
            <Alert data-testid="notifications-email-save-error" severity="error" sx={{ mt: 1 }}>
              {NOTIFICATION_COPY.emailSaveError}
            </Alert>
          )}
        </NotificationSettingRow>
      </NotificationSettingsSection>

      {(soundAvailable || browserAvailable) && (
        <NotificationSettingsSection
          title={NOTIFICATION_COPY.deviceSection}
          help={NOTIFICATION_COPY.deviceHelp}
          data-testid="notifications-device-section"
        >
          {soundAvailable && (
            <NotificationSettingRow
              data-testid="notifications-sound-card"
              icon={<VolumeUpOutlinedIcon />}
              titleId="notifications-sound-label"
              title={NOTIFICATION_COPY.soundLabel}
              description={NOTIFICATION_COPY.soundHelp}
              control={
                <Switch
                  data-testid="notifications-sound-toggle"
                  checked={preferences.soundEnabled}
                  onChange={(event) => {
                    void setSoundEnabled(event.target.checked);
                  }}
                  slotProps={{ input: { 'aria-labelledby': 'notifications-sound-label' } }}
                />
              }
            >
              {preferences.soundEnabled && soundBlocked && (
                <Alert
                  data-testid="notifications-sound-blocked"
                  severity="warning"
                  sx={{ mt: 1 }}
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
            </NotificationSettingRow>
          )}
          {browserAvailable && <NotificationPermissionCard />}
        </NotificationSettingsSection>
      )}
    </Box>
  );
}
