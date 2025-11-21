import React from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, useTheme } from '@mui/material';
import { Dashboard, CalendarMonth, EventBusy, Assessment } from '@mui/icons-material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ControlDashboard, PeriodManagement, ExceptionManagement } from './components';

// Cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ClubControlPageContent: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Principal */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          border: `2px solid ${theme.palette.primary.main}40`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Dashboard sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🎯 Módulo de Controle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de controle e verificação de pagelas por clube - Garantindo que nenhuma criança fique sem ser atendida
            </Typography>
          </Box>
        </Box>

        {/* Tabs de Navegação */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            mt: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          <Tab icon={<Assessment />} iconPosition="start" label="Painel de Controle" />
          <Tab icon={<CalendarMonth />} iconPosition="start" label="Períodos Letivos" />
          <Tab icon={<EventBusy />} iconPosition="start" label="Exceções (Dias sem Clube)" />
        </Tabs>
      </Paper>

      {/* Conteúdo das Tabs */}
      <TabPanel value={tabValue} index={0}>
        <ControlDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PeriodManagement />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ExceptionManagement />
      </TabPanel>
    </Container>
  );
};

// Componente principal com QueryClientProvider
const ClubControlPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ClubControlPageContent />
    </QueryClientProvider>
  );
};

export default ClubControlPage;

