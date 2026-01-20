
import React, { memo, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Paper,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  Refresh,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useKPIData } from '../dashboard/useKPIData';
import { KPICategorySelector } from '../dashboard/KPICategorySelector';
import { KPICardsGrid } from '../dashboard/KPICardsGrid';
import { EngagementProgressBar } from '../dashboard/EngagementProgressBar';

export const KPIDashboard: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(true);

  const {
    categories,
    activeCategory,
    setActiveCategory,
    activeKPIs,
    activeColor,
    isLoading,
    refetchOverview,
    engagementRate,
    overview,
  } = useKPIData();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha(activeColor, 0.02)} 0%, ${theme.palette.background.paper} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 1.5, md: 3 },
          py: { xs: 1, md: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(activeColor, 0.03),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(activeColor, 0.1),
              color: activeColor,
              display: 'flex',
            }}
          >
            <Timeline />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Dashboard de KPIs
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Indicadores-chave de desempenho
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Atualizar dados">
            <IconButton size="small" onClick={() => refetchOverview()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <KPICategorySelector
          categories={categories}
          activeCategory={activeCategory}
          activeColor={activeColor}
          isMobile={isMobile}
          onCategoryChange={setActiveCategory}
        />

        <KPICardsGrid
          activeKPIs={activeKPIs}
          isLoading={isLoading}
          isMobile={isMobile}
          activeCategory={activeCategory}
        />

        <EngagementProgressBar
          engagementRate={engagementRate}
          activeChildren={overview?.summary.activeChildrenThisMonth || 0}
          totalChildren={overview?.summary.totalChildren || 0}
          isLoading={isLoading}
        />
      </Collapse>
    </Paper>
  );
});

KPIDashboard.displayName = 'KPIDashboard';

export default KPIDashboard;
