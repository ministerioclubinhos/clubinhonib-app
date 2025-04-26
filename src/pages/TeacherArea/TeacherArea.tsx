import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/slices';
import TeacherWeekBanner from './TeacherWeekBanner';
import TeacherMeditationBanner from './TeacherMeditationBanner';
import { setMeditationData, MeditationData } from '../../store/slices/meditation/meditationSlice';
import { fetchCurrentWeekMaterial } from '../../store/slices/week-material/weekMaterialSlice';
import { motion } from 'framer-motion';
import CommentsSection from './CommentsSection';
import TrainingVideosSection from './TrainingVideosSection';
import DocumentsSection from './DocumentsSection';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import api from '../../config/axiosConfig';
import IdeasGallerySection from './IdeasGallerySection';

const TeacherArea: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const meditationData = useSelector((state: RootState) => state.meditation.meditationData);
  const currentMaterialWeek = useSelector(
    (state: RootState) => state.weekMaterial.weekMaterialSData
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const meditations = await api.get('/meditations/this-week');
        if (meditations.data.meditation) {
          dispatch(setMeditationData(meditations.data.meditation as MeditationData));
        }
        await dispatch(fetchCurrentWeekMaterial());
      } catch (error) {
        console.error('Erro ao buscar dados da área do professor:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch]);

  const motivacaoEvangelismo =
    '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com alguém da sua comunidade? Uma conversa, uma visita, uma oração... cada gesto conta!';

  if (loading) {
    return (
      <Box sx={{ mt: 20, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{ width: '100%', mt: 10, mb: 8, mx: 0, px: 0, bgcolor: '#f5f7fa' }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 6 }}>
        {currentMaterialWeek && currentMaterialWeek.title && currentMaterialWeek.route.path && (
          <Box sx={{ flex: 1 }}>
            <TeacherWeekBanner
              title={currentMaterialWeek.title}
              subtitle={currentMaterialWeek.subtitle}
              linkTo={`/${currentMaterialWeek.route.path}`}
            />
          </Box>
        )}
        {meditationData && meditationData.days && meditationData.days.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <TeacherMeditationBanner meditation={meditationData} />
          </Box>
        )}
      </Box>

      <Paper
        elevation={2}
        sx={{
          backgroundColor: '#e3f2fd',
          p: { xs: 2, md: 3 },
          mb: 5,
          borderLeft: '6px solid #2196f3',
          borderRadius: 2,
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold" color="#2196f3" gutterBottom>
            ✨ Motivação para Evangelizar
          </Typography>
          <Typography variant="body1" textAlign="center">
            {motivacaoEvangelismo}
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          p: { xs: 1, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#424242" gutterBottom>
          Área do Professor
        </Typography>
        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {isAuthenticated ? (
          <Box>
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h6"
                gutterBottom
                color="#616161"
                sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' } }}
              >
                Olá, {user?.name || 'Professor'}!
              </Typography>
              <Box maxWidth="800px" mx="auto">
                <Typography
                  variant="body1"
                  gutterBottom
                  color="#757575"
                  sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }}
                >
                  Bem-vindo à sua central de apoio pedagógico. Explore recursos atualizados
                  semanalmente e enriqueça suas aulas!
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    sx={{
                      borderLeft: '5px solid #4caf50',
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#424242">
                          Objetivos da Área
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Materiais alinhados ao calendário semanal." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Conteúdos por faixa etária e tema." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Apoio didático e sugestões de atividades." />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    sx={{
                      borderLeft: '5px solid #f44336',
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InfoIcon sx={{ color: '#f44336', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#424242">
                          Orientações
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Acesse o banner semanal para o tema atual." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Adapte os materiais à sua turma." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Compartilhe ideias com outros professores." />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    sx={{
                      borderLeft: '5px solid #ff9800',
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LightbulbIcon sx={{ color: '#ff9800', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#424242">
                          Dicas Rápidas
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Prepare a aula com antecedência." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Reforce valores bíblicos de forma criativa." />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Crie um ambiente acolhedor." />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
            <DocumentsSection />
            <IdeasGallerySection />
            <TrainingVideosSection />
            <CommentsSection />
          </Box>
        ) : (
          <Typography variant="body1" color="#757575">
            Você precisa estar logado para acessar esta área.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default TeacherArea;
