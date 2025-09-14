import React, { Fragment } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/slices';
import TeacherWeekBanner from './TeacherWeekBanner';
import TeacherMeditationBanner from './TeacherMeditationBanner';
import { motion } from 'framer-motion';
import CommentsSection from './CommentsSection';
import TrainingVideosSection from './TrainingVideosSection';
import DocumentsSection from './DocumentsSection';
import IdeasGallerySection from './IdeasGallerySection';
import InformativeBanner from './InformativeBanner';
import ButtonSection from './FofinhoButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { MediaTargetType } from 'store/slices/types';

const SpecialFamilyCallout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      component="section"
      sx={{
        background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        mb: 6,
        mt: 4,
      }}
    >
      <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          color="#fff"
          sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          Dia Especial da Família
        </Typography>
        <Typography
          variant="subtitle1"
          color="rgba(255,255,255,0.9)"
          sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
        >
          Um momento único para pais e crianças aprenderem e curtirem o Clubinho juntos.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/dia-especial-familia')}
        sx={{
          backgroundColor: '#fff',
          color: '#66BB6A',
          fontSize: { xs: '1rem', md: '1.25rem' },
          px: { xs: 3, md: 4 },
          py: { xs: 1.5, md: 2 },
          '&:hover': { backgroundColor: '#ffe0b2' },
        }}
      >
        Saiba mais
      </Button>
    </Box>
  );
};

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

const BannerSection: React.FC<BannerSectionProps> = ({ showWeekBanner, showMeditationBanner }) => {
  const activeCount = [showWeekBanner, showMeditationBanner].filter(Boolean).length;

  return (
    <Grid container spacing={2} sx={{ mb: 6, mt: 0,pt:0, justifyContent: 'space-between' }}>
      {activeCount === 0 ? (
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum banner disponível no momento.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Verifique novamente mais tarde ou acesse a lista de materiais semanais.
            </Typography>
          </Paper>
        </Grid>
      ) : (
        <Fragment>
          {showWeekBanner && (
            <Grid item xs={12} md={activeCount === 1 ? 12 : 6}>
              <TeacherWeekBanner />
            </Grid>
          )}
          {showMeditationBanner && (
            <Grid item xs={12} md={activeCount === 1 ? 12 : 6}>
              <TeacherMeditationBanner />
            </Grid>
          )}
        </Fragment>
      )}
    </Grid>
  );
};

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
    <Box maxWidth="800px" mx="auto" textAlign="center">
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

const TeacherContent: React.FC<TeacherContentProps> = ({ userName }) => (
  <Box>
    <Box textAlign="center" mb={4}>
      <Typography
        variant="h6"
        color="#616161"
        gutterBottom
        sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' } }}
      >
        Olá, {userName || 'Professor'}!
      </Typography>
      <Typography
        variant="body1"
        color="#757575"
        gutterBottom
        sx={{ maxWidth: '800px', mx: 'auto', fontSize: { xs: '0.95rem', md: '1.1rem' } }}
      >
        Bem-vindo à sua central de apoio pedagógico. Explore recursos atualizados semanalmente e enriqueça
        suas aulas!
      </Typography>
    </Box>

    <Grid container spacing={3} sx={{ mt: 4 }}>
      {[
        {
          icon: <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />,
          title: 'Objetivos da Área',
          items: [
            'Materiais alinhados ao calendário semanal.',
            'Conteúdos por faixa etária e tema.',
            'Apoio didático e sugestões de atividades.',
          ],
        },
        {
          icon: <InfoIcon sx={{ color: '#f44336', mr: 1 }} />,
          title: 'Orientações',
          items: [
            'Acesse o banner semanal para o tema atual.',
            'Adapte os materiais à sua turma.',
            'Compartilhe ideias com outros professores.',
          ],
        },
        {
          icon: <LightbulbIcon sx={{ color: '#ff9800', mr: 1 }} />,
          title: 'Dicas Rápidas',
          items: [
            'Prepare a aula com antecedência.',
            'Reforce valores bíblicos de forma criativa.',
            'Crie um ambiente acolhedor.',
          ],
        },
      ].map((section, idx) => (
        <Grid key={idx} item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Card
              sx={{
                borderLeft: `5px solid ${section.icon.props.sx.color}`,
                height: '100%',
                boxShadow: 2,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {section.icon}
                  <Typography variant="h6" fontWeight="bold" color="#424242">
                    {section.title}
                  </Typography>
                </Box>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {section.items.map((item: string, idy: number) => (
                    <li key={idy}>
                      <Typography variant="body2">{item}</Typography>
                    </li>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>

    <Box mt={6}>
      <DocumentsSection />
    </Box>
    <Box mt={6}>
      <IdeasGallerySection />
    </Box>
    <Box mt={6}>
      <TrainingVideosSection />
    </Box>
    <Box mt={6}>
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
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const showWeek = routes.some(
    (r) => r.entityType === MediaTargetType.WeekMaterialsPage && r.current
  );
  const showMeditation = routes.some(
    (r) => r.entityType === 'MeditationDay' && r.path.toLowerCase().includes(weekday)
  );

  const motivacao =
    '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com alguém da sua comunidade?';

  return (
    <Container
      maxWidth={false}
      sx={{ width: '100%', mt: 3, mb: 8, px: { xs: 2, md: 4 }, bgcolor: '#f5f7fa' }}
    >
      <InformativeBanner />

      {/* <SpecialFamilyCallout /> */}

      <BannerSection showWeekBanner={showWeek} showMeditationBanner={showMeditation} />

      <ButtonSection references={['materials', 'childrenArea', 'photos', 'rate', 'events', 'help']} />

      <MotivationSection motivationText={motivacao} />

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
            <Box display="flex" justifyContent="center" py={4}>
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
