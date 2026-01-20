import React, { Suspense, memo } from 'react';
import {
  Box,
  Container,
  Skeleton,
  useTheme,
  alpha,
  Paper,
  Fab,
  Zoom,
  useMediaQuery,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import {
  KeyboardArrowUp,
  Close,
  Settings,
} from '@mui/icons-material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { StatisticsProvider, useStatistics } from './context';
import { DashboardHeader, NavigationTabs } from './components/dashboard';
import { KPIDashboard, SmartFilters } from './components/ui';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

// Lazy loaded tabs
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const ChildrenTab = React.lazy(() => import('./tabs/ChildrenTab'));
const FrequencyTab = React.lazy(() => import('./tabs/FrequencyTab'));
const ClubsTab = React.lazy(() => import('./tabs/ClubsTab'));
const TeachersTab = React.lazy(() => import('./tabs/TeachersTab'));
const DemographicTab = React.lazy(() => import('./tabs/DemographicTab'));
const GeographicTab = React.lazy(() => import('./tabs/GeographicTab'));
const DecisionsTab = React.lazy(() => import('./tabs/DecisionsTab'));
const RetentionTab = React.lazy(() => import('./tabs/RetentionTab'));
const ActivitiesTab = React.lazy(() => import('./tabs/ActivitiesTab'));
const RankingsTab = React.lazy(() => import('./tabs/RankingsTab'));

// Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  },
});

// Loading skeleton for tabs
const TabSkeleton: React.FC = () => (
  <Box sx={{ display: 'grid', gap: 2 }}>
    <Skeleton variant="rounded" height={80} />
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rounded" height={100} />
      ))}
    </Box>
    <Skeleton variant="rounded" height={350} />
  </Box>
);

// Scroll to top button
const ScrollToTop: React.FC = memo(() => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Fab
        color="primary"
        size="small"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

// Tab content renderer
const TabContent: React.FC = memo(() => {
  const { state } = useStatistics();
  const theme = useTheme();

  const renderTab = () => {
    switch (state.activeTab) {
      case 0:
        return <OverviewTab />;
      case 1:
        return <FrequencyTab />;
      case 2:
        return <ChildrenTab />;
      case 3:
        return <ClubsTab />;
      case 4:
        return <TeachersTab />;
      case 5:
        return <DemographicTab filters={state.filters} />;
      case 6:
        return <GeographicTab filters={state.filters} />;
      case 7:
        return <DecisionsTab filters={state.filters} />;
      case 8:
        return <RetentionTab filters={state.filters} />;
      case 9:
        return <ActivitiesTab filters={state.filters} />;
      case 10:
        return <RankingsTab filters={state.filters} />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        p: { xs: 2, md: 3 },
        minHeight: 400,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state.activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<TabSkeleton />}>
            {renderTab()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Paper>
  );
});

TabContent.displayName = 'TabContent';

// Settings drawer
const SettingsDrawer: React.FC<{ open: boolean; onClose: () => void }> = memo(({ open, onClose }) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Configuracoes
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Configuracoes do dashboard em breve...
      </Typography>
    </Drawer>
  );
});

SettingsDrawer.displayName = 'SettingsDrawer';

// Main content component
const StatisticsContent: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { state } = useStatistics();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        pb: 4,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Header */}
        <DashboardHeader
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {/* KPI Dashboard - Always visible */}
        <Box sx={{ mb: 3 }}>
          <Suspense fallback={<Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />}>
            <KPIDashboard />
          </Suspense>
        </Box>

        {/* Smart Filters */}
        <Box sx={{ mb: 3 }}>
          <SmartFilters />
        </Box>

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Tab Content */}
        <TabContent />

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Ultima atualizacao: {dayjs().format('DD/MM/YYYY HH:mm')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
            Use os filtros para personalizar suas analises
          </Typography>
        </Box>
      </Container>

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Settings drawer */}
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
});

StatisticsContent.displayName = 'StatisticsContent';

// Main page component with providers
const StatisticsPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StatisticsProvider>
        <StatisticsContent />
      </StatisticsProvider>
    </QueryClientProvider>
  );
};

export default StatisticsPage;
