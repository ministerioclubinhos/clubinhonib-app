import React, { memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
  OpenInNew,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export interface StatCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
  compact?: boolean;
  variant?: 'default' | 'gradient' | 'outlined' | 'glass';
  showTrend?: boolean;
  invertTrend?: boolean;
  formatValue?: (value: number | string) => string;
  subtitle?: string;
  badge?: string;
  sparkline?: number[];
}

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

const formatNumber = (value: number | string, formatter?: (v: number | string) => string): string => {
  if (formatter) return formatter(value);
  if (typeof value === 'string') return value;

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('pt-BR');
};

const getTrend = (current: number | string, previous?: number, invert = false) => {
  if (previous === undefined || typeof current === 'string') return null;

  const change = ((current - previous) / previous) * 100;
  const isPositive = invert ? change < 0 : change > 0;

  if (Math.abs(change) < 1) {
    return { type: 'flat' as const, value: 0, icon: TrendingFlat, color: 'text.secondary' };
  }

  return {
    type: isPositive ? 'up' as const : 'down' as const,
    value: Math.abs(change),
    icon: change > 0 ? TrendingUp : TrendingDown,
    color: isPositive ? 'success.main' : 'error.main',
  };
};

const MiniSparkline: React.FC<{ data: number[]; color: string }> = memo(({ data, color }) => {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

MiniSparkline.displayName = 'MiniSparkline';

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  previousValue,
  suffix,
  prefix,
  icon,
  color,
  loading = false,
  tooltip,
  onClick,
  compact = false,
  variant = 'default',
  showTrend = true,
  invertTrend = false,
  formatValue,
  subtitle,
  badge,
  sparkline,
}) => {
  const theme = useTheme();
  const cardColor = color || theme.palette.primary.main;
  const trend = showTrend ? getTrend(value, previousValue, invertTrend) : null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${cardColor} 0%, ${alpha(cardColor, 0.7)} 100%)`,
          color: theme.palette.getContrastText(cardColor),
          border: 'none',
        };
      case 'glass':
        return {
          background: alpha(cardColor, 0.08),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(cardColor, 0.2)}`,
        };
      case 'outlined':
        return {
          background: 'transparent',
          border: `2px solid ${alpha(cardColor, 0.3)}`,
        };
      default:
        return {
          background: alpha(cardColor, 0.04),
          border: `1px solid ${alpha(cardColor, 0.12)}`,
        };
    }
  };

  const isGradient = variant === 'gradient';
  const variantStyles = getVariantStyles();

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: compact ? { xs: 0.75, sm: 1.25 } : 2.5,
          borderRadius: 3,
          height: '100%',
          ...variantStyles,
        }}
      >
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
        {!compact && <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />}
      </Paper>
    );
  }

  return (
    <MotionPaper
      elevation={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.02, y: -4 } : undefined}
      onClick={onClick}
      sx={{
        p: compact ? { xs: 0.75, sm: 1.25 } : 2.5,
        borderRadius: 3,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...variantStyles,
        '&:hover': onClick ? {
          boxShadow: `0 8px 32px ${alpha(cardColor, 0.25)}`,
        } : undefined,
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: isGradient
            ? alpha(theme.palette.common.white, 0.1)
            : `radial-gradient(circle, ${alpha(cardColor, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
          display: compact ? 'none' : 'block',
        }}
      />

      {/* Badge */}
      {badge && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: isGradient ? alpha(theme.palette.common.white, 0.2) : alpha(cardColor, 0.15),
            color: isGradient ? 'inherit' : cardColor,
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
            {badge}
          </Typography>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: compact ? 0 : 1.5, position: 'relative', zIndex: 1, pr: compact ? 3 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap={compact}
            sx={{
              color: isGradient ? 'inherit' : 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: compact ? '0.6rem' : '0.7rem',
              opacity: isGradient ? 0.9 : 1,
              width: '100%',
            }}
          >
            {title}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <InfoOutlined sx={{ fontSize: 14, opacity: 0.5 }} />
            </Tooltip>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              p: compact ? 0 : 1,
              ml: compact ? 1 : 0,
              borderRadius: 2,
              bgcolor: compact ? 'transparent !important' : (isGradient ? alpha(theme.palette.common.white, 0.15) : alpha(cardColor, 0.12)),
              color: isGradient ? 'inherit' : cardColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: compact ? 'auto' : undefined,
              position: compact ? 'absolute' : 'relative',
              top: compact ? 0 : undefined,
              right: compact ? 0 : undefined,
              '& svg': { fontSize: compact ? { xs: 16, sm: 18 } : 24 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {/* Value */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        {prefix && (
          <Typography
            variant={compact ? 'body1' : 'h6'}
            sx={{ opacity: 0.7, fontWeight: 500 }}
          >
            {prefix}
          </Typography>
        )}
        <AnimatePresence mode="wait">
          <MotionBox
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Typography
              variant={compact ? 'h5' : 'h4'}
              fontWeight="bold"
              sx={{
                color: isGradient ? 'inherit' : cardColor,
                lineHeight: 1,
                fontSize: compact ? { xs: '1.25rem', sm: '1.5rem' } : undefined,
              }}
            >
              {formatNumber(value, formatValue)}
            </Typography>
          </MotionBox>
        </AnimatePresence>
        {suffix && (
          <Typography
            variant={compact ? 'body2' : 'body1'}
            sx={{ opacity: 0.7, fontWeight: 500, ml: 0.5 }}
          >
            {suffix}
          </Typography>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: isGradient ? alpha(theme.palette.common.white, 0.8) : 'text.secondary',
            display: 'block',
            mt: compact ? 0 : 0.5,
            lineHeight: 1.1,
            fontSize: compact ? '0.65rem' : '0.75rem',
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Footer with trend and sparkline */}
      {(trend || sparkline) && !compact && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: isGradient
                  ? alpha(theme.palette.common.white, 0.15)
                  : alpha(
                    trend.type === 'up'
                      ? theme.palette.success.main
                      : trend.type === 'down'
                        ? theme.palette.error.main
                        : theme.palette.grey[500],
                    0.1
                  ),
              }}
            >
              <trend.icon sx={{
                fontSize: 16,
                color: isGradient ? 'inherit' : trend.color,
              }} />
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: isGradient ? 'inherit' : trend.color }}
              >
                {trend.type === 'flat' ? 'Estável' : `${trend.value.toFixed(1)}%`}
              </Typography>
            </Box>
          )}

          {sparkline && sparkline.length > 0 && (
            <MiniSparkline data={sparkline} color={isGradient ? theme.palette.common.white : cardColor} />
          )}
        </Box>
      )}

      {/* Click indicator */}
      {onClick && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            opacity: 0.5,
          }}
        >
          <OpenInNew sx={{ fontSize: 16 }} />
        </Box>
      )}
    </MotionPaper>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
