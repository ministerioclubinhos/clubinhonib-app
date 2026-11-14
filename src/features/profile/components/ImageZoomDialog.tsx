import React from 'react';
import { Box, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  /** Vazio quando ainda não há foto — o diálogo não abre nesse caso. */
  imageUrl: string;
  onClose: () => void;
};

/**
 * A foto de perfil ampliada.
 *
 * Saiu de `ProfileImageUpload`, que reunia o recorte, a câmera, o envio e este
 * diálogo num arquivo de 730 linhas.
 */
export default function ImageZoomDialog({ open, imageUrl, onClose }: Props) {
  return (
      <Dialog data-testid="profile-image-zoom-dialog"
        open={open}
        onClose={onClose}
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.85)',
              },
              zIndex: 1,
            }}
           aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={imageUrl}
            alt="Foto de perfil ampliada"
            sx={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 2,
              objectFit: 'contain',
            }}
          />
        </Box>
      </Dialog>
  );
}
