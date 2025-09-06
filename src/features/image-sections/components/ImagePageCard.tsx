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
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { truncate } from '../utils';
import { useTheme } from '@mui/material/styles';

interface Props {
  section: SectionData;
  onDelete: (section: SectionData) => void;
  onEdit: (section: SectionData) => void;
  onViewDetails: (section: SectionData) => void;
}

export default function ImagePageCard({ section, onDelete, onEdit, onViewDetails }: Props) {
  const preview = section.mediaItems?.[0]?.url;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        {preview ? (
          <img
            src={preview}
            alt={section.caption || 'Miniatura'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon fontSize="large" color="disabled" />
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
          title={section.caption || 'Sem Título'}
          gutterBottom
        >
          {section.caption || 'Sem Título'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={section.description}
        >
          {truncate(section.description)}
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
