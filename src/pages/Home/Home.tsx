import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/slices';
import banner from '../../assets/banner.jpg';
import WeekMaterialsBanner from './WeekMaterialsBanner';
import CardsSection from './CardsSection';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import api from '../../config/axiosConfig';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { setComments } from 'store/slices/comment/commentsSlice';

const Home: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const comments = useSelector((state: RootState) => state.comments.comments);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get('/comments/published');
        dispatch(setComments(response.data));
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
      }
    };
    fetchComments();
  }, [dispatch]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #ffffff, #e3f2fd)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '60vh', sm: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={banner}
          alt="Banner Clubinho NIB"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            px: { xs: 3, sm: 4, md: 6 },
            maxWidth: { xs: '90%', sm: '800px', md: '1000px' },
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: '#FFD700',
              textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)',
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            }}
          >
            Bem-vindo ao Clubinho NIB
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#FFFFFF',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2rem' },
              mb: 4,
            }}
          >
            Ministério de evangelismo que leva a palavra de Deus para as crianças que precisam
            conhecer o amor de Jesus.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated && (
              <Button
                variant="contained"
                component={Link}
                to="/area-do-professor"
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#C62828',
                    color: '#fff',
                  },
                }}
              >
                Área do Professor
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {isAuthenticated && <WeekMaterialsBanner />}
      <CardsSection />

      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          sx={{ color: '#1e73be', mb: 6, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
        >
          Por que o Clubinho NIB?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              icon: <SchoolIcon sx={{ fontSize: 50, color: '#1e73be' }} />,
              title: 'Recursos Educacionais',
              description:
                'Materiais semanais alinhados ao evangelismo infantil, prontos para suas aulas.',
            },
            {
              icon: <GroupIcon sx={{ fontSize: 50, color: '#1e73be' }} />,
              title: 'Comunidade de Professores',
              description:
                'Conecte-se com outros educadores, compartilhe ideias e cresça em sua missão.',
            },
            {
              icon: <LightbulbIcon sx={{ fontSize: 50, color: '#1e73be' }} />,
              title: 'Atividades Criativas',
              description:
                'Sugestões de atividades que tornam o ensino bíblico divertido e impactante.',
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" color="#000000" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="#757575">
                    {item.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {comments && comments.length > 0 && (
        <Box sx={{ bgcolor: '#f5f7fa', py: { xs: 4, md: 8 }, width: '100%' }}>
          <Container>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              sx={{ color: '#1e73be', mb: 6, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
            >
              O que dizem sobre o Clubinho
            </Typography>
            <Slider {...sliderSettings}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ px: 2 }}>
                  <Card
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      bgcolor: '#FFFFFF', // Branco
                    }}
                  >
                    <Typography variant="body1" color="#757575" sx={{ mb: 3 }}>
                      "{comment.comment}"
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="#000000">
                      {comment.name}
                    </Typography>
                    <Typography variant="body2" color="#757575">
                      {comment.clubinho} - {comment.neighborhood}
                    </Typography>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Container>
        </Box>
      )}

      <Box sx={{ py: { xs: 4, md: 8 }, width: '100%', textAlign: 'center' }}>
        <Container>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: '#1e73be', mb: 4, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Junte-se ao Clubinho NIB
          </Typography>
          <Typography
            variant="h6"
            color="#757575" // Cinza médio
            mb={4}
            sx={{ maxWidth: '600px', mx: 'auto', fontSize: { xs: '1rem', md: '1.5rem' } }}
          >
            Faça parte da nossa missão de levar o amor de Jesus às crianças com recursos criativos e apoio pedagógico.
          </Typography>
          {isAuthenticated ? (
            <Button
              variant="contained"
              component={Link}
              to="/area-do-professor"
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#C62828',
                  color: '#fff',
                },
              }}
            >
              Explorar Recursos
            </Button>
          ) : (
            <Button
              variant="contained"
              component={Link}
              to="/contato"
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#C62828',
                  color: '#fff',
                },
              }}
            >
              Entre em Contato
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home;


;