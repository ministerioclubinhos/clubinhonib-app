import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { AnimatePresence, motion } from 'framer-motion';

import {
  WEEK_MATERIAL_MEDIA_TABS,
  selectMediaByType,
  cleanMaterialDescription,
  useWeekMaterialPage,
} from '@/features/week-materials';
import { MediaItem, MediaTargetType, MediaType } from '@/store/slices/types';
import { TEACHER_LIST_PATH } from '@/pages/TeacherArea/pagePaths';
import TeacherPageCard from '@/pages/TeacherArea/components/Layout/TeacherPageCard';

import WeekMaterialMediaViewer from './WeekMaterialMediaViewer';

interface WeekMaterialsPageViewProps {
  idToFetch: string;
}

interface MediaTabModel {
  mediaType: MediaType;
  label: string;
  icon: string;
  color: string;
  items: MediaItem[];
}

/** Public page rendering the media of one week material. */
export default function WeekMaterialsPageView({
  idToFetch,
}: WeekMaterialsPageViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { material, loading, error } = useWeekMaterialPage(idToFetch);

  const mediaTabs = useMemo<MediaTabModel[]>(() => {
    if (!material) return [];

    return WEEK_MATERIAL_MEDIA_TABS.map((tab) => ({
      mediaType: tab.mediaType,
      label: tab.label,
      icon: tab.icon,
      color: tab.color,
      items: selectMediaByType(material, tab.mediaType) as MediaItem[],
    })).filter((tab) => tab.items.length > 0);
  }, [material]);

  const backTo = TEACHER_LIST_PATH[MediaTargetType.WeekMaterialsPage];
  const cardProps = {
    icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: '#0284c7',
    backTo,
    backLabel: 'Voltar para Materiais Semanais',
  };

  if (loading) {
    return (
      <TeacherPageCard data-testid="page-view-week-material-loading" {...cardProps} title="Carregando...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress size={48} aria-label="Carregando materiais" />
        </Box>
      </TeacherPageCard>
    );
  }

  if (error) {
    return (
      <TeacherPageCard data-testid="page-view-week-material-error" {...cardProps} title="Material da semana">
        <Alert severity="error">{error}</Alert>
      </TeacherPageCard>
    );
  }

  if (!material) {
    return (
      <TeacherPageCard data-testid="page-view-week-material-not-found" {...cardProps} title="Material da semana">
        <Alert severity="info">Nenhum material encontrado.</Alert>
      </TeacherPageCard>
    );
  }

  const currentTab = mediaTabs[activeTab];

  return (
    <TeacherPageCard data-testid="page-view-week-material-view-page-week-materials-page-view" {...cardProps} title={material.title} subtitle={material.subtitle || undefined}>
      {material.description && (
        <Typography
          sx={{ mb: 2.5, maxWidth: 800, color: '#475569', fontSize: { xs: '0.95rem', md: '1rem' }, whiteSpace: 'pre-wrap' }}
        >
          {cleanMaterialDescription(material.description)}
        </Typography>
      )}

  {mediaTabs.length > 0 && (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: { xs: 3, md: 4 },
        overflow: 'hidden',
        mx: { xs: -1, md: 0 },
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value: number) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Tipos de material disponíveis"
        sx={{
          '& .MuiTab-root': {
            fontSize: { xs: '0.75rem', md: '1rem' },
            fontWeight: 'bold',
            textTransform: 'none',
            minHeight: { xs: 48, md: 56 },
            px: { xs: 0.5, md: 4 },
          },
          '& .Mui-selected': { color: 'primary.main' },
        }}
      >
        {mediaTabs.map((tab) => (
          <Tab
            key={tab.mediaType}
            label={
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={isMobile ? 0.5 : 1}
                sx={{ width: '100%' }}
              >
                <Typography component="span" sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  {tab.icon}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 'inherit',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
                  }}
                >
                  {tab.label}
                </Typography>
                <Chip
                  label={tab.items.length}
                  size="small"
                  aria-label={`${tab.items.length} ${tab.label}`}
                  sx={{
                    bgcolor: tab.color,
                    color: 'common.white',
                    fontSize: { xs: '0.6rem', md: '0.75rem' },
                    height: { xs: 18, md: 20 },
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  )}

  <AnimatePresence mode="wait">
    {currentTab && (
      <motion.div
        key={currentTab.mediaType}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(auto-fit, minmax(400px, 1fr))',
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          {currentTab.items.map((item, index) => (
            <motion.div
              key={item.id ?? `${currentTab.mediaType}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <WeekMaterialMediaViewer
                item={item}
                mediaType={currentTab.mediaType}
              />
            </motion.div>
          ))}
        </Box>
      </motion.div>
    )}
  </AnimatePresence>

  {mediaTabs.length === 0 && (
    <Paper
      elevation={2}
      sx={{ p: 6, textAlign: 'center', borderRadius: { xs: 3, md: 4 } }}
    >
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        📚 Nenhum material disponível
      </Typography>
      <Typography color="text.secondary">
        Os materiais para esta semana ainda não foram publicados.
      </Typography>
    </Paper>
  )}
    </TeacherPageCard>
  );
}
