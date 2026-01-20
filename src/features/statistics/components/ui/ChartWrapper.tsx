import React, { memo, useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  Skeleton,
  Button,
  ButtonGroup,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  Download,
  Fullscreen,
  FullscreenExit,
  Share,
  Refresh,
  PictureAsPdf,
  Image,
  TableChart,
  Code,
  ShowChart,
  BarChart,
  Timeline,
  PieChart,
  InfoOutlined,
  OpenInNew,
  ZoomIn,
  ZoomOut,
  FitScreen,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

export type ChartVariant = 'line' | 'bar' | 'area' | 'pie' | 'composed' | 'radar';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  height?: number | string;
  minHeight?: number;
  icon?: React.ReactNode;
  color?: string;
  onRefresh?: () => void;
  onExport?: (format: 'png' | 'pdf' | 'csv' | 'json') => void;
  onFullscreen?: () => void;
  chartVariants?: ChartVariant[];
  activeVariant?: ChartVariant;
  onVariantChange?: (variant: ChartVariant) => void;
  actions?: React.ReactNode;
  headerRight?: React.ReactNode;
  badge?: string;
  tooltip?: string;
  exportable?: boolean;
  fullscreenable?: boolean;
  zoomable?: boolean;
}

const chartIcons: Record<ChartVariant, React.ReactNode> = {
  line: <ShowChart />,
  bar: <BarChart />,
  area: <Timeline />,
  pie: <PieChart />,
  composed: <ShowChart />,
  radar: <Timeline />,
};

const MotionBox = motion.create(Box);

export const ChartWrapper: React.FC<ChartWrapperProps> = memo(({
  title,
  subtitle,
  children,
  loading = false,
  error,
  emptyMessage = 'Nenhum dado disponivel para o periodo selecionado',
  isEmpty = false,
  height = 400,
  minHeight = 300,
  icon,
  color,
  onRefresh,
  onExport,
  onFullscreen,
  chartVariants,
  activeVariant,
  onVariantChange,
  actions,
  headerRight,
  badge,
  tooltip,
  exportable = true,
  fullscreenable = true,
  zoomable = false,
}) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const chartColor = color || theme.palette.primary.main;

  const handleExport = useCallback(async (format: 'png' | 'pdf' | 'csv' | 'json') => {
    setMenuAnchor(null);

    if (onExport) {
      onExport(format);
      return;
    }

    // Default PNG export
    if (format === 'png' && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: theme.palette.background.paper,
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
      }
    }
  }, [onExport, theme.palette.background.paper, title]);

  const toggleFullscreen = useCallback(() => {
    if (onFullscreen) {
      onFullscreen();
    } else {
      setIsFullscreen(!isFullscreen);
    }
  }, [onFullscreen, isFullscreen]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 20, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 20, 50));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  // Loading state
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          height: typeof height === 'number' ? height : 'auto',
          minHeight,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={minHeight - 100} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.error.main}`,
          bgcolor: alpha(theme.palette.error.main, 0.02),
          height: typeof height === 'number' ? height : 'auto',
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error" fontWeight={600} gutterBottom>
          Erro ao carregar dados
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        {onRefresh && (
          <Button variant="outlined" color="error" startIcon={<Refresh />} onClick={onRefresh}>
            Tentar novamente
          </Button>
        )}
      </Paper>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          height: typeof height === 'number' ? height : 'auto',
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.text.secondary, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <BarChart sx={{ fontSize: 40, opacity: 0.3 }} />
        </Box>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {emptyMessage}
        </Typography>
        {onRefresh && (
          <Button variant="text" color="primary" startIcon={<Refresh />} onClick={onRefresh}>
            Atualizar
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal,
        bgcolor: theme.palette.background.paper,
        p: 3,
        overflow: 'auto',
      } : undefined}
    >
      <Paper
        elevation={0}
        ref={chartRef}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${alpha(chartColor, 0.02)} 0%, ${theme.palette.background.paper} 100%)`,
          height: isFullscreen ? '100%' : (typeof height === 'number' ? height : 'auto'),
          minHeight: isFullscreen ? undefined : minHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(chartColor, 0.1),
                  color: chartColor,
                  display: 'flex',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
                  {title}
                </Typography>
                {badge && (
                  <Chip label={badge} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                )}
                {tooltip && (
                  <Tooltip title={tooltip}>
                    <InfoOutlined sx={{ fontSize: 16, opacity: 0.5 }} />
                  </Tooltip>
                )}
              </Box>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {headerRight}

            {/* Chart variant buttons */}
            {chartVariants && chartVariants.length > 1 && (
              <ButtonGroup size="small" variant="outlined">
                {chartVariants.map((variant) => (
                  <Tooltip key={variant} title={variant.charAt(0).toUpperCase() + variant.slice(1)}>
                    <Button
                      onClick={() => onVariantChange?.(variant)}
                      variant={activeVariant === variant ? 'contained' : 'outlined'}
                      sx={{ minWidth: 36 }}
                    >
                      {chartIcons[variant]}
                    </Button>
                  </Tooltip>
                ))}
              </ButtonGroup>
            )}

            {/* Zoom controls */}
            {zoomable && (
              <ButtonGroup size="small" variant="outlined">
                <Tooltip title="Diminuir zoom">
                  <Button onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut />
                  </Button>
                </Tooltip>
                <Tooltip title="Resetar zoom">
                  <Button onClick={handleZoomReset}>
                    <FitScreen />
                  </Button>
                </Tooltip>
                <Tooltip title="Aumentar zoom">
                  <Button onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            )}

            {actions}

            {onRefresh && (
              <Tooltip title="Atualizar">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}

            {fullscreenable && (
              <Tooltip title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            )}

            {exportable && (
              <>
                <Tooltip title="Opcoes">
                  <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <MoreVert />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={() => handleExport('png')}>
                    <ListItemIcon><Image fontSize="small" /></ListItemIcon>
                    <ListItemText>Exportar como PNG</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>
                    <ListItemIcon><PictureAsPdf fontSize="small" /></ListItemIcon>
                    <ListItemText>Exportar como PDF</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleExport('csv')}>
                    <ListItemIcon><TableChart fontSize="small" /></ListItemIcon>
                    <ListItemText>Exportar dados (CSV)</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>
                    <ListItemIcon><Code fontSize="small" /></ListItemIcon>
                    <ListItemText>Exportar dados (JSON)</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Chart Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 1, md: 2 },
            overflow: 'hidden',
            transform: zoomable ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top left',
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key="chart-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              sx={{ height: '100%', width: '100%' }}
            >
              {children}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Paper>
    </MotionBox>
  );
});

ChartWrapper.displayName = 'ChartWrapper';

export default ChartWrapper;
