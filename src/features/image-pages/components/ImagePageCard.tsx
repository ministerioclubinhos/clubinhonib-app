import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { Delete, Visibility, Image as ImageIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ImagePageData } from 'store/slices/image/imageSlice';
import { truncate } from '../utils';

type Props = {
  page: ImagePageData;
  onDelete: (page: ImagePageData) => void;
  onEdit: (page: ImagePageData) => void;
  onViewDetails: (page: ImagePageData) => void;
};

export default function ImagePageCard({ page, onDelete, onEdit, onViewDetails }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const preview = page.sections?.[0]?.mediaItems?.[0]?.url;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        transition: 'transform .2s, box-shadow .2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      {/* Thumb 16:9 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={page.title || 'Miniatura'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon fontSize="large" color="disabled" />
        )}

        <Tooltip title="Excluir página">
          <IconButton
            size="small"
            onClick={() => onDelete(page)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              color: '#d32f2f',
            }}
            aria-label="Excluir página"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textAlign: 'center',
          }}
          title={page.title || 'Sem Título'}
          gutterBottom
        >
          {page.title || 'Sem Título'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textAlign: 'center',
          }}
          title={page.description}
        >
          {truncate(page.description)}
        </Typography>

        <Typography
          variant="caption"
          color={page.public ? 'success.main' : 'text.secondary'}
          textAlign="center"
          display="block"
          mt={1}
        >
          {page.public ? 'Pública' : 'Privada'}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          p: 2,
          pt: 0,
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<Visibility />}
          onClick={() => onViewDetails(page)}
          sx={{ flex: 1, minWidth: 120 }}
          fullWidth={isMobile}
        >
          Ver detalhes
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(page)}
          sx={{ flex: 1, minWidth: 120 }}
          fullWidth={isMobile}
        >
          Editar
        </Button>
      </CardActions>
    </Card>
  );
}
