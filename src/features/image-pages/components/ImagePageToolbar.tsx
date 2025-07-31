import React from 'react';
import { Box, TextField } from '@mui/material';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
};

export default function ImagePageToolbar({ search, onSearchChange }: Props) {
  return (
    <Box maxWidth={500} mx="auto" mb={5}>
      <TextField
        fullWidth
        placeholder="Buscar por título..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </Box>
  );
}
