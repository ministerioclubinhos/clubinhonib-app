import React, { memo } from 'react';
import { alpha, Box, Paper, Tab, Tabs, useTheme } from '@mui/material';
import {
  ChildCare,
  CompareArrows,
  Dashboard,
  DateRange,
  EmojiEvents,
  Favorite,
  Groups,
  Map,
  PieChart,
  School,
  ShowChart,
} from '@mui/icons-material';
import { useStatistics } from '../../context';

const tabs = [
  { id: 0, label: 'Visão geral', icon: <Dashboard />, color: '#6366f1' },
  { id: 1, label: 'Frequência', icon: <DateRange />, color: '#10b981' },
  { id: 2, label: 'Crianças', icon: <ChildCare />, color: '#f59e0b' },
  { id: 3, label: 'Clubinhos', icon: <Groups />, color: '#8b5cf6' },
  { id: 4, label: 'Professores', icon: <School />, color: '#ec4899' },
  { id: 5, label: 'Demográfico', icon: <PieChart />, color: '#14b8a6' },
  { id: 6, label: 'Geográfico', icon: <Map />, color: '#f43f5e' },
  { id: 7, label: 'Decisões', icon: <Favorite />, color: '#ef4444' },
  { id: 8, label: 'Retenção', icon: <ShowChart />, color: '#84cc16' },
  { id: 9, label: 'Atividades', icon: <CompareArrows />, color: '#06b6d4' },
  { id: 10, label: 'Rankings', icon: <EmojiEvents />, color: '#a855f7' },
] as const;

export const NavigationTabs: React.FC = memo(() => {
  const theme = useTheme();
  const { state, setTab } = useStatistics();
  const activeTab = tabs.find((tab) => tab.id === state.activeTab) ?? tabs[0];

  return (
    <Paper data-testid="statistics-dashboard-navigation-tabs"
      elevation={0}
      sx={{
        mb: { xs: 2, md: 3 },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2.5,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha(activeTab.color, 0.04)}, ${theme.palette.background.paper})`,
      }}
    >
      <Tabs
        value={state.activeTab}
        onChange={(_, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Seções das estatísticas"
        sx={{
          minHeight: 52,
          '& .MuiTabs-indicator': {
            height: 3,
            bgcolor: activeTab.color,
          },
          '& .MuiTabs-scrollButtons': {
            width: 44,
            opacity: 1,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            icon={<Box sx={{ '& svg': { fontSize: 21 } }}>{tab.icon}</Box>}
            iconPosition="start"
            label={tab.label}
            aria-label={tab.label}
            sx={{
              minHeight: 52,
              minWidth: { xs: 112, sm: 132 },
              px: 1.5,
              textTransform: 'none',
              fontSize: { xs: '0.78rem', sm: '0.875rem' },
              fontWeight: state.activeTab === tab.id ? 700 : 500,
              color: state.activeTab === tab.id ? tab.color : 'text.secondary',
              '&:hover': {
                color: tab.color,
                bgcolor: alpha(tab.color, 0.06),
              },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
});

NavigationTabs.displayName = 'NavigationTabs';

export default NavigationTabs;
