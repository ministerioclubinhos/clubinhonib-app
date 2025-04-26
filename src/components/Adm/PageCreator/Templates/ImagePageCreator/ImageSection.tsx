import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import ImageItem from './ImageItem';
import { MediaItem } from 'store/slices/types';

interface ImageSectionProps {
  mediaItems: MediaItem[];
  caption: string;
  description: string;
  isPublic: boolean;
  onCaptionChange: (caption: string) => void;
  onDescriptionChange: (description: string) => void;
  onPublicChange: (value: boolean) => void;
  onRemoveMedia: (mediaIndex: number) => void;
  onOpenModal: () => void;
  onRemoveSection: () => void;
}

export default function ImageSection({
  mediaItems,
  caption,
  description,
  isPublic,
  onCaptionChange,
  onDescriptionChange,
  onPublicChange,
  onRemoveMedia,
  onOpenModal,
  onRemoveSection,
}: ImageSectionProps) {
  const isCaptionEmpty = caption.trim() === '';
  const isDescriptionEmpty = description.trim() === '';

  return (
    <Container maxWidth={false} sx={{ maxWidth: '95% !important', p: 0 }}>
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2}>
          {/* Área da Imagem */}
          <Grid item xs={12} md={6}>
            <ImageItem mediaItems={mediaItems} onRemoveMedia={onRemoveMedia} />
          </Grid>

          {/* Área de Texto */}
          <Grid item xs={12} md={6}>
            <CardContent sx={{ p: 0 }}>
              <TextField
                fullWidth
                label="Título/Legenda da seção"
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                error={isCaptionEmpty}
                helperText={isCaptionEmpty ? 'A legenda da seção é obrigatória.' : ''}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Descrição da seção"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                multiline
                rows={3}
                error={isDescriptionEmpty}
                helperText={isDescriptionEmpty ? 'A descrição da seção é obrigatória.' : ''}
                margin="normal"
              />

              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch checked={isPublic} onChange={(e) => onPublicChange(e.target.checked)} />
                }
                label="Seção pública"
              />

              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" onClick={onOpenModal}>
                  + Imagem
                </Button>
                <Button variant="outlined" color="error" onClick={onRemoveSection}>
                  Excluir Seção
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
