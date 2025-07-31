import React from 'react';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';

type Props = {
  items: InformativeBannerData[];
  onEdit: (banner: InformativeBannerData) => void;
  onDeleteAsk: (banner: InformativeBannerData) => void;
};

export default function BannerGrid({ items, onEdit, onDeleteAsk }: Props) {
  return (
    <Grid container spacing={3}>
      {items.map((banner) => (
        <Grid item xs={12} sm={6} md={4} key={banner.id}>
          <Box
            p={2}
            border="1px solid #ccc"
            borderRadius={2}
            bgcolor="#fff"
            boxShadow={2}
            position="relative"
            sx={{ transition: '0.2s', '&:hover': { boxShadow: 4 } }}
          >
            <Typography variant="h6" fontWeight="bold">
              {banner.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {banner.description}
            </Typography>
            <Typography
              variant="caption"
              color={banner.public ? 'success.main' : 'warning.main'}
              display="block"
              mt={2}
            >
              {banner.public ? 'Público' : 'Privado'}
            </Typography>

            <Box position="absolute" bottom={8} right={8} display="flex" gap={1}>
              <IconButton size="small" color="primary" onClick={() => onEdit(banner)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDeleteAsk(banner)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
