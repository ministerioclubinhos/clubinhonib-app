import React from 'react';
import { Grid, Card, CardContent, Typography, IconButton, Button, Box, Chip } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { IdeasPageData } from 'store/slices/ideas/ideasSlice';
import { truncate } from '../utils';

interface Props {
  page: IdeasPageData;
  onView: () => void;
  onDelete: () => void;
}

export default function IdeasPageCard({ page, onView, onDelete }: Props) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ borderRadius: 3, position: 'relative', p: 2, height: '100%' }}>
        <IconButton
          onClick={onDelete}
          sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
          aria-label={`Excluir página ${page.title}`}
        >
          <Delete />
        </IconButton>

        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold">
            {page.title}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {page.subtitle}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1, mb: 2, flexGrow: 1 }}
          >
            {truncate(page.description, 100)}
          </Typography>

          <Box textAlign="center">
            <Button
              variant="contained"
              startIcon={<Visibility />}
              onClick={onView}
              aria-label={`Ver detalhes da página ${page.title}`}
            >
              Ver Detalhes
            </Button>
          </Box>

          {page.public && (
            <Box mt={2} textAlign="center">
              <Chip label="Pública" color="success" size="small" aria-label="Página pública" />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
