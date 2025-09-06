import React from 'react';
import { Box, Button, Tooltip, Fab, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';

type Props = { onCreate: () => void };

export default function BannerToolbar({ onCreate }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Tooltip title="Criar Banner">
        <Fab
          color="primary"
          aria-label="Criar Banner"
          onClick={onCreate}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}
        >
          <Add />
        </Fab>
      </Tooltip>
    );
  }

  return (
    <Box display="flex" justifyContent="flex-end">
      <Tooltip title="Criar Banner">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreate}
          sx={{ fontSize: '0.95rem', py: 1.1, px: 2.2, borderRadius: 2 }}
        >
          Criar Banner
        </Button>
      </Tooltip>
    </Box>
  );
}
