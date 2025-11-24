import React, { Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Collapse,
  Skeleton,
  Grid,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatisticsFiltersComponent, QuickFilters } from './components';
import { StatisticsFilters } from './api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// Configurar locale globalmente
dayjs.locale('pt-br');

// Lazy-load dedicated tab components
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const FrequencyTab = React.lazy(() => import('./tabs/FrequencyTab'));
const ChildrenTab = React.lazy(() => import('./tabs/ChildrenTab'));
const ClubsTab = React.lazy(() => import('./tabs/ClubsTab'));
const TeachersTab = React.lazy(() => import('./tabs/TeachersTab'));
const DemographicTab = React.lazy(() => import('./tabs/DemographicTab'));
const GeographicTab = React.lazy(() => import('./tabs/GeographicTab'));
const DecisionsTab = React.lazy(() => import('./tabs/DecisionsTab'));
const RetentionTab = React.lazy(() => import('./tabs/RetentionTab'));
const ActivitiesTab = React.lazy(() => import('./tabs/ActivitiesTab'));
const RankingsTab = React.lazy(() => import('./tabs/RankingsTab'));
const OverviewSummaryCards = React.lazy(() =>
  import('./components').then((m) => ({ default: m.OverviewSummaryCards }))
);

// Criar um cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const StatisticsPageContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = Number(searchParams.get('tab') ?? 0);
  const [activeTab, setActiveTab] = React.useState(Number.isNaN(initialTab) ? 0 : initialTab);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  
  // Configurar filtros padrão para o mês atual
  const getDefaultFilters = (): StatisticsFilters => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: dayjs(firstDay).format('YYYY-MM-DD'),
      endDate: dayjs(lastDay).format('YYYY-MM-DD'),
      groupBy: 'week', // Agrupamento semanal para melhor visualização mensal
    };
  };
  
  const [filters, setFilters] = React.useState<StatisticsFilters>(getDefaultFilters());

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    setActiveTab(newValue);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', String(newValue));
      return next;
    });
  };

  const handleFilterChange = (newFilters: StatisticsFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(getDefaultFilters());
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          📊 Estatísticas do Clubinho NIB
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Análise completa de dados, insights e relatórios
          {filters.startDate && filters.endDate && (
            <> - {dayjs(filters.startDate).format('MMM/YYYY')} a {dayjs(filters.endDate).format('MMM/YYYY')}</>
          )}
        </Typography>
      </Box>

      {/* Overview Cards - lazy */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Suspense fallback={<Skeleton variant="rounded" height={120} />}>
          <OverviewSummaryCards />
        </Suspense>
      </Box>

      {/* Atalhos Rápidos */}
      <QuickFilters onSelectFilter={handleFilterChange} currentFilters={filters} />

      {/* Filtros - colapsáveis (fechados por padrão) */}
      <Box sx={{ mt: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => setFiltersOpen((v) => !v)}
          fullWidth={isMobile}
        >
          {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </Box>
      <Collapse in={filtersOpen} unmountOnExit>
        <StatisticsFiltersComponent
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </Collapse>

      {/* Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {isMobile ? (
            /* Versão Mobile: 2 Colunas */
            <Box sx={{ p: 1 }}>
              <Grid container spacing={0.5}>
                <Grid item xs={6}>
                  <Tab
                    label="📈 Visão Geral"
                    onClick={() => handleTabChange(null, 0)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 0 ? 600 : 400,
                      color: activeTab === 0 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 0 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="📅 Frequência"
                    onClick={() => handleTabChange(null, 1)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 1 ? 600 : 400,
                      color: activeTab === 1 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 1 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="👶 Crianças"
                    onClick={() => handleTabChange(null, 2)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 2 ? 600 : 400,
                      color: activeTab === 2 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 2 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="🏫 Clubinhos"
                    onClick={() => handleTabChange(null, 3)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 3 ? 600 : 400,
                      color: activeTab === 3 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 3 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="👨‍🏫 Professores"
                    onClick={() => handleTabChange(null, 4)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 4 ? 600 : 400,
                      color: activeTab === 4 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 4 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="👥 Demográfico"
                    onClick={() => handleTabChange(null, 5)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 5 ? 600 : 400,
                      color: activeTab === 5 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 5 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="🗺️ Geográfico"
                    onClick={() => handleTabChange(null, 6)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 6 ? 600 : 400,
                      color: activeTab === 6 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 6 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="✝️ Decisões"
                    onClick={() => handleTabChange(null, 7)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 7 ? 600 : 400,
                      color: activeTab === 7 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 7 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="⏱️ Retenção"
                    onClick={() => handleTabChange(null, 8)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 8 ? 600 : 400,
                      color: activeTab === 8 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 8 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="📊 Atividades"
                    onClick={() => handleTabChange(null, 9)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 9 ? 600 : 400,
                      color: activeTab === 9 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 9 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tab
                    label="🏆 Rankings"
                    onClick={() => handleTabChange(null, 10)}
                    sx={{
                      minHeight: 40,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: activeTab === 10 ? 600 : 400,
                      color: activeTab === 10 ? theme.palette.primary.main : 'inherit',
                      borderBottom: activeTab === 10 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      width: '100%',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            /* Versão Desktop: Tabs Horizontal */
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="tabs de estatísticas"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  minHeight: 48,
                },
              }}
            >
              <Tab label="📈 Visão Geral" />
              <Tab label="📅 Frequência" />
              <Tab label="👶 Crianças" />
              <Tab label="🏫 Clubinhos" />
              <Tab label="👨‍🏫 Professores" />
              <Tab label="👥 Demográfico" />
              <Tab label="🗺️ Geográfico" />
              <Tab label="✝️ Decisões" />
              <Tab label="⏱️ Retenção" />
              <Tab label="📊 Atividades" />
              <Tab label="🏆 Rankings" />
            </Tabs>
          )}
        </Box>

        {/* Tab 1: Visão Geral */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={80} /><Skeleton variant="rounded" height={300} /><Skeleton variant="rounded" height={280} /></Box>}>
              <OverviewTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 2: Frequência */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={300} /><Skeleton variant="rounded" height={300} /></Box>}>
              <FrequencyTab />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 3: Crianças */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={400} />}>
              <ChildrenTab />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 4: Clubinhos */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={400} />}>
              <ClubsTab />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 5: Professores */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={400} />}>
              <TeachersTab />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 6: Demográfico */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={280} /><Skeleton variant="rounded" height={320} /></Box>}>
              <DemographicTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 7: Geográfico */}
        <TabPanel value={activeTab} index={6}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={420} />}>
              <GeographicTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 8: Decisões */}
        <TabPanel value={activeTab} index={7}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={360} />}>
              <DecisionsTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 9: Retenção */}
        <TabPanel value={activeTab} index={8}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={300} /><Skeleton variant="rounded" height={300} /></Box>}>
              <RetentionTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 10: Atividades */}
        <TabPanel value={activeTab} index={9}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Skeleton variant="rounded" height={360} />}>
              <ActivitiesTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>

        {/* Tab 11: Rankings */}
        <TabPanel value={activeTab} index={10}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Suspense fallback={<Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={260} /><Skeleton variant="rounded" height={260} /></Box>}>
              <RankingsTab filters={filters} />
            </Suspense>
          </Box>
        </TabPanel>
      </Paper>

      {/* Footer Info */}
      <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          💡 Use os filtros acima para personalizar suas análises
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          Última atualização: {dayjs().format('DD/MM/YYYY HH:mm')}
        </Typography>
      </Box>
    </Container>
  );
};

// Componente principal com QueryClientProvider
const StatisticsPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StatisticsPageContent />
    </QueryClientProvider>
  );
};

export default StatisticsPage;

