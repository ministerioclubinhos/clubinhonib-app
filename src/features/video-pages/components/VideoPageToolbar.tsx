import React from 'react';
import { Box, TextField, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { Refresh, Search, Clear } from '@mui/icons-material';

type Props = {
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
};

export default function VideoPageToolbar({ search, onSearch, onRefresh }: Props) {
  const hasQuery = Boolean(search);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        placeholder="Buscar por título..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ maxWidth: 520, width: '100%' }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: hasQuery ? (
            <InputAdornment position="end">
              <Tooltip title="Limpar">
                <IconButton size="small" onClick={() => onSearch('')}>
                  <Clear fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : undefined,
        }}
      />

      <Tooltip title="Recarregar">
        <span>
          <IconButton onClick={onRefresh} sx={{ ml: 0.5 }}>
            <Refresh />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
