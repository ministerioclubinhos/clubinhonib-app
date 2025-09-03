import React from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';

type Props = {
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
};

export default function VideoPageToolbar({ search, onSearch, onRefresh }: Props) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 3,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TextField
        placeholder="Buscar por título..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ maxWidth: 500, width: '100%' }}
      />
      <Tooltip title="Recarregar">
        <IconButton onClick={onRefresh}>
          <Refresh />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
