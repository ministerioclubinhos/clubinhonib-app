import React from 'react';
import { Box, Button, Card, CardContent, IconButton, Typography } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { ImagePageData } from 'store/slices/image/imageSlice';
import { truncate } from '../utils';

type Props = {
  page: ImagePageData;
  onDelete: (page: ImagePageData) => void;
  onEdit: (page: ImagePageData) => void;
  onViewDetails: (page: ImagePageData) => void;
};

export default function ImagePageCard({ page, onDelete, onEdit, onViewDetails }: Props) {
  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <IconButton
        size="small"
        onClick={() => onDelete(page)}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
        title="Excluir Página"
      >
        <Delete fontSize="small" />
      </IconButton>

      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{ fontSize: { xs: '1rem', md: '1.4rem' } }}
        >
          {page.title || 'Sem Título'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ fontSize: { xs: '.85rem', md: '1rem' }, mb: 1 }}
        >
          {truncate(page.description)}
        </Typography>

        <Typography
          variant="caption"
          color={page.public ? 'success.main' : 'text.secondary'}
          textAlign="center"
          display="block"
          mb={2}
        >
          {page.public ? 'Pública' : 'Privada'}
        </Typography>

        <Box textAlign="center">
          <Button
            variant="contained"
            startIcon={<Visibility />}
            onClick={() => onViewDetails(page)}
            sx={{ mb: 1 }}
            fullWidth
          >
            Ver Detalhes
          </Button>
          <Button variant="outlined" onClick={() => onEdit(page)} fullWidth>
            Editar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
