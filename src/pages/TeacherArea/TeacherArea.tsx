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
  CircularProgress,
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
import { MediaTargetType } from 'store/slices/types';
import InformativeBanner from './InformativeBanner';
import ButtonSection from './FofinhoButton';

// Define interfaces for types
interface Route {
  entityType: string;
  current?: boolean;
  path: string;
}

interface BannerSectionProps {
  showWeekBanner: boolean;
  showMeditationBanner: boolean;
}

interface MotivationSectionProps {
  motivationText: string;
}

interface TeacherContentProps {
  userName?: string;
}

// Componente para os banners de semana e meditação
const BannerSection: React.FC<BannerSectionProps> = ({ showWeekBanner, showMeditationBanner }) => {
  const activeBanners = [showWeekBanner, showMeditationBanner].filter(Boolean).length;

  return (
    <Grid container spacing={2} sx={{ mb: 6, mt: 3, justifyContent: 'space-between' }}>
      {activeBanners === 0 ? (
        <Grid item xs={12}>
          <Box
            sx={{
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
        </Grid>
      ) : (
        <>
          {showWeekBanner && (
            <Grid item xs={12} md={activeBanners === 1 ? 12 : 6}>
              <TeacherWeekBanner />
            </Grid>
          )}
          {showMeditationBanner && (
            <Grid item xs={12} md={activeBanners === 1 ? 12 : 6}>
              <TeacherMeditationBanner />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

// Componente para a seção de motivação
const MotivationSection: React.FC<MotivationSectionProps> = ({ motivationText }) => (
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
    <Box sx={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
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
        sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, color: '#424242' }}
      >
        {motivationText}
      </Typography>
    </Box>
  </Paper>
);

// Componente para a área do professor
const TeacherContent: React.FC<TeacherContentProps> = ({ userName }) => (
  <Box>
    <Box textAlign="center" mb={4}>
      <Typography
        variant="h6"
        gutterBottom
        color="#616161"
        sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' } }}
      >
        Olá, {userName || 'Professor'}!
      </Typography>
      <Box maxWidth="800px" mx="auto">
        <Typography
          variant="body1"
          gutterBottom
          color="#757575"
          sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' } }}
        >
          Bem-vindo à sua central de apoio pedagógico. Explore recursos atualizados semanalmente e
          enriqueça suas aulas!
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
        <Grid item xs={12} sm={6} md={4} key={index}>
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

    <Box sx={{ mt: 6 }}>
      <DocumentsSection />
    </Box>

    <Box sx={{ mt: 6 }}>
      <IdeasGallerySection />
    </Box>

    <Box sx={{ mt: 6 }}>
      <TrainingVideosSection />
    </Box>

    <Box sx={{ mt: 6 }}>
      <CommentsSection />
    </Box>
  </Box>
);

const TeacherArea: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentWeekRoute = routes.find(
    (route: Route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current
  );
  const meditationDay = routes.find(
    (route: Route) =>
      route.entityType === 'MeditationDay' &&
      route.path.toLowerCase().includes(weekdayName)
  );

  const showWeekBanner = !!currentWeekRoute;
  const showMeditationBanner = !!meditationDay;

  const motivacaoEvangelismo =
    '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com alguém da sua comunidade? Uma conversa, uma visita, uma oração... cada gesto conta!';

  return (
    <Container
      maxWidth={false}
      sx={{ width: '100%', mt: 10, mb: 8, mx: 0, px: { xs: 2, md: 4 }, bgcolor: '#f5f7fa' }}
    >
      <InformativeBanner />
      <BannerSection showWeekBanner={showWeekBanner} showMeditationBanner={showMeditationBanner} />
      <ButtonSection />
      <MotivationSection motivationText={motivacaoEvangelismo} />
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#424242"
          gutterBottom
          sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}
        >
          Área do Professor
        </Typography>
        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />
        {isAuthenticated ? (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TeacherContent userName={user?.name} />
          )
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