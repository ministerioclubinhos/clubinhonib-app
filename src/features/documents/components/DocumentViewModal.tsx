import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { DocumentItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const DocumentViewModal: React.FC<Props> = ({ open, onClose, document }) => {
  const getEmbedUrl = (originalUrl?: string) => {
    if (!originalUrl) return '';
    if (originalUrl.includes('drive.google.com/file/d/')) {
      return originalUrl.replace(/\/view.*$/, '/preview');
    }
    return originalUrl;
  };

  const url = getEmbedUrl(document?.media?.url);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: '95%',
          maxHeight: '95vh',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: '#81d742',
          color: 'white',
          fontWeight: 700,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionOutlinedIcon />
          {document?.name ?? 'Visualizar documento'}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'grey.100', minHeight: 480 }}>
        {url ? (
          <Box
            component="iframe"
            src={url}
            title="Visualização do documento"
            sx={{
              width: '100%',
              height: '78vh',
              border: 'none',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: 'text.secondary',
              px: 3,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nenhum documento disponível
            </Typography>
            <Typography variant="body2">
              Não há URL ou arquivo vinculado para visualização.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewModal;
