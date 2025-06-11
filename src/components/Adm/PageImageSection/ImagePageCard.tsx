import { Box, Button, Card, CardContent, IconButton, Typography } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';

interface Props {
  section: SectionData;
  onDelete: (section: SectionData) => void;
  onEdit: (section: SectionData) => void;
  onViewDetails: (section: SectionData) => void;
}

const truncate = (text: string = '', max = 100) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export default function ImagePageCard({ section, onDelete, onEdit, onViewDetails }: Props) {
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
        onClick={() => onDelete(section)}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
        title="Excluir Seção"
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
          {section.caption || 'Sem Título'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ fontSize: { xs: '.85rem', md: '1rem' }, mb: 1 }}
        >
          {truncate(section.description)}
        </Typography>

        <Box textAlign="center">
          <Button
            variant="contained"
            startIcon={<Visibility />}
            onClick={() => onViewDetails(section)}
            sx={{ mb: 1 }}
            fullWidth
          >
            Ver Detalhes
          </Button>
          <Button variant="outlined" onClick={() => onEdit(section)} fullWidth>
            Editar e publicar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}