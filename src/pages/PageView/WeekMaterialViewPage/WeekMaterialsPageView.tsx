import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  WEEK_MATERIAL_MEDIA_TABS,
  selectMediaByType,
  useWeekMaterialPage,
} from '@/features/week-materials';
import { MediaItem, MediaType } from '@/store/slices/types';

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
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <Container data-testid="page-view-week-material-view-page-week-materials-page-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} aria-label="Carregando materiais" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container data-testid="page-view-week-material-view-page-week-materials-page-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!material) {
    return (
      <Container data-testid="page-view-week-material-view-page-week-materials-page-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="info">Nenhum material encontrado.</Alert>
      </Container>
    );
  }

  const currentTab = mediaTabs[activeTab];

  return (
    <Box data-testid="page-view-week-material-view-page-week-materials-page-view"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          component="header"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: { xs: 3, sm: 4, md: 5 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 2,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              sx={{
                color: 'common.white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.1rem', sm: '2.2rem', md: '2.8rem' },
                mb: { xs: 1.5, sm: 2 },
                lineHeight: 1.1,
                color: 'common.white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              📚 {material.title}
            </Typography>

            {material.subtitle && (
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '0.95rem', sm: '1.4rem', md: '1.6rem' },
                  mb: { xs: 1.5, sm: 2 },
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {material.subtitle}
              </Typography>
            )}

            {material.description && (
              <Typography
                variant="body1"
                maxWidth={{ xs: '100%', sm: '90%', md: '800px' }}
                mx="auto"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 },
                  px: { xs: 1, sm: 2 },
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {material.description}
              </Typography>
            )}
          </Box>
        </Box>
      </motion.div>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          bgcolor: 'background.default',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            bgcolor: 'background.paper',
            borderRadius: '20px',
            p: { xs: 2, md: 4 },
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider',
            width: { xs: '98%', md: '95%' },
          }}
        >
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
        </Container>
      </Box>
    </Box>
  );
}
