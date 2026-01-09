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
  Chip,
  Stack,
} from '@mui/material';
import { Delete, Visibility, Edit as EditIcon, FolderOpen } from '@mui/icons-material';
import { IdeasSection } from '../types';
import { truncate, getMediaTypeIcon, getMediaTypeLabel } from '../utils';
import { useTheme } from '@mui/material/styles';

interface Props {
  section: IdeasSection;
  onDelete: (section: IdeasSection) => void;
  onEdit: (section: IdeasSection) => void;
  onViewDetails: (section: IdeasSection) => void;
}

export default function IdeasSectionCard({ section, onDelete, onEdit, onViewDetails }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const previewMedia = section.medias?.[0];
  const hasMedia = section.medias && section.medias.length > 0;

  const mediaTypes = Array.from(new Set(section.medias?.map((m) => m.mediaType) || []));

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
        {previewMedia?.mediaType === 'image' ? (
          <img
            src={previewMedia.url}
            alt={section.title || 'Miniatura'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : hasMedia ? (
          <Box sx={{ textAlign: 'center' }}>
            <FolderOpen fontSize="large" color="primary" />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {section.medias.length} arquivo(s)
            </Typography>
          </Box>
        ) : (
          <FolderOpen fontSize="large" color="disabled" />
        )}

        <Tooltip title="Excluir seção">
          <IconButton
            size="small"
            onClick={() => onDelete(section)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              color: '#d32f2f',
            }}
            aria-label="Excluir seção"
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
          }}
          title={section.title || 'Sem Título'}
          gutterBottom
        >
          {section.title || 'Sem Título'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={section.description}
          gutterBottom
        >
          {truncate(section.description)}
        </Typography>

        {mediaTypes.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mt={1}>
            {mediaTypes.map((type) => (
              <Chip
                key={type}
                size="small"
                label={`${getMediaTypeIcon(type)} ${getMediaTypeLabel(type)}`}
                variant="outlined"
                color="primary"
              />
            ))}
            <Chip
              size="small"
              label={`${section.medias.length} arquivo(s)`}
              variant="filled"
              color="secondary"
            />
          </Stack>
        )}
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
          onClick={() => onViewDetails(section)}
          sx={{ flex: 1, minWidth: 120 }}
          fullWidth={isMobile}
        >
          Ver detalhes
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(section)}
          sx={{ flex: 1, minWidth: 120 }}
          fullWidth={isMobile}
        >
          Editar e publicar
        </Button>
      </CardActions>
    </Card>
  );
}
