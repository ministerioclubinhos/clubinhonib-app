import React, { memo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
  useMediaQuery,
  Chip,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  DateRange,
  ChildCare,
  Groups,
  School,
  PieChart,
  Map,
  Favorite,
  ShowChart,
  CompareArrows,
  EmojiEvents,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatistics } from '../../context';

interface TabConfig {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

const tabs: TabConfig[] = [
  { id: 0, label: 'Visao Geral', shortLabel: 'Visao', icon: <Dashboard />, color: '#6366f1' },
  { id: 1, label: 'Frequencia', shortLabel: 'Freq.', icon: <DateRange />, color: '#10b981' },
  { id: 2, label: 'Criancas', shortLabel: 'Criancas', icon: <ChildCare />, color: '#f59e0b' },
  { id: 3, label: 'Clubinhos', shortLabel: 'Clubes', icon: <Groups />, color: '#8b5cf6' },
  { id: 4, label: 'Professores', shortLabel: 'Profs.', icon: <School />, color: '#ec4899' },
  { id: 5, label: 'Demografico', shortLabel: 'Demo.', icon: <PieChart />, color: '#14b8a6' },
  { id: 6, label: 'Geografico', shortLabel: 'Geo.', icon: <Map />, color: '#f43f5e' },
  { id: 7, label: 'Decisoes', shortLabel: 'Decisoes', icon: <Favorite />, color: '#ef4444' },
  { id: 8, label: 'Retencao', shortLabel: 'Ret.', icon: <ShowChart />, color: '#84cc16' },
  { id: 9, label: 'Atividades', shortLabel: 'Ativ.', icon: <CompareArrows />, color: '#06b6d4' },
  { id: 10, label: 'Rankings', shortLabel: 'Rank', icon: <EmojiEvents />, color: '#a855f7' },
];

const MotionBox = motion.create(Box);

export const NavigationTabs: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { state, setTab } = useStatistics();

  const activeTab = tabs.find((t) => t.id === state.activeTab) || tabs[0];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  // Mobile grid layout
  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.5,
            p: 1,
          }}
        >
          {tabs.map((tab) => {
            const isActive = state.activeTab === tab.id;
            return (
              <motion.div
                key={tab.id}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  onClick={() => setTab(tab.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: isActive ? alpha(tab.color, 0.1) : 'transparent',
                    color: isActive ? tab.color : 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(tab.color, 0.05),
                    },
                  }}
                >
                  {tab.badge && (
                    <Chip
                      label={tab.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        height: 16,
                        fontSize: '0.6rem',
                        bgcolor: tab.color,
                        color: 'white',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      '& svg': {
                        fontSize: 20,
                        color: isActive ? tab.color : 'inherit',
                      },
                    }}
                  >
                    {tab.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.25,
                      fontSize: '0.6rem',
                      fontWeight: isActive ? 700 : 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {tab.shortLabel}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Active tab indicator */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: alpha(activeTab.color, 0.05),
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ color: activeTab.color }}>{activeTab.icon}</Box>
          <Typography variant="subtitle2" fontWeight={700} color={activeTab.color}>
            {activeTab.label}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Desktop tabs
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        mb: 3,
        background: `linear-gradient(180deg, ${alpha(activeTab.color, 0.02)} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Tabs
        value={state.activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: activeTab.color,
          },
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
          },
        }}
      >
        {tabs.map((tab) => {
          const isActive = state.activeTab === tab.id;
          return (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={
                <Box sx={{ position: 'relative' }}>
                  {tab.badge && (
                    <Chip
                      label={tab.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -16,
                        height: 16,
                        fontSize: '0.55rem',
                        bgcolor: tab.color,
                        color: 'white',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      '& svg': {
                        color: isActive ? tab.color : 'text.secondary',
                        transition: 'color 0.2s',
                      },
                    }}
                  >
                    {tab.icon}
                  </Box>
                </Box>
              }
              iconPosition="start"
              label={isTablet ? tab.shortLabel : tab.label}
              sx={{
                textTransform: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: isTablet ? '0.75rem' : '0.875rem',
                minHeight: 56,
                color: isActive ? tab.color : 'text.secondary',
                transition: 'all 0.2s',
                '&:hover': {
                  color: tab.color,
                  bgcolor: alpha(tab.color, 0.05),
                },
              }}
            />
          );
        })}
      </Tabs>
    </Paper>
  );
});

NavigationTabs.displayName = 'NavigationTabs';

export default NavigationTabs;
