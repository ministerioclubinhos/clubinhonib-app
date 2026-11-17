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
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '@/config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useVisibleRoutes } from '@/features/feature-flags';
import {
  setDocumentData,
  clearDocumentData,
} from 'store/slices/documents/documentSlice';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { RouteData } from 'store/slices/route/routeSlice';

const ACCENT = '#0284c7';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(
    (state: RootState) => state.document.documentData
  );
  const routes = useVisibleRoutes();
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
      data-testid="teacher-area-sections-documents-section"
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderTop: `4px solid ${ACCENT}`,
        border: '1px solid #e2e8f0',
        borderTopWidth: 4,
        borderTopColor: ACCENT,
        backgroundColor: '#ffffff',
        borderRadius: 3.5,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: `${ACCENT}14`,
              color: ACCENT,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                color="#0f172a"
                sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.2 }}
              >
                Documentos & Apostilas de Apoio
              </Typography>
              <Chip
                size="small"
                label={filteredRoutes.length}
                sx={{ bgcolor: `${ACCENT}18`, color: ACCENT, fontWeight: 700, height: 22 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Guias, orientações e materiais didáticos para consulta do professor
            </Typography>
          </Box>
        </Box>

        <TextField
          size="small"
          placeholder="Buscar documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: '#f8fafc',
              borderRadius: 2,
              minWidth: { sm: 240 },
            },
          }}
        />
      </Box>

      {error && (
        <Typography variant="body2" color="error" textAlign="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {filteredRoutes.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.5, md: 2 },
            pt: 0.5,
          }}
        >
            {filteredRoutes.map((route) => {
              const isLoading = loadingId === route.id;

              return (
                <Box key={route.id} sx={{ height: '100%' }}>
                  <Card
                    onClick={() => !isLoading && handleOpenModal(route)}
                    elevation={0}
                    sx={{
                      height: '100%',
                      minHeight: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        borderColor: ACCENT,
                        boxShadow: `0 8px 20px ${ACCENT}1f`,
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        '&:last-child': { pb: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1 }}>
                        <Box
                          sx={{
                            flexShrink: 0,
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${ACCENT}15`,
                            color: ACCENT,
                          }}
                        >
                          <PictureAsPdfIcon sx={{ fontSize: '1.3rem' }} />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          color="#0f172a"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3,
                            minHeight: '2.6em',
                          }}
                        >
                          {route.title}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="#475569"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
                          fontSize: '0.84rem',
                        }}
                      >
                        {route.description || 'Documento de apoio pedagógico do Clubinho.'}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 1.5,
                          pt: 1,
                          borderTop: '1px solid #e2e8f0',
                          color: ACCENT,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: '1rem' }} />
                        {isLoading ? 'Carregando...' : 'Abrir documento'}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
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
