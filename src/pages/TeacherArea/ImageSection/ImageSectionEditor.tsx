import { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { AddImageModal } from './AddImageModal';
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { MediaItem } from '@/store/slices/types';

interface ImageSectionEditorProps {
  isEditMode?: boolean;
  initialCaption: string;
  initialDescription: string;
  initialIsPublic: boolean;
  initialMediaItems: MediaItem[];
  onChange: (updatedData: Partial<SectionData>) => void;
  captionPlaceholder?: string;
  descriptionPlaceholder?: string;
}

export default function ImageSectionEditor({
  isEditMode,
  initialCaption,
  initialDescription,
  initialIsPublic,
  initialMediaItems,
  onChange,
  captionPlaceholder = 'Clubinho 90: Gincana de Páscoa',
  descriptionPlaceholder = 'Descreva o que aconteceu, como uma gincana, culto especial ou passeio com as crianças.',
}: ImageSectionEditorProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMediaItems);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCaption(newValue);
    onChange({ caption: newValue });
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setDescription(newValue);
    onChange({ description: newValue });
  };

  const handlePublicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setIsPublic(value);
    onChange({ public: value });
  };

  const handleAddMedia = (newMedia: MediaItem[]) => {
    const updated = [...mediaItems, ...newMedia];
    setMediaItems(updated);
    onChange({ mediaItems: updated });
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updated);
    onChange({ mediaItems: updated });
  };

  return (
    <Grid container spacing={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
      <Grid item xs={12} md={4.8}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            label="Título"
            value={caption}
            onChange={handleCaptionChange}
            placeholder={captionPlaceholder}
            variant="outlined"
            required
          />

          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={handleDescriptionChange}
            placeholder={descriptionPlaceholder}
            variant="outlined"
            multiline
            rows={4}
            required
          />

         {isEditMode &&  <FormControlLabel
            control={
              <Switch checked={isPublic} onChange={handlePublicChange} color="primary" />
            }
            label={isPublic ? 'Público' : 'Privado'}
          />}
        </Box>
      </Grid>

      <Grid item xs={12} md={7.2}>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsModalOpen(true)}
            sx={{ mb: 2 }}
          >
            Adicionar Imagem
          </Button>

          {mediaItems.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              style={{ padding: '16px 0', width: '100%', margin: '0 auto' }}
            >
              {mediaItems.map((media, index) => (
                <SwiperSlide key={media.id || index}>
                  <Box position="relative" height="400px">
                    <img
                      src={
                        media.isLocalFile && media.file
                          ? URL.createObjectURL(media.file)
                          : media.url
                      }
                      alt={media.title || 'Imagem'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveMedia(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              Adicione imagens do que aconteceu no seu clubinho para que todos possam ver!
            </Typography>
          )}
        </Box>
      </Grid>

      {/* Modal para adicionar imagens */}
      <AddImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMedia}
      />
    </Grid>
  );
}
