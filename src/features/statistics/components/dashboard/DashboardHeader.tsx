import React, { memo } from 'react';
import {
  alpha,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Refresh, Timeline } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStatistics } from '../../context';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const MotionBox = motion.create(Box);

export const DashboardHeader: React.FC<DashboardHeaderProps> = memo(
  ({ onRefresh }) => {
    const theme = useTheme();
    const { formattedPeriod } = useStatistics();

    return (
      <MotionBox data-testid="statistics-dashboard-dashboard-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              aria-hidden="true"
              sx={{
                width: { xs: 44, sm: 52 },
                height: { xs: 44, sm: 52 },
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <Timeline
                sx={{ color: 'white', fontSize: { xs: 24, sm: 30 } }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h1"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' },
                  lineHeight: 1.2,
                }}
              >
                Central de Estatísticas
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.25 }}
              >
                Indicadores de presença, participação e decisões
              </Typography>
            </Box>
          </Box>
          <Chip
            label={formattedPeriod}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 1.25, fontWeight: 600, maxWidth: '100%' }}
          />
        </Box>

        <Tooltip title="Atualizar todos os dados">
          <IconButton
            onClick={onRefresh}
            aria-label="Atualizar todos os dados"
            sx={{ minWidth: 44, minHeight: 44, flexShrink: 0 }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </MotionBox>
    );
  },
);

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
