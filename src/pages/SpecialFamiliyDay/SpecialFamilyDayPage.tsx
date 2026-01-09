import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import api from '@/config/axiosConfig';
import { WeekMaterialPageData } from '@/store/slices/week-material/weekMaterialSlice';
import { MediaItem } from 'store/slices/types';
import MediaDocumentPreviewModal from '@/utils/MediaDocumentPreviewModal';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';

import BadgeIcon from '@mui/icons-material/Badge';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GroupsIcon from '@mui/icons-material/Groups';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WeekVideoPlayer from '../PageView/WeekMaterialViewPage/WeekVideoPlayerView';

const theme = createTheme({
  palette: {
    primary: { main: '#388E3C' },
    secondary: { main: '#FF6F00' },
    background: { default: '#F5F6F5' },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif" },
    h2: { fontFamily: "'Playfair Display', serif" },
    h4: { fontFamily: "'Playfair Display', serif" },
  },
});

const programIcons = [
  <BadgeIcon key="badge" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <VolunteerActivismIcon key="volunteer" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <GroupsIcon key="groups" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <OndemandVideoIcon key="video" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <EmojiPeopleIcon key="emoji" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <SportsKabaddiIcon key="sports" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <MusicNoteIcon key="music" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <MenuBookIcon key="book" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <RestaurantIcon key="restaurant" sx={{ color: '#FF6F00', fontSize: 32 }} />,
  <CardGiftcardIcon key="gift" sx={{ color: '#FF6F00', fontSize: 32 }} />,
];

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        right: 20,
        transform: 'translateY(-50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.95)',
          transform: 'translateY(-50%) scale(1.1)',
        },
        zIndex: 2,
      }}
    >
      <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#388E3C' }}>›</Typography>
    </Box>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        left: 20,
        transform: 'translateY(-50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.95)',
          transform: 'translateY(-50%) scale(1.1)',
        },
        zIndex: 2,
      }}
    >
      <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#388E3C' }}>‹</Typography>
    </Box>
  );
};

const SpecialFamilyDayPage: React.FC = () => {
  const [data, setData] = useState<WeekMaterialPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const defaultSectionId = import.meta.env.VITE_SPECIAL_FAMILY_DAY_ID || '';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get<WeekMaterialPageData>(
          `/week-material-pages/${defaultSectionId}`
        );
        setData(response.data);
      } catch {
        setError('Erro ao carregar dados do Dia Especial da Família.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, mt: 6, pb: 6 }}>
        <Box
          component={motion.section}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
            py: { xs: 8, sm: 10 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg" sx={{ width: '95%', px: { xs: 2, sm: 4 } }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              sx={{
                color: '#fff',
                textShadow: '2px 2px 8px rgba(0,0,0,0.4)',
                mb: 2,
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              fontWeight={500}
              sx={{ color: '#E8F5E9', fontSize: { xs: '1rem', sm: '1.5rem' } }}
            >
              Família um projeto de Deus
            </Typography>
          </Container>
        </Box>

        <Container maxWidth={false} sx={{ width: '95%', py: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {[
              { icon: <CalendarMonthIcon />, label: 'Data', value: '09/08/2025', color: '#FF8A65' },
              {
                icon: <AccessTimeIcon />,
                label: 'Horário',
                value: '14h às 15h30',
                color: '#4FC3F7',
              },
              {
                icon: <PlaceIcon />,
                label: 'Local',
                value: 'No seu Clubinho Bíblico',
                color: '#81C784',
              },
            ].map((info, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    height: { xs: 120, sm: 140, md: 160 },
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: info.color,
                    color: '#fff',
                  }}
                >
                  <Box sx={{ fontSize: { xs: 24, sm: 30, md: 36 }, mb: 1 }}>{info.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {info.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {info.value}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" sx={{ my: 6 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={theme.palette.primary.main}
              sx={{ mb: 2, fontSize: { xs: '1.3rem', sm: '2rem' } }}
            >
              O que vai acontecer?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mx: 'auto',
                minWidth: { xs: '95%', md: '80%' },
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                color: '#555',
              }}
            >
              {data.subtitle}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              color={theme.palette.primary.main}
              sx={{ mb: 4, fontSize: { xs: '1.3rem', sm: '2rem' } }}
            >
              Programação do Dia
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {[
                'Recepção e crachás',
                'Boas-vindas e oração',
                'Apresentação do Clubinho',
                'Vídeo convite do Clubão',
                'Declaração das crianças',
                'Brincadeira pais e filhos',
                'Música especial',
                'História bíblica + Versículo',
                'Lanche e oração',
                'Sorteio e encerramento',
              ].map((item, idx) => (
                <Grid key={idx} item xs={12} sm={6} md={4}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      textAlign: 'center',
                      backgroundColor: idx % 2 === 0 ? '#E8F5E9' : '#FFF3E0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    }}
                  >
                    {programIcons[idx]}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                      {idx + 1}. {item}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {data.images.length > 0 && (
            <Box sx={{ mb: 6, minHeight: { xs: 400, md: 550 } }}>
              <Grid container spacing={4} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={7}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      mb: 2,
                      textAlign: { xs: 'center', md: 'left' },
                      color: theme.palette.primary.main,
                      fontSize: { xs: '1.3rem', sm: '2rem' },
                    }}
                  >
                    Momentos Especiais
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                      color: '#555',
                      textAlign: { xs: 'center', md: 'left' },
                    }}
                  >
                    {data.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Slider
                    dots
                    infinite
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay
                    autoplaySpeed={2000}
                    arrows
                    nextArrow={<NextArrow />}
                    prevArrow={<PrevArrow />}
                  >
                    {data.images.map((img) => (
                      <Box
                        key={img.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          px: 2,
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '450px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            marginBottom: '10px',
                          }}
                        />

                        {img.description && (
                          <Typography
                            variant="body2"
                            sx={{
                              textAlign: 'center',
                              fontSize: { xs: '0.85rem', sm: '0.95rem' },
                              color: '#555',
                              maxWidth: '90%',
                            }}
                          >
                            {img.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Slider>
                </Grid>
              </Grid>
            </Box>
          )}

          {data.videos.length > 0 && (
            <Box sx={{ mb: 6, width: '95%', mx: 'auto' }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                color={theme.palette.primary.main}
                sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                Vídeos Especiais
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                {data.videos.map((video) => (
                  <Grid key={video.id} item xs={12} sm={6} md={4}>
                    <WeekVideoPlayer video={video} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {data.documents.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                color={theme.palette.primary.main}
                sx={{ mb: 3, fontSize: { xs: '1.3rem', sm: '2rem' } }}
              >
                Materiais para Download
              </Typography>
              <Grid container spacing={3}>
                {data.documents.map((doc) => (
                  <Grid key={doc.id} item xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        borderRadius: 3,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedMedia(doc);
                            setPreviewOpen(true);
                          }}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          href={doc.url}
                          target="_blank"
                        >
                          Baixar
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 5 }} />
          <Typography
            variant="h6"
            textAlign="center"
            fontStyle="italic"
            sx={{
              color: theme.palette.primary.main,
              maxWidth: 800,
              mx: 'auto',
              p: 2,
              backgroundColor: '#E8F5E9',
              borderRadius: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            “Eu e minha casa serviremos ao Senhor.” – Josué 24:15
          </Typography>
        </Container>

        <MediaDocumentPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          media={selectedMedia}
          title={selectedMedia?.title}
        />
      </Box>
    </ThemeProvider>
  );
};

export default SpecialFamilyDayPage;
