import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';

type Props = {
  items: InformativeBannerData[];
  onEdit: (banner: InformativeBannerData) => void;
  onDeleteAsk: (banner: InformativeBannerData) => void;
};

export default function BannerGrid({ items, onEdit, onDeleteAsk }: Props) {
  return (
    <Grid container spacing={3} alignItems="stretch">
      {items.map((banner) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={banner.id}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform .2s, box-shadow .2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ pb: 1, flexGrow: 1 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                title={banner.title}
              >
                {banner.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                title={banner.description}
              >
                {banner.description}
              </Typography>

              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="caption"
                  color={banner.public ? 'success.main' : 'warning.main'}
                  sx={{ fontWeight: 500 }}
                >
                  {banner.public ? 'Público' : 'Privado'}
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ pt: 0, px: 2, pb: 2, justifyContent: 'flex-end' }}>
              <Tooltip title="Editar banner">
                <IconButton size="small" color="primary" onClick={() => onEdit(banner)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir banner">
                <IconButton size="small" color="error" onClick={() => onDeleteAsk(banner)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
