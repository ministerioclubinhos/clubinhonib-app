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
  Paper,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { AddImageModal } from '../components/Modals';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <Box>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Formulário - Mobile First */}
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  mb: 2,
                  color: 'primary.main',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}
              >
                📝 Informações da Galeria
              </Typography>

              <Box display="flex" flexDirection="column" gap={{ xs: 1.5, md: 2 }}>
                <TextField
                  fullWidth
                  label="Título da Galeria"
                  value={caption}
                  onChange={handleCaptionChange}
                  placeholder={captionPlaceholder}
                  variant="outlined"
                  required
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Descrição"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder={descriptionPlaceholder}
                  variant="outlined"
                  multiline
                  rows={isMobile ? 3 : 4}
                  required
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isPublic}
                          onChange={handlePublicChange}
                          color="primary"
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            fontWeight: 500,
                          }}
                        >
                          {isPublic ? '🌐 Público' : '🔒 Privado'}
                        </Typography>
                      }
                      sx={{ mt: 1 }}
                    />
                  </motion.div>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Galeria de Imagens - Mobile First */}
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff5f8 0%, #fef7ff 100%)',
                border: '1px solid rgba(118, 75, 162, 0.1)',
                minHeight: { xs: 300, md: 400 },
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 1, sm: 0 }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    color: 'primary.main',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  🖼️ Galeria de Imagens
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsModalOpen(true)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    borderRadius: 2,
                    px: { xs: 2, md: 3 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  📸 Adicionar Imagens
                </Button>
              </Box>

              {mediaItems.length > 0 ? (
                <Box sx={{ position: 'relative' }}>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={isMobile ? 10 : 20}
                    slidesPerView={1}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    style={{
                      padding: isMobile ? '8px 0 40px' : '16px 0 50px',
                      width: '100%',
                      margin: '0 auto',
                      borderRadius: 12,
                    }}
                  >
                    {mediaItems.map((media, index) => (
                      <SwiperSlide key={media.id || index}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            position="relative"
                            height={{ xs: 250, sm: 300, md: 350 }}
                            sx={{
                              borderRadius: 3,
                              overflow: 'hidden',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            }}
                          >
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
                                objectFit: 'cover',
                              }}
                            />
                            <IconButton
                              onClick={() => handleRemoveMedia(index)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 1)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                              size={isMobile ? 'small' : 'medium'}
                            >
                              <DeleteIcon color="error" fontSize={isMobile ? 'small' : 'medium'} />
                            </IconButton>

                            {/* Overlay com número da imagem */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: { xs: '0.7rem', md: '0.8rem' },
                                fontWeight: 500,
                              }}
                            >
                              {index + 1} de {mediaItems.length}
                            </Box>
                          </Box>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <Box
                    className="swiper-button-prev"
                    sx={{
                      color: 'primary.main',
                      '&::after': {
                        fontSize: { xs: '16px', md: '20px' },
                      },
                    }}
                  />
                  <Box
                    className="swiper-button-next"
                    sx={{
                      color: 'primary.main',
                      '&::after': {
                        fontSize: { xs: '16px', md: '20px' },
                      },
                    }}
                  />
                </Box>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    textAlign="center"
                    py={4}
                    sx={{
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                      borderRadius: 3,
                      border: '2px dashed rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 500,
                      }}
                    >
                      📷 Adicione imagens dos momentos especiais do seu Clubinho!
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        mt: 1,
                        opacity: 0.7,
                      }}
                    >
                      Compartilhe a alegria com toda a comunidade
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <AddImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMedia}
      />
    </Box>
  );
}
