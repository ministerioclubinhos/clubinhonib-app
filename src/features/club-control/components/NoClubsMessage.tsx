import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Info,
  CalendarToday,
} from '@mui/icons-material';
import { WeekCheckResult } from '../api';

interface NoClubsMessageProps {
  data: WeekCheckResult;
}

export const NoClubsMessage: React.FC<NoClubsMessageProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        border: `2px solid ${theme.palette.warning.main}40`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ff9800, #ffb74d)',
        },
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)',
          }}
        >
          <Info sx={{ fontSize: 40, color: theme.palette.warning.main }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1.5, color: 'warning.dark' }}>
            ℹ️ Informação Importante
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
            {data.note}
          </Typography>
          {data.period && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'white',
                border: `1px solid ${theme.palette.warning.main}30`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarToday sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                    Período Letivo Cadastrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(data.period.startDate).toLocaleDateString('pt-BR')} a {new Date(data.period.endDate).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

