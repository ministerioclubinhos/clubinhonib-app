import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { DocumentItem } from '../types';
import { mediaTypeLabel, platformLabel, uploadTypeLabel } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const DetailField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box sx={{ py: 1.5 }}>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ wordBreak: 'break-word' }}>
      {value ?? '—'}
    </Typography>
  </Box>
);

const DocumentDetailsModal: React.FC<Props> = ({ open, onClose, document }) => {
  const url = document?.media?.url;

  const handleCopyUrl = () => {
    if (url) navigator.clipboard.writeText(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden', boxShadow: 24 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: '#81d742',
          color: 'white',
          fontWeight: 700,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionOutlinedIcon /> Detalhes do documento
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 0, py: 0 }}>
        <Box sx={{ px: 3, pt: 3 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700}>
            Documento
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, borderColor: 'divider' }}>
            <DetailField label="Nome" value={document?.name} />
            <DetailField label="Descrição" value={document?.description} />
          </Paper>
        </Box>

        <Box sx={{ px: 3, pt: 3, pb: 3 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinkIcon fontSize="small" /> Mídia vinculada
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, borderColor: 'divider' }}>
            <DetailField label="Título da mídia" value={document?.media?.title} />
            <DetailField label="Descrição da mídia" value={document?.media?.description} />
            <DetailField label="Plataforma" value={platformLabel(document?.media?.platformType)} />
            <DetailField label="Tipo de upload" value={uploadTypeLabel(document?.media?.uploadType)} />
            <DetailField label="Tipo de mídia" value={mediaTypeLabel(document?.media?.mediaType)} />
            <Box sx={{ py: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                URL
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ wordBreak: 'break-all', flex: 1 }}>
                  {url || '—'}
                </Typography>
                {url && (
                  <Tooltip title="Copiar URL">
                    <IconButton onClick={handleCopyUrl} size="small" color="primary" sx={{ flexShrink: 0 }}>
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDetailsModal;
