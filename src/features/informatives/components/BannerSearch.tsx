import React from 'react';
import { Box, CircularProgress, TextField } from '@mui/material';

type Props = {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean; // indica "isFiltering"
};

export default function BannerSearch({ value, onChange, loading }: Props) {
  return (
    <Box maxWidth={500} mx="auto" mb={4} position="relative">
      <TextField
        fullWidth
        placeholder="Buscar por título..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {loading && (
        <CircularProgress size={24} sx={{ position: 'absolute', right: 10, top: 10 }} />
      )}
    </Box>
  );
}
