import React from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import { Dashboard, CalendarMonth, EventBusy, Assessment } from '@mui/icons-material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ControlDashboard, PeriodManagement, ExceptionManagement } from './components';

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
      {value === index && <Box sx={{ py: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
};

const ClubControlPageContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
      
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          border: `2px solid ${theme.palette.primary.main}40`,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 1.5, sm: 2 }, 
          mb: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Dashboard sx={{ 
            fontSize: { xs: 28, sm: 36, md: 40 }, 
            color: theme.palette.primary.main,
            flexShrink: 0
          }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                mb: { xs: 0.5, sm: 0 }
              }}
            >
              🎯 Módulo de Controle
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              Sistema de controle e verificação de pagelas por clube - Garantindo que nenhuma criança fique sem ser atendida
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            mt: { xs: 1.5, sm: 2 },
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              minHeight: { xs: 48, sm: 72 },
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTab-iconWrapper': {
              fontSize: { xs: 18, sm: 20, md: 24 },
            },
          }}
        >
          <Tab 
            icon={<Assessment />} 
            iconPosition="start" 
            label={isMobile ? "Painel" : "Painel de Controle"}
            sx={{ 
              '& .MuiTab-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              }
            }}
          />
          <Tab 
            icon={<CalendarMonth />} 
            iconPosition="start" 
            label={isMobile ? "Períodos" : "Períodos Letivos"}
            sx={{ 
              '& .MuiTab-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              }
            }}
          />
          <Tab 
            icon={<EventBusy />} 
            iconPosition="start" 
            label={isMobile ? "Exceções" : "Exceções (Dias sem Clube)"}
            sx={{ 
              '& .MuiTab-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              }
            }}
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ px: { xs: 0, sm: 0 } }}>
          <ControlDashboard />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ px: { xs: 0, sm: 0 } }}>
          <PeriodManagement />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ px: { xs: 0, sm: 0 } }}>
          <ExceptionManagement />
        </Box>
      </TabPanel>
    </Container>
  );
};

const ClubControlPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ClubControlPageContent />
    </QueryClientProvider>
  );
};

export default ClubControlPage;

