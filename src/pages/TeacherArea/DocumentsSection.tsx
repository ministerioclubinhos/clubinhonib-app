import React, { useState } from 'react';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Link } from 'react-router-dom';
import api from '../../config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/slices';
import { setDocumentData, clearDocumentData } from 'store/slices/documents/documentSlice';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { RouteData } from 'store/slices/route/routeSlice';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector((state: RootState) => state.document.documentData);
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [openModal, setOpenModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const documentRoutes = routes.filter((route) => route.entityType === 'Document');

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

  const truncateDescription = (description: string | undefined, maxLength: number) => {
    if (!description) return 'Sem descrição';
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  const displayedRoutes = isExpanded ? documentRoutes : documentRoutes.slice(0, 4);

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
        <Typography variant="h6" fontWeight="bold" color="#424242">
          Documentos Importantes
        </Typography>
      </Box>

      {error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {error}
        </Typography>
      ) : documentRoutes.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {displayedRoutes.map((route) => (
              <Grid item xs={12} sm={6} md={3} key={route.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                    }}
                    onClick={() => handleOpenModal(route)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="#424242" gutterBottom>
                        {route.title}
                      </Typography>
                      <Typography variant="body2" color="#616161">
                        {truncateDescription(route.description, 70)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {documentRoutes.length > 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={handleToggleExpand}
              >
                {isExpanded ? 'Ver menos' : 'Ver mais documentos'}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
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