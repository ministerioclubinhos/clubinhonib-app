import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  loading?: boolean;
};

export default function ImagePageToolbar({ search, onSearchChange, loading }: Props) {
  const hasQuery = Boolean(search);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 2, mb: 4, position: 'relative' }}>
      <TextField
        fullWidth
        label="Buscar por título…"
        placeholder="Buscar por título…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={18} sx={{ mr: hasQuery ? 1 : 0 }} />}
              {hasQuery && (
                <Tooltip title="Limpar">
                  <IconButton size="small" onClick={() => onSearchChange('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
        inputProps={{ 'aria-label': 'Buscar páginas de imagens' }}
      />
    </Box>
  );
}
