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
  Typography,
} from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { StatisticsProvider, useStatistics } from './context';
import { DashboardHeader, NavigationTabs } from './components/dashboard';
import { KPIDashboard, SmartFilters } from './components/ui';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { queryClient } from '../../config/queryClient';

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

// Loading skeleton for tabs
const TabSkeleton: React.FC = () => (
  <Box data-testid="statistics-statistics-page-tab-skeleton" sx={{ display: 'grid', gap: 2 }}>
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
    <Zoom data-testid="statistics-statistics-page-scroll-to-top" in={visible}>
      <Fab
        color="primary"
        size="small"
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
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
    <Paper data-testid="statistics-statistics-page-tab-content"
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

// Main content component
const StatisticsContent: React.FC = memo(() => {
  const theme = useTheme();

  return (
    <Box data-testid="statistics-statistics-page-statistics-content"
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
        <DashboardHeader onRefresh={() => queryClient.invalidateQueries()} />

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
    </Box>
  );
});

StatisticsContent.displayName = 'StatisticsContent';

// Main page component with providers
const StatisticsPage: React.FC = () => {
  return (
    <QueryClientProvider data-testid="statistics-statistics-page" client={queryClient}>
      <StatisticsProvider>
        <StatisticsContent />
      </StatisticsProvider>
    </QueryClientProvider>
  );
};

export default StatisticsPage;
