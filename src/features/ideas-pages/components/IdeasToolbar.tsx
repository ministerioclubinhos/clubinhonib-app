import React from 'react';
import { Box, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Refresh } from '@mui/icons-material';

type Props = {
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
  isFiltering?: boolean;
};

export default function IdeasToolbar({ search, onSearch, onRefresh, isFiltering }: Props) {
  return (
    <Box maxWidth={500} mx="auto" mb={4} position="relative" display="flex" gap={1}>
      <TextField
        fullWidth
        placeholder="Buscar por título..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        inputProps={{ 'aria-label': 'Buscar por título' }}
      />
      <Tooltip title="Recarregar">
        <IconButton onClick={onRefresh} aria-label="Recarregar lista">
          <Refresh />
        </IconButton>
      </Tooltip>
      {isFiltering && (
        <CircularProgress
          size={22}
          sx={{ position: 'absolute', right: 54, top: 10 }}
          aria-label="Filtrando páginas"
        />
      )}
    </Box>
  );
}
