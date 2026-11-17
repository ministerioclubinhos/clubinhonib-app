import React from 'react';
import { Box, Button, Paper, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useSearchParams } from 'react-router-dom';
import {
  PAGE_WIDTH,
  PLAIN_PERIOD_OPTIONS,
  STATISTICS_PERIOD_PARAM,
  STATISTICS_QUERY_KEY,
  STATISTICS_TAB_PARAM,
  StatisticsTab,
} from './constants';
import { useStatisticsLastUpdated } from './hooks';
import {
  PLAIN_PERIOD_LABELS,
  STATISTICS_TAB_INTRO,
  STATISTICS_TAB_LABELS,
  STATISTICS_TEXTS,
} from './texts';
import { parsePlainPeriod, parseStatisticsTab } from './utils/plain';
import { ChildrenView } from './views/ChildrenView';
import { ClubsView } from './views/ClubsView';
import { CoordinatorsView } from './views/CoordinatorsView';
import { SummaryView } from './views/SummaryView';
import { TeachersView } from './views/TeachersView';

dayjs.locale('pt-br');

const TAB_ORDER = Object.values(StatisticsTab);

/**
 * Estatísticas para quem não é da área.
 *
 * Cinco visões (resumo, crianças, clubinhos, professores, coordenadores),
 * um único filtro de período e nenhum gráfico que peça legenda. A visão e o
 * período ficam na URL: dá para mandar o link e o voltar do navegador funciona.
 */
const StatisticsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const tab = parseStatisticsTab(params.get(STATISTICS_TAB_PARAM));
  const period = parsePlainPeriod(params.get(STATISTICS_PERIOD_PARAM));
  const updatedAt = useStatisticsLastUpdated();

  const update = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const renderView = () => {
    switch (tab) {
      case StatisticsTab.Children:
        return <ChildrenView period={period} />;
      case StatisticsTab.Clubs:
        return <ClubsView period={period} />;
      case StatisticsTab.Teachers:
        return <TeachersView period={period} />;
      case StatisticsTab.Coordinators:
        return <CoordinatorsView period={period} />;
      case StatisticsTab.Summary:
      default:
        return <SummaryView period={period} onGoToTab={(next) => update(STATISTICS_TAB_PARAM, next)} />;
    }
  };

  return (
    <Box data-testid="statistics-page" sx={{ width: PAGE_WIDTH, mx: 'auto', py: { xs: 2, md: 4 }, pb: 6 }}>
      <Paper
        data-testid="statistics-header"
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          borderRadius: 3,
          color: '#fff',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 900, color: '#fff !important' }}>
            {STATISTICS_TEXTS.title}
          </Typography>
          <Typography sx={{ opacity: 0.92 }}>{STATISTICS_TEXTS.subtitle}</Typography>
        </Box>
        <Button
          data-testid="statistics-refresh"
          onClick={() => void queryClient.invalidateQueries({ queryKey: [STATISTICS_QUERY_KEY] })}
          startIcon={<Refresh />}
          sx={{ minHeight: 44, flexShrink: 0, color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}
        >
          {STATISTICS_TEXTS.refresh}
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="body2" fontWeight={700}>
          {STATISTICS_TEXTS.periodLabel}
        </Typography>
        <ToggleButtonGroup
          data-testid="statistics-period"
          exclusive
          size="small"
          value={period}
          onChange={(_, next: string | null) => next && update(STATISTICS_PERIOD_PARAM, next)}
          aria-label={STATISTICS_TEXTS.periodLabel}
          color="primary"
        >
          {PLAIN_PERIOD_OPTIONS.map((option) => (
            <ToggleButton key={option} value={option} sx={{ minHeight: 44, px: 2, textTransform: 'none' }}>
              {PLAIN_PERIOD_LABELS[option]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Tabs
        data-testid="statistics-tabs"
        value={tab}
        onChange={(_, next: StatisticsTab) => update(STATISTICS_TAB_PARAM, next)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Visões das estatísticas"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5, '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' } }}
      >
        {TAB_ORDER.map((value) => (
          <Tab
            key={value}
            value={value}
            label={STATISTICS_TAB_LABELS[value]}
            data-testid={`statistics-tab-${value}`}
            sx={{ minHeight: 48, minWidth: 0, px: 2, fontWeight: 800, textTransform: 'none', '&.Mui-selected': { bgcolor: 'action.hover', borderRadius: '8px 8px 0 0' } }}
          />
        ))}
      </Tabs>

      <Typography data-testid="statistics-tab-intro" color="text.secondary" sx={{ mb: 2 }}>
        {STATISTICS_TAB_INTRO[tab]}
      </Typography>

      {renderView()}

      <Typography
        data-testid="statistics-last-updated"
        variant="body2"
        color="text.secondary"
        sx={{ mt: 3, textAlign: 'center' }}
      >
        {updatedAt
          ? STATISTICS_TEXTS.updatedAt(dayjs(updatedAt).format('DD/MM/YYYY HH:mm'))
          : STATISTICS_TEXTS.loadingData}
      </Typography>
    </Box>
  );
};

export default StatisticsPage;
