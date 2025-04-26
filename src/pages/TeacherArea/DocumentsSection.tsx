import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import api from '../../config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/slices';
import {
  DocumentData,
  setDocumentData,
  clearDocumentData,
} from 'store/slices/documents/documentSlice';
import { MediaPlatform } from 'store/slices/types';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector((state: RootState) => state.document.documentData);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        setDocuments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        setError('Não foi possível carregar os documentos.');
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleOpenModal = (document: DocumentData) => {
    dispatch(setDocumentData(document));
    setOpenModal(true);
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

  const displayedDocuments = isExpanded ? documents : documents.slice(0, 4);

  const renderIframeSrc = () => {
    const media = documentData?.media;
    if (!media?.url) return '';
    switch (media.platformType) {
      case MediaPlatform.GOOGLE_DRIVE:
        return media.url.replace('/view?usp=', '/preview?usp=');
      case MediaPlatform.YOUTUBE:
        return media.url.replace('watch?v=', 'embed/');
      default:
        return media.url;
    }
  };

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

      {loading ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Carregando documentos...
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {error}
        </Typography>
      ) : documents.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {displayedDocuments.map((doc) => (
              <Grid item xs={12} sm={6} md={3} key={doc.id}>
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
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleOpenModal(doc)}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        gutterBottom
                      >
                        {doc.name}
                      </Typography>
                      <Typography variant="body2" color="#616161">
                        {truncateDescription(doc.description, 70)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {documents.length > 4 && (
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

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '95%',
            maxWidth: '95%',
            m: 2,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {documentData?.name || 'Visualizar Documento'}
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {documentData?.media?.url ? (
            <iframe
              src={renderIframeSrc()}
              style={{ width: '100%', height: '80vh', border: 'none' }}
              title={documentData.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Typography>Não há documento disponível para visualização.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DocumentsSection;
