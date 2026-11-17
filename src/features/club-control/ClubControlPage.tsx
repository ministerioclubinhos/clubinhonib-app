import React from 'react';
import { PAGE_WIDTH } from './constants';
import { Box, Button, Container, Paper, Typography, useTheme } from '@mui/material';
import { EventBusy } from '@mui/icons-material';
import { QueryClientProvider } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { ControlDashboard } from './components';
import { queryClient } from '../../config/queryClient';
import { CLUB_CONTROL_TEXTS } from './constants';

/**
 * Controle de pagelas: só a conferência da semana. O período letivo e os dias
 * sem clubinho têm tela própria (`/adm/periodo-letivo`) — o controle só aponta
 * para lá.
 */
const ClubControlPageContent: React.FC = () => {
  const theme = useTheme();

  return (
    <Container
      data-testid="club-control-club-control-page-club-control-page-content"
      maxWidth={false}
      sx={{ py: { xs: 2, sm: 4 }, px: 0, width: PAGE_WIDTH }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          mb: { xs: 1.5, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          border: `1px solid ${theme.palette.primary.main}40`,
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}>
            {CLUB_CONTROL_TEXTS.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {CLUB_CONTROL_TEXTS.intro}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/adm/periodo-letivo"
          variant="outlined"
          startIcon={<EventBusy />}
          data-testid="club-control-go-to-calendar"
          sx={{ minHeight: 44, fontWeight: 700, flexShrink: 0 }}
        >
          {CLUB_CONTROL_TEXTS.calendarLink}
        </Button>
      </Paper>

      <ControlDashboard />
    </Container>
  );
};

const ClubControlPage: React.FC = () => (
  <QueryClientProvider data-testid="club-control-club-control-page" client={queryClient}>
    <ClubControlPageContent />
  </QueryClientProvider>
);

export default ClubControlPage;
