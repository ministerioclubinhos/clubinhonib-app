import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '@/config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useVisibleRoutes } from '@/features/feature-flags';
import { setDocumentData, clearDocumentData } from 'store/slices/documents/documentSlice';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { downloadDocumentFile, isUploadedMedia } from '@/core/document-viewer';
import { RouteData } from 'store/slices/route/routeSlice';

import TeacherPageCard from '../Layout/TeacherPageCard';

const ACCENT = '#0284c7';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector((state: RootState) => state.document.documentData);
  const routes = useVisibleRoutes();
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const documentRoutes = useMemo(
    () => routes.filter((route) => route.entityType === 'Document'),
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return documentRoutes;
    return documentRoutes.filter(
      (route) =>
        route.title?.toLowerCase().includes(term) || route.description?.toLowerCase().includes(term)
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

  const handleDownload = async (route: RouteData) => {
    try {
      setError(null);
      setDownloadingId(route.id);
      const response = await api.get(`/documents/${route.idToFetch}`);
      const media = response.data?.media;
      if (!media?.url) throw new Error('Documento sem arquivo');
      if (isUploadedMedia(media)) {
        await downloadDocumentFile(media);
      } else {
        // Link externo não pode ser baixado por nós: abre na plataforma de origem.
        window.open(media.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      setError('Não foi possível baixar o documento. Tente novamente.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    dispatch(clearDocumentData());
  };

  return (
    <TeacherPageCard
      data-testid="teacher-area-sections-documents-section"
      icon={<DescriptionIcon sx={{ fontSize: 22 }} />}
      accent={ACCENT}
      title="Documentos & Apostilas de Apoio"
      subtitle="Guias, orientações e materiais didáticos para consulta do professor"
      count={filteredRoutes.length}
      actions={
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
      }
    >
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
            const isDownloading = downloadingId === route.id;

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
                        justifyContent: 'space-between',
                        gap: 1,
                        mt: 1.5,
                        pt: 1,
                        borderTop: '1px solid #e2e8f0',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: ACCENT,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: '1rem' }} />
                        {isLoading ? 'Carregando...' : 'Abrir documento'}
                      </Box>
                      <Button
                        size="small"
                        data-testid={`teacher-area-document-download-${route.id}`}
                        aria-label={`Baixar ${route.title}`}
                        disabled={isDownloading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(route);
                        }}
                        startIcon={
                          isDownloading ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                          )
                        }
                        sx={{
                          minHeight: 40,
                          px: 1.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: ACCENT,
                          borderRadius: 2,
                          '&:hover': { bgcolor: `${ACCENT}15` },
                        }}
                      >
                        {isDownloading ? 'Baixando...' : 'Baixar'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
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
    </TeacherPageCard>
  );
};

export default DocumentsSection;
