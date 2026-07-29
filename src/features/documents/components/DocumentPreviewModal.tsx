import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { DocumentItem } from '../types';
import { mediaTypeLabel, platformLabel, uploadTypeLabel } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const DocumentPreviewModal: React.FC<Props> = ({ open, onClose, document }) => {
  const m = document?.media;

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
          <DescriptionOutlinedIcon /> {document?.name ?? 'Preview'}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {document?.description || 'Sem descrição'}
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Mídia
          </Typography>
          <Typography variant="body2" fontWeight={600} gutterBottom>{m?.title || '—'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{m?.description || '—'}</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            <Chip size="small" label={platformLabel(m?.platformType)} sx={{ borderRadius: 1 }} />
            <Chip size="small" label={uploadTypeLabel(m?.uploadType)} sx={{ borderRadius: 1 }} />
            <Chip size="small" label={mediaTypeLabel(m?.mediaType)} sx={{ borderRadius: 1 }} />
          </Stack>
          {m?.url && (
            <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1.5, wordBreak: 'break-all' }}>
              {m.url}
            </Typography>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
