import React from 'react';
import {
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

type Props = {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
};

export default function BannerSearch({ value, onChange, loading }: Props) {
  const hasQuery = Boolean(value);

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 520 }, position: 'relative' }}>
      <TextField
        fullWidth
        placeholder="Buscar por título..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
                  <IconButton size="small" onClick={() => onChange('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
