import React from 'react';
import { Stack, Typography } from '@mui/material';

export function PlaceholderCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <Typography variant="subtitle1">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
