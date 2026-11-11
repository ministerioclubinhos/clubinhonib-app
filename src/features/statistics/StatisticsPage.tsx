import React, { Suspense, memo } from 'react';
import {
  Box,
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
import { PAGE_WIDTH, STATISTICS_QUERY_KEY, StatisticsTab } from './constants';
import { useStatisticsLastUpdated } from './hooks';
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
    {/* Duas colunas no celular, quatro a partir do tablet: quatro esqueletos
        lado a lado num aparelho de 390px viram quatro tiras ilegíveis. */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
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
    window.addEventListener('scroll', handleScroll, { passive: true });
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
      case StatisticsTab.Overview:
        return <OverviewTab />;
      case StatisticsTab.Frequency:
        return <FrequencyTab />;
      case StatisticsTab.Children:
        return <ChildrenTab />;
      case StatisticsTab.Clubs:
        return <ClubsTab />;
      case StatisticsTab.Teachers:
        return <TeachersTab />;
      case StatisticsTab.Demographic:
        return <DemographicTab filters={state.filters} />;
      case StatisticsTab.Geographic:
        return <GeographicTab filters={state.filters} />;
      case StatisticsTab.Decisions:
        return <DecisionsTab filters={state.filters} />;
      case StatisticsTab.Retention:
        return <RetentionTab filters={state.filters} />;
      case StatisticsTab.Activities:
        return <ActivitiesTab filters={state.filters} />;
      case StatisticsTab.Rankings:
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

/**
 * Quando os números da tela foram buscados de fato.
 *
 * Antes o rodapé imprimia `dayjs()` — a hora do render. Com cache de minutos,
 * a tela afirmava que o dado era deste segundo enquanto mostrava um número de
 * dez minutos atrás. Agora a hora vem do próprio cache, e some quando ainda
 * não há resposta nenhuma.
 */
const LastUpdatedLabel: React.FC = memo(() => {
  const updatedAt = useStatisticsLastUpdated();

  return (
    <Typography data-testid="statistics-last-updated" variant="body2" color="text.secondary">
      {updatedAt
        ? `Dados de ${dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}`
        : 'Carregando os dados…'}
    </Typography>
  );
});

LastUpdatedLabel.displayName = 'LastUpdatedLabel';

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
      <Box
        sx={{
          width: PAGE_WIDTH,
          mx: 'auto',
          py: { xs: 2, md: 4 },
        }}
      >
        {/* Header */}
        {/*
          Só as chaves das estatísticas. O `queryClient` é o compartilhado do
          app: sem o prefixo, "Atualizar" derrubava também o controle de
          clubinhos, as pagelas e o resumo semanal.
        */}
        <DashboardHeader
          onRefresh={() =>
            void queryClient.invalidateQueries({ queryKey: [STATISTICS_QUERY_KEY] })
          }
        />

        {/*
          O recorte vem antes de qualquer número. Ele rege os gráficos e as
          onze abas, e ficava embaixo dos KPIs: a leitura natural era de cima
          para baixo, o que fazia o filtro parecer um detalhe de uma seção.

          Os KPIs logo abaixo são a exceção: vêm de `/statistics/overview`,
          que não recebe filtro nenhum (janelas fixas: esta semana, este mês,
          este ano). O próprio bloco avisa isso — ver
          `KPI_FIXED_WINDOW_CAPTION`.
        */}
        <Box sx={{ mb: 3 }}>
          <SmartFilters />
        </Box>

        {/* Visão geral em janelas fixas: não segue o recorte acima. */}
        <Box sx={{ mb: 3 }}>
          <Suspense fallback={<Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />}>
            <KPIDashboard />
          </Suspense>
        </Box>

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Tab Content */}
        <TabContent />

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <LastUpdatedLabel />
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
            Use os filtros para personalizar suas análises
          </Typography>
        </Box>
      </Box>

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
