import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '@/config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import {
  setDocumentData,
  clearDocumentData,
} from 'store/slices/documents/documentSlice';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { RouteData } from 'store/slices/route/routeSlice';

const ACCENT = '#0288d1';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(
    (state: RootState) => state.document.documentData
  );
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const documentRoutes = useMemo(
    () => routes.filter((route) => route.entityType === 'Document'),
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return documentRoutes;
    return documentRoutes.filter(
      (route) =>
        route.title?.toLowerCase().includes(term) ||
        route.description?.toLowerCase().includes(term)
    );
  }, [documentRoutes, searchTerm]);

  const handleOpenModal = async (route: RouteData) => {
    try {
      setError(null);
      setLoadingId(route.id);
      const response = await api.get(`/documents/${route.idToFetch}`);
      dispatch(setDocumentData(response.data));
      setOpenModal(true);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      setError('Não foi possível carregar o documento. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    dispatch(clearDocumentData());
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: `5px solid ${ACCENT}`,
        backgroundColor: '#e1f5fe',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: ACCENT }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#424242"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Documentos Importantes
          </Typography>
          <Chip
            size="small"
            label={filteredRoutes.length}
            sx={{ bgcolor: `${ACCENT}20`, color: ACCENT, fontWeight: 700 }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Buscar documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'white',
              borderRadius: 2,
              minWidth: { sm: 250 },
            },
          }}
        />
      </Box>

      <Typography
        variant="body2"
        color="#616161"
        sx={{ mb: 2, fontSize: { xs: '0.85rem', md: '0.95rem' } }}
      >
        📄 Guias, orientações e materiais de apoio do Clubinho — clique em um documento para visualizá-lo.
      </Typography>

      {error && (
        <Typography variant="body2" color="error" textAlign="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {filteredRoutes.length > 0 ? (
        <Box
          sx={{
            py: 2,
            px: { xs: 0.5, md: 1 },
            '& .slick-track': { display: 'flex !important' },
            '& .slick-slide': {
              height: 'inherit',
              '& > div': { height: '100%' },
            },
            '& .slick-prev:before, & .slick-next:before': {
              color: ACCENT,
              fontSize: '28px',
            },
            '& .slick-prev': { left: { xs: -10, md: -20 }, zIndex: 2 },
            '& .slick-next': { right: { xs: -10, md: -20 }, zIndex: 2 },
            '& .slick-dots': {
              bottom: -35,
              '& li.slick-active button:before': { color: ACCENT },
              '& li button:before': { color: ACCENT, opacity: 0.25 },
            },
          }}
        >
          <Slider
            dots
            infinite={filteredRoutes.length > 4}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={5000}
            pauseOnHover
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3, infinite: filteredRoutes.length > 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2, infinite: filteredRoutes.length > 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1, infinite: filteredRoutes.length > 1 } },
            ]}
          >
            {filteredRoutes.map((route) => {
              const isLoading = loadingId === route.id;

              return (
                <Box key={route.id} sx={{ p: 1.5, height: '100%' }}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      onClick={() => !isLoading && handleOpenModal(route)}
                      sx={{
                        height: '100%',
                        minHeight: 190,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 10px 24px ${ACCENT}30`,
                          transform: 'translateY(-4px)',
                          '& .doc-icon': { transform: 'scale(1.1) rotate(-4deg)' },
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          p: { xs: 1.5, md: 2 },
                          '&:last-child': { pb: { xs: 1.5, md: 2 } },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 1 }}>
                          <Box
                            className="doc-icon"
                            sx={{
                              flexShrink: 0,
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${ACCENT}15`,
                              color: ACCENT,
                              transition: 'transform 0.25s ease',
                            }}
                          >
                            <PictureAsPdfIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="#424242"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.25em',
                              minHeight: '2.5em',
                            }}
                          >
                            {route.title}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          color="#616161"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flexGrow: 1,
                          }}
                        >
                          {route.description || 'Sem descrição'}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 1.5,
                            color: ACCENT,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: '1rem' }} />
                          {isLoading ? 'Carregando...' : 'Visualizar'}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              );
            })}
          </Slider>
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ py: 4 }}
        >
          {searchTerm
            ? `Nenhum documento encontrado para "${searchTerm}".`
            : 'Nenhum documento disponível no momento.'}
        </Typography>
      )}

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={handleCloseModal}
        media={documentData?.media || null}
        title={documentData?.name}
      />
    </Paper>
  );
};

export default DocumentsSection;
