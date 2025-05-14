import React from 'react';
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
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import TeacherWeekBanner from './TeacherWeekBanner';
import TeacherMeditationBanner from './TeacherMeditationBanner';
import { motion } from 'framer-motion';
import CommentsSection from './CommentsSection';
import TrainingVideosSection from './TrainingVideosSection';
import DocumentsSection from './DocumentsSection';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import IdeasGallerySection from './IdeasGallerySection';
import { Link } from 'react-router-dom';
import { MediaTargetType } from 'store/slices/types';
import InformativeBanner from './InformativeBanner';

const TeacherArea: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const routes = useSelector((state: RootState) => state.routes.routes);

  const today = new Date();
  const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentWeekRoute = routes.find(
    (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current
  );

  const meditationDay = routes.find(
    (route) =>
      route.entityType === 'MeditationDay' &&
      route.path.toLowerCase().includes(weekdayName)
  );

  const showWeekBanner = !!currentWeekRoute;
  const showMeditationBanner = !!meditationDay;

  const activeBanners = [showWeekBanner, showMeditationBanner].filter(Boolean).length;

  const bannerStyles = {
    flex: {
      xs: '1 1 100%',
      md: activeBanners === 1 ? '1 1 100%' : '1 1 50%',
    },
    maxWidth: { xs: '100%', md: activeBanners === 1 ? '100%' : '50%' },
    mb: { xs: 2, md: 0 },
  };

  const motivacaoEvangelismo =
    '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com alguém da sua comunidade? Uma conversa, uma visita, uma oração... cada gesto conta!';

  return (
    <Container
      maxWidth={false}
      sx={{ width: '100%', mt: 10, mb: 8, mx: 0, px: { xs: 2, md: 4 }, bgcolor: '#f5f7fa' }}
    >
      <InformativeBanner />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 },
          mb: 6,
          mt: 3,
          justifyContent: 'space-between',
        }}
      >
        {activeBanners === 0 ? (
          <Box
            sx={{
              flex: '1 1 100%',
              textAlign: 'center',
              p: 3,
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Nenhum banner disponível no momento.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Verifique novamente mais tarde ou acesse a lista de materiais semanais.
            </Typography>
          </Box>
        ) : (
          <>

            {showWeekBanner && (
              <Box sx={bannerStyles}>
                <TeacherWeekBanner />
              </Box>
            )}
            {showMeditationBanner && (
              <Box sx={bannerStyles}>
                <TeacherMeditationBanner />
              </Box>
            )}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/lista-materias-semanais"
          sx={{
            px: { xs: 1, md: 4 },
            py: { xs: 1, md: 1.5 },
            fontWeight: 'bold',
            fontSize: { xs: '0.75rem', md: '1rem' },
            width: { xs: '100%', md: 'auto' },
            height: { xs: 40, md: 48 },
          }}
        >
          Ver Lista de Materiais Semanais
        </Button>

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
        <Box
          sx={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#2196f3"
            gutterBottom
            sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}
          >
            ✨ Motivação para Evangelizar
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              color: '#424242',
            }}
          >
            {motivacaoEvangelismo}
          </Typography>
        </Box>
      </Paper>


      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#424242" gutterBottom sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
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
              {[
                {
                  icon: <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />,
                  title: 'Objetivos da Área',
                  color: '#4caf50',
                  items: [
                    'Materiais alinhados ao calendário semanal.',
                    'Conteúdos por faixa etária e tema.',
                    'Apoio didático e sugestões de atividades.',
                  ],
                },
                {
                  icon: <InfoIcon sx={{ color: '#f44336', mr: 1 }} />,
                  title: 'Orientações',
                  color: '#f44336',
                  items: [
                    'Acesse o banner semanal para o tema atual.',
                    'Adapte os materiais à sua turma.',
                    'Compartilhe ideias com outros professores.',
                  ],
                },
                {
                  icon: <LightbulbIcon sx={{ color: '#ff9800', mr: 1 }} />,
                  title: 'Dicas Rápidas',
                  color: '#ff9800',
                  items: [
                    'Prepare a aula com antecedência.',
                    'Reforce valores bíblicos de forma criativa.',
                    'Crie um ambiente acolhedor.',
                  ],
                },
              ].map((section, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      sx={{
                        borderLeft: `5px solid ${section.color}`,
                        height: '100%',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.15)' },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {section.icon}
                          <Typography variant="h6" fontWeight="bold" color="#424242">
                            {section.title}
                          </Typography>
                        </Box>
                        <List dense>
                          {section.items.map((item, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
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