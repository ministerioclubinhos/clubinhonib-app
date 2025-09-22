import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Modal, 
  IconButton, 
  Tooltip, 
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Badge,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import CloseIcon from '@mui/icons-material/Close';
import DriveIcon from '@mui/icons-material/Google';
import CloudIcon from '@mui/icons-material/CloudQueue';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import ScheduleIcon from '@mui/icons-material/Schedule';
import UpdateIcon from '@mui/icons-material/Update';
import { MediaPlatform, MediaItem } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import type { SectionData } from 'store/slices/image/imageSlice';
import { motion } from 'framer-motion';

export interface SectionItemProps extends Omit<SectionData, 'id' | 'public'> {}

const formatDateTime = (value: string | Date) => {
  const date = new Date(value);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return {
    date: `${day} de ${month} de ${year}`,
    time: `${hours}:${minutes}`,
  };
};

const getPlatformIcon = (platform?: MediaPlatform | string) => {
  switch (platform) {
    case MediaPlatform.GOOGLE_DRIVE:
      return <DriveIcon fontSize="small" />;
    case MediaPlatform.ONEDRIVE:
    case MediaPlatform.DROPBOX:
      return <CloudIcon fontSize="small" />;
    default:
      return <FolderIcon fontSize="small" />;
  }
};

const ImageWithSkeleton: React.FC<{ src: string; alt: string; sx?: any; onClick?: () => void }> = ({
  src,
  alt,
  sx,
  onClick,
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <Box sx={{ position: 'relative' }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          sx={{
            ...sx,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        sx={{
          ...sx,
          visibility: loaded ? 'visible' : 'hidden',
        }}
      />
    </Box>
  );
};

const SectionImagePageView: React.FC<SectionItemProps> = ({
  caption,
  description,
  mediaItems,
  createdAt,
  updatedAt,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!mediaItems || mediaItems.length === 0) return null;

  const created = createdAt ? formatDateTime(createdAt) : null;
  const updated = updatedAt ? formatDateTime(updatedAt) : null;

  const handleImageClick = (index: number) => {
    setStartIndex(index);
    setOpenModal(true);
  };

  const thumbnails = showAll ? mediaItems.slice(1) : mediaItems.slice(1, 7);
  const heroSrc = getMediaPreviewUrl(mediaItems[0] as MediaItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ marginBottom: theme.spacing(4) }}
    >
      <Card
        elevation={6}
        sx={{
          borderRadius: { xs: 3, md: 4 },
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          border: `2px solid ${theme.palette.success.main}20`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            elevation: 12,
            transform: 'translateY(-4px)',
            borderColor: theme.palette.success.main,
            boxShadow: `0 20px 40px ${theme.palette.success.main}20`,
          },
        }}
      >
        {/* Header com Avatar e Info */}
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, pb: 2 }}>
          <Box 
            display="flex" 
            alignItems="flex-start" 
            gap={{ xs: 2, sm: 3 }} 
            mb={{ xs: 2, sm: 3 }}
            flexDirection={{ xs: 'column', sm: 'row' }}
          >
            <Box 
              display="flex" 
              alignItems="center" 
              gap={{ xs: 2, sm: 3 }}
              width={{ xs: '100%', sm: 'auto' }}
            >
              <Avatar
                sx={{
                  width: { xs: 40, sm: 48, md: 56 },
                  height: { xs: 40, sm: 48, md: 56 },
                  bgcolor: 'success.main',
                  boxShadow: 3,
                }}
              >
                <ImageIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' } }} />
              </Avatar>
            
              <Box flex={1}>
                <Box 
                  display="flex" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }} 
                  gap={{ xs: 1, sm: 2 }} 
                  mb={1}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="success.main"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                      lineHeight: { xs: 1.2, md: 1.3 },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    {caption}
                  </Typography>
                  <Badge
                    badgeContent={mediaItems.length}
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <Chip
                      label="Imagens"
                      size="small"
                      sx={{
                        bgcolor: 'success.light',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                  </Badge>
                </Box>

                {description && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      lineHeight: { xs: 1.4, md: 1.6 },
                      mb: { xs: 1.5, md: 2 },
                    }}
                  >
                    {description}
                  </Typography>
                )}

                {/* Metadata com ícones */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
                  {created && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {created.date} às {created.time}
                      </Typography>
                    </Box>
                  )}
                  {updated && updated.date !== created?.date && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <UpdateIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {updated.date} às {updated.time}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>

        {/* Hero Image com efeito parallax */}
        {heroSrc && (
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <CardMedia
                component="img"
                image={heroSrc}
                alt={caption || 'Imagem principal'}
                onClick={() => handleImageClick(0)}
                sx={{
                  height: { xs: 250, sm: 350, md: 450 },
                  objectFit: 'cover',
                  cursor: 'pointer',
                  transition: 'transform 0.6s ease',
                }}
              />
            </motion.div>
            
            {/* Overlay gradient */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                pointerEvents: 'none',
              }}
            />
          </Box>
        )}

        {/* Thumbnails Grid com hover effects */}
        {thumbnails.length > 0 && (
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={1.5}>
              {thumbnails.map((item, index) => {
                const src = getMediaPreviewUrl(item as MediaItem);
                const actualIndex = index + 1;
                
                return (
                  <Grid item xs={4} sm={2} md={2} key={item.id || index}>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: { xs: 2, md: 3 },
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transform: hoveredImage === actualIndex ? 'scale(1.05)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseEnter={() => setHoveredImage(actualIndex)}
                        onMouseLeave={() => setHoveredImage(null)}
                      >
                        <ImageWithSkeleton
                          src={src || ''}
                          alt={`${caption} - ${actualIndex + 1}`}
                          onClick={() => handleImageClick(actualIndex)}
                          sx={{
                            width: '100%',
                            height: { xs: 70, sm: 90, md: 110 },
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        
                        {/* Platform Icon com animação */}
                        <motion.div
                          animate={{ 
                            scale: hoveredImage === actualIndex ? 1.2 : 1,
                            rotate: hoveredImage === actualIndex ? 5 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              borderRadius: 1,
                              p: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              backdropFilter: 'blur(4px)',
                            }}
                          >
                            {getPlatformIcon((item as any).platformType)}
                          </Box>
                        </motion.div>

                        {/* Hover overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredImage === actualIndex ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(76, 175, 80, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            }}
                          >
                            Ver Imagem
                          </Typography>
                        </motion.div>
                      </Box>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>

            {mediaItems.length > 7 && !showAll && (
              <Box textAlign="center" mt={3}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="button"
                    color="primary"
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      fontWeight: 'bold',
                    }}
                    onClick={() => setShowAll(true)}
                  >
                    Ver todas as {mediaItems.length} imagens
                  </Typography>
                </motion.div>
              </Box>
            )}
          </CardContent>
        )}

        {/* Modal com Swiper melhorado */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                width: '90vw',
                height: '90vh',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <IconButton
                onClick={() => setOpenModal(false)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  zIndex: 10,
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>

              <Swiper
                modules={[Navigation, Pagination, EffectCoverflow]}
                navigation
                pagination={{ clickable: true }}
                effect="coverflow"
                coverflowEffect={{
                  rotate: 50,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: true,
                }}
                initialSlide={startIndex}
                style={{ width: '100%', height: '100%' }}
              >
                {mediaItems.map((item, index) => {
                  const src = getMediaPreviewUrl(item as MediaItem);
                  return (
                    <SwiperSlide key={item.id || index}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src={src || ''}
                          alt={`${caption} - ${index + 1}`}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </Box>
          </motion.div>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default SectionImagePageView;