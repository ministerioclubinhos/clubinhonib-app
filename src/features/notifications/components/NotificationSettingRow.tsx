import { Box, Typography } from '@mui/material';
import { NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import type { NotificationSettingRowProps, NotificationSettingsSectionProps } from './types';

/** Grupo de opções com título, no estilo de lista de ajustes do celular. */
export function NotificationSettingsSection({
  title,
  help,
  children,
  'data-testid': testId,
}: NotificationSettingsSectionProps) {
  return (
    <Box component="section" data-testid={testId} sx={{ mb: 2.5 }}>
      <Typography
        component="h3"
        sx={{
          px: 0.5,
          mb: 0.75,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          '& > * + *': { borderTop: 1, borderColor: 'divider' },
        }}
      >
        {children}
      </Box>
      {help && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 0.5, mt: 0.75 }}>
          {help}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Uma opção: ícone, título, explicação curta e a chave à direita. Mobile
 * first: a linha inteira tem altura de toque e o texto quebra sem empurrar a
 * chave para fora.
 */
export function NotificationSettingRow({
  icon,
  titleId,
  title,
  description,
  control,
  children,
  'data-testid': testId,
}: NotificationSettingRowProps) {
  return (
    <Box data-testid={testId} sx={{ px: 1.5, py: 1.25 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: NOTIFICATIONS_TOUCH_TARGET,
        }}
      >
        <Box aria-hidden="true" sx={{ display: 'flex', color: 'primary.main', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.35 }}>
            {description}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0 }}>{control}</Box>
      </Box>
      {children}
    </Box>
  );
}
