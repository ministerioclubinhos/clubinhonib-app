import React from 'react';
import { Card, Typography } from '@mui/material';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Card>
  );
}
