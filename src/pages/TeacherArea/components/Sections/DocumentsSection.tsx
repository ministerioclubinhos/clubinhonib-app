import React, { Fragment, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
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

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(
    (state: RootState) => state.document.documentData
  );
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [openModal, setOpenModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentRoutes = routes.filter(
    (route) => route.entityType === 'Document'
  );

  const handleOpenModal = async (route: RouteData) => {
    try {
      const response = await api.get(`/documents/${route.idToFetch}`);
      dispatch(setDocumentData(response.data));
      setOpenModal(true);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      setError('Não foi possível carregar o documento.');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    dispatch(clearDocumentData());
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateDescription = (
    description: string | undefined,
    maxLength: number
  ) => {
    if (!description) return 'Sem descrição';
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  const displayedRoutes = isExpanded
    ? documentRoutes
    : documentRoutes.slice(0, 4);

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: '5px solid #0288d1',
        backgroundColor: '#e1f5fe',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <DescriptionIcon sx={{ color: '#0288d1', mr: 1 }} />
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#424242"
          sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          Documentos Importantes
        </Typography>
      </Box>

      {error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {error}
        </Typography>
      ) : documentRoutes.length > 0 ? (
        <Box
          sx={{
            py: 2,
            px: { xs: 0.5, md: 1 },
            '& .slick-prev:before, & .slick-next:before': {
              color: '#0288d1',
              fontSize: '28px',
            },
            '& .slick-prev': {
              left: { xs: -10, md: -20 },
              zIndex: 2,
            },
            '& .slick-next': {
              right: { xs: -10, md: -20 },
              zIndex: 2,
            },
            '& .slick-dots': {
              bottom: -35,
              '& li.slick-active button:before': {
                color: '#0288d1',
              },
              '& li button:before': {
                color: '#0288d1',
                opacity: 0.25,
              },
            },
          }}
        >
          <Slider
            dots
            infinite={documentRoutes.length > 3}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={4000}
            pauseOnHover
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1 } },
            ]}
          >
            {documentRoutes.map((route) => (
              <Box key={route.id} sx={{ p: 1.5 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 180,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleOpenModal(route)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '3.6em',
                          lineHeight: '1.2em',
                        }}
                      >
                        {route.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#616161"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {truncateDescription(route.description, 70)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          Nenhum documento disponível no momento.
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
