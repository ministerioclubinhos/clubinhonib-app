import { Box, Typography, Card, CardContent, IconButton, Button, Stack } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { VideoPageData } from 'store/slices/video/videoSlice';
import { truncate } from '../utils';
import { useMediaQuery, useTheme } from '@mui/material';

interface Props {
  page: VideoPageData;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VideoPageCard({ page, onView, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        position: 'relative',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <IconButton
        size="small"
        onClick={onDelete}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
        title="Excluir Página"
        aria-label="Excluir Página"
      >
        <Delete fontSize="small" />
      </IconButton>

      <CardContent sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>
          {page.title || 'Sem Título'}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {truncate(page.description)}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
          {page.public ? 'Pública' : 'Privada'}
        </Typography>
      </CardContent>

      <Box sx={{ mt: 'auto' }}>
        {isXs ? (
          <Stack spacing={1}>
            <Button
              variant="contained"
              startIcon={<Visibility />}
              onClick={onView}
              fullWidth
              aria-label="Ver detalhes"
            >
              Ver detalhes
            </Button>
            <Button variant="outlined" onClick={onEdit} fullWidth aria-label="Editar">
              Editar
            </Button>
          </Stack>
        ) : (
          <Box textAlign="center" mt={1}>
            <Button
              variant="contained"
              onClick={onView}
              startIcon={<Visibility />}
              sx={{ mr: 1, minWidth: 140 }}
              aria-label="Ver detalhes"
            >
              Detalhes
            </Button>
            <Button variant="outlined" onClick={onEdit} sx={{ minWidth: 120 }} aria-label="Editar">
              Editar
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
}
