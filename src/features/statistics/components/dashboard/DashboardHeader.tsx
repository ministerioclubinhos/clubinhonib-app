import React, { memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  useTheme,
  alpha,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications,
  Settings,
  Refresh,
  Help,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  DarkMode,
  LightMode,
  MoreVert,
  Timeline,
  CompareArrows,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useStatistics } from '../../context';

interface DashboardHeaderProps {
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onRefresh?: () => void;
}

const MotionBox = motion.create(Box);

export const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({
  onSettingsClick,
  onHelpClick,
  onRefresh,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, toggleCompareMode, unreadNotifications, formattedPeriod } = useStatistics();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: { xs: 2, md: 4 },
      }}
    >
      {/* Left side - Title and subtitle */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          >
            <Timeline sx={{ color: 'white', fontSize: { xs: 24, md: 32 } }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                lineHeight: 1.2,
              }}
            >
              Central de Estatisticas
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Analise completa de dados, insights e relatorios
            </Typography>
          </Box>
        </Box>

        {/* Period badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Chip
            label={formattedPeriod}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" color="text.secondary">
            Atualizado {dayjs().format('DD/MM/YYYY HH:mm')}
          </Typography>
        </Box>
      </Box>

      {/* Right side - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Compare mode toggle */}
        {!isMobile && (
          <Tooltip title={state.compareMode ? 'Desativar comparacao' : 'Ativar comparacao'}>
            <Button
              variant={state.compareMode ? 'contained' : 'outlined'}
              size="small"
              startIcon={<CompareArrows />}
              onClick={toggleCompareMode}
              sx={{ textTransform: 'none' }}
            >
              Comparar
            </Button>
          </Tooltip>
        )}

        {/* Notifications */}
        <Tooltip title="Notificacoes">
          <IconButton size="small">
            <Badge badgeContent={unreadNotifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Refresh */}
        <Tooltip title="Atualizar dados">
          <IconButton size="small" onClick={onRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>

        {/* More menu */}
        <Tooltip title="Mais opcoes">
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={onSettingsClick}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText>Configuracoes</ListItemText>
          </MenuItem>
          <MenuItem onClick={onHelpClick}>
            <ListItemIcon><Help fontSize="small" /></ListItemIcon>
            <ListItemText>Ajuda</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon><Download fontSize="small" /></ListItemIcon>
            <ListItemText>Exportar Relatorio</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><Share fontSize="small" /></ListItemIcon>
            <ListItemText>Compartilhar</ListItemText>
          </MenuItem>
          {isMobile && (
            <>
              <Divider />
              <MenuItem onClick={toggleCompareMode}>
                <ListItemIcon><CompareArrows fontSize="small" /></ListItemIcon>
                <ListItemText>Modo Comparacao</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </MotionBox>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
