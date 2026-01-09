import React from 'react';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
};

export default function ContactToolbar({ search, onSearchChange, onRefresh }: Props) {
  return (
    <Box
      sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}
    >
      <TextField
        fullWidth
        placeholder="Buscar por nome, email, telefone ou mensagem..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ maxWidth: { xs: '100%', md: '60%' }, mx: 'auto' }}
      />
      <Tooltip title="Recarregar">
        <IconButton onClick={onRefresh}>
          <Refresh />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
