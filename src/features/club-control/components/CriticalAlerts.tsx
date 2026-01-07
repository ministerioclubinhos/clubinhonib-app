import React from 'react';
import { Box, Alert, AlertTitle, Typography, Chip, Stack, useTheme } from '@mui/material';
import { Cancel } from '@mui/icons-material';

interface CriticalAlert {
  clubId: string;
  clubNumber: number;
  message: string;
  missingChildren: number;
}

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ alerts }) => {
  const theme = useTheme();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          severity="error"
          icon={<Cancel fontSize="large" />}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: `2px solid ${theme.palette.error.main}`,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                🔴 CRÍTICO - Clubinho #{alert.clubNumber}
              </AlertTitle>
              <Typography variant="body1">{alert.message}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>{alert.missingChildren}</strong> crianças sem pagela esta semana
              </Typography>
            </Box>
            <Chip
              label="URGENTE"
              color="error"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
            />
          </Stack>
        </Alert>
      ))}
    </Box>
  );
};
