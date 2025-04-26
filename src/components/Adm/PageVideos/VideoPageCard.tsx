import { Box, Typography, Card, CardContent, IconButton, Button } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { VideoPageData } from 'store/slices/video/videoSlice';

interface Props {
  page: VideoPageData;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function VideoPageCard({ page, onView, onEdit, onDelete }: Props) {
  const truncate = (text: string = '', len = 100) =>
    text.length > len ? text.slice(0, len) + '...' : text;

  return (
    <Card sx={{ p: 2, borderRadius: 3, position: 'relative', boxShadow: 3 }}>
      <IconButton
        size="small"
        onClick={onDelete}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
        title="Excluir Página"
      >
        <Delete fontSize="small" />
      </IconButton>

      <CardContent>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>
          {page.title || 'Sem Título'}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {truncate(page.description)}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
          {page.public ? 'Pública' : 'Privada'}
        </Typography>

        <Box textAlign="center" mt={3}>
          <Button variant="contained" onClick={onView} sx={{ mr: 1 }}>
            <Visibility fontSize="small" />
          </Button>
          <Button variant="outlined" onClick={onEdit}>
            Editar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
