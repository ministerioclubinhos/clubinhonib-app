import React, { useMemo } from 'react';
import { TEACHER_PAGE_BASE_PATH } from '../../pagePaths';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  AutoStoriesOutlined as AutoStoriesIcon,
  DescriptionOutlined as DescriptionIcon,
  LightbulbOutlined as LightbulbIcon,
  VideoLibraryOutlined as VideoLibraryIcon,
  PhotoCameraOutlined as PhotoCameraIcon,
  ShareOutlined as ShareIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFeatureFlags } from '@/hooks';
import { FEATURE, useVisibleRoutes } from '@/features/feature-flags';
import { MediaTargetType } from '@/store/slices/types';
import { selectVideoRoutes } from '@/store/selectors/routeSelectors';

export interface TeacherNavItem {
  id: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
  accentColor: string;
  group: 'preparacao' | 'biblioteca' | 'participacao';
  exact?: boolean;
}

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (to: string) => void;
}

const GROUP_LABELS: Record<TeacherNavItem['group'], string> = {
  preparacao: 'Área do Professor',
  biblioteca: 'Biblioteca Pedagógica',
  participacao: 'Clubinho & Comunidade',
};

const TeacherAreaSidebar: React.FC<Props> = ({
  collapsed,
  onToggleCollapse,
  onNavigate,
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { flags } = useFeatureFlags();
  const routes = useVisibleRoutes();
  const videos = useSelector(selectVideoRoutes);

  const counts = useMemo(() => {
    const weekMaterials = routes.filter(
      (r) => r.entityType === MediaTargetType.WeekMaterialsPage && r.public
    ).length;
    const documents = routes.filter((r) => r.entityType === 'Document').length;
    const ideas = routes.filter((r) => r.entityType === MediaTargetType.IdeasPage).length;
    return {
      weekMaterials,
      documents,
      ideas,
      videos: videos.length,
    };
  }, [routes, videos.length]);

  const navItems = useMemo<TeacherNavItem[]>(() => {
    const items: TeacherNavItem[] = [
      {
        id: 'overview',
        label: 'Home',
        to: '/area-do-professor',
        icon: <DashboardIcon fontSize="small" />,
        accentColor: '#154c79',
        group: 'preparacao',
        exact: true,
      },
      ...(flags[FEATURE.WEEKLY_MATERIALS]
        ? [
            {
              id: 'materials',
              label: 'Materiais Semanais',
              to: '/lista-materias-semanais',
              icon: <AutoStoriesIcon fontSize="small" />,
              badge: counts.weekMaterials || undefined,
              accentColor: '#0284c7',
              group: 'preparacao' as const,
            },
          ]
        : []),
      ...(flags[FEATURE.DOCUMENTS_LIBRARY]
        ? [
            {
              id: 'documents',
              label: 'Documentos Importantes',
              to: '/area-do-professor/documentos',
              icon: <DescriptionIcon fontSize="small" />,
              badge: counts.documents || undefined,
              accentColor: '#0284c7',
              group: 'preparacao' as const,
            },
          ]
        : []),
      ...(flags[FEATURE.IDEAS_SHARING]
        ? [
            {
              id: 'ideas',
              label: 'Ideias',
              to: '/area-do-professor/ideias',
              icon: <LightbulbIcon fontSize="small" />,
              badge: counts.ideas || undefined,
              accentColor: '#9333ea',
              group: 'preparacao' as const,
            },
          ]
        : []),
      ...(flags[FEATURE.IDEA_SUBMISSION]
        ? [
            {
              id: 'share-idea',
              label: 'Compartilhar Ideia',
              to: '/compartilhar-ideia',
              icon: <ShareIcon fontSize="small" />,
              accentColor: '#7c3aed',
              group: 'preparacao' as const,
            },
          ]
        : []),
      ...(flags[FEATURE.TRAINING_VIDEOS]
        ? [
            {
              id: 'videos',
              label: 'Galeria de Vídeos',
              to: '/area-do-professor/videos',
              icon: <VideoLibraryIcon fontSize="small" />,
              badge: counts.videos || undefined,
              accentColor: '#4f46e5',
              group: 'preparacao' as const,
            },
          ]
        : []),
      ...(flags[FEATURE.CLUB_PHOTO_UPLOAD]
        ? [
            {
              id: 'photos',
              label: 'Enviar Fotos do Clubinho',
              to: '/fotos-videos-clubinho',
              icon: <PhotoCameraIcon fontSize="small" />,
              accentColor: '#16a34a',
              group: 'preparacao' as const,
            },
          ]
        : []),
    ];
    return items;
  }, [flags, counts]);

  const isActive = (item: TeacherNavItem) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    if (item.id === 'materials' && location.pathname.startsWith(`${TEACHER_PAGE_BASE_PATH[MediaTargetType.WeekMaterialsPage]}/`)) {
      return true;
    }
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  const groups: TeacherNavItem['group'][] = ['preparacao'];

  // Mobile-first: barra de abas fixa sob a navbar, deslizante, com a aba ativa sempre visível
  if (isMobile) {
    return (
      <Box
        data-testid="teacher-area-sidebar-mobile"
        component="nav"
        aria-label="Navegação da Área do Professor"
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 1100,
          py: 0.75,
          mb: 1.5,
          bgcolor: 'rgba(244, 246, 249, 0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #dbe4f0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            overflowX: 'auto',
            scrollSnapType: 'x proximity',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Button
                key={item.id}
                ref={(el) => {
                  if (active && el) {
                    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                  }
                }}
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(item.to)}
                startIcon={item.icon}
                sx={{
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  textTransform: 'none',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.85rem',
                  borderRadius: 5,
                  px: 1.75,
                  minHeight: 44,
                  whiteSpace: 'nowrap',
                  bgcolor: active ? item.accentColor : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  border: `1px solid ${active ? item.accentColor : '#dbe4f0'}`,
                  '&:hover': { bgcolor: active ? item.accentColor : '#f8fafc' },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  }

  // Desktop: Sidebar lateral fixa/colapsável
  return (
    <Paper
      data-testid="teacher-area-sidebar"
      elevation={0}
      sx={{
        width: collapsed ? 68 : 256,
        flexShrink: 0,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1px solid #dbe4f0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 84,
        transition: 'width 0.22s ease',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {!collapsed && (
          <Typography
            variant="subtitle2"
            fontWeight={800}
            color="#0f2942"
            sx={{ fontSize: '0.85rem', letterSpacing: 0.2 }}
          >
            Navegação do Professor
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'} placement="right">
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            sx={{ color: '#64748b', '&:hover': { color: '#0f2942' } }}
          >
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: collapsed ? 0.75 : 1.25 }}>
        {groups.map((group, idx) => {
          const groupItems = navItems.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;

          return (
            <Box key={group} sx={{ mb: idx < groups.length - 1 ? 1.5 : 0 }}>
              {!collapsed && (
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 1.25,
                    pb: 0.5,
                    fontWeight: 800,
                    fontSize: '0.66rem',
                    color: '#64748b',
                    letterSpacing: 0.8,
                    lineHeight: 1.3,
                  }}
                >
                  {GROUP_LABELS[group]}
                </Typography>
              )}

              <List dense disablePadding>
                {groupItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <Tooltip
                      key={item.id}
                      title={collapsed ? item.label : ''}
                      placement="right"
                    >
                      <ListItemButton
                        selected={active}
                        onClick={() => onNavigate(item.to)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.4,
                          py: 0.9,
                          px: collapsed ? 1 : 1.25,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          borderLeft: active && !collapsed ? `3px solid ${item.accentColor}` : '3px solid transparent',
                          '&.Mui-selected': {
                            bgcolor: `${item.accentColor}12`,
                            color: item.accentColor,
                            '&:hover': { bgcolor: `${item.accentColor}1c` },
                          },
                          '&:hover': {
                            bgcolor: '#f8fafc',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed ? 0 : 32,
                            justifyContent: 'center',
                            color: active ? item.accentColor : '#64748b',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                          <>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: '0.84rem',
                                fontWeight: active ? 800 : 600,
                                color: active ? item.accentColor : '#334155',
                                noWrap: true,
                              }}
                            />
                            {item.badge !== undefined && (
                              <Chip
                                size="small"
                                label={item.badge}
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: active ? item.accentColor : '#f1f5f9',
                                  color: active ? '#fff' : '#475569',
                                }}
                              />
                            )}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
              </List>

              {collapsed && idx < groups.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default TeacherAreaSidebar;
