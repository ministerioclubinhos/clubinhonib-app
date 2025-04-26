import React, { useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card as MuiCard,
  CardContent,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import banner from '../../assets/banner.jpg';
import WeekBanner from '../../components/WeekBanner/WeekBanner';
import { AppDispatch, RootState as RootStateType } from '../../store/slices';
import { fetchCurrentWeekMaterial } from '../../store/slices/week-material/weekMaterialSlice';

interface CustomCardProps {
  title: string;
  description: string;
  image: string | null;
  link: string;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const CustomCard = ({ title, description, image, link }: CustomCardProps) => {
  const truncatedDescription =
    description && description.length > 60 ? `${description.slice(0, 57)}...` : (description ?? '');

  return (
    <StyledCard>
      <CardMedia component="img" height="200" image={image ?? ''} alt={title ?? 'Imagem do card'} />
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title ?? 'Sem título'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {truncatedDescription}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentWeekMaterial());
  }, [dispatch]);

  const { dynamicRoutes, isAuthenticated, routeLoading, weekMaterial, weekMaterialLoading } =
    useSelector((state: RootStateType) => ({
      dynamicRoutes: state.routes.routes,
      isAuthenticated: state.auth.isAuthenticated,
      routeLoading: state.routes.loading,
      weekMaterial: state.weekMaterial.weekMaterialSData,
      weekMaterialLoading: state.weekMaterial.loading,
    }));

  const feedImageGalleryId = process.env.REACT_APP_FEED_MINISTERIO_ID ?? '';

  const filteredCards = useMemo(() => {
    return dynamicRoutes.filter(
      (card) =>
        (isAuthenticated || card.public) &&
        card.idToFetch !== feedImageGalleryId &&
        card.entityType !== 'WeekMaterialsPage' &&
        card.entityType !== 'meditation'
    );
  }, [dynamicRoutes, isAuthenticated, feedImageGalleryId]);

  const isLoading = routeLoading || weekMaterialLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #ffffff, #1e73be)',
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
          height: { xs: '50vh', sm: '70vh', md: '85vh' },
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
          alt="Banner Clubinhos NIB"
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            px: { xs: 2, sm: 4 },
            maxWidth: { xs: '90%', sm: '800px' },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: '#FFF176',
              textShadow: '2px 2px 5px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Bem-vindo ao Clubinhos NIB
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#FFFFFF',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1rem', sm: '1.5rem' },
            }}
          >
            Ministério de evangelismo que leva a palavra de Deus para as crianças que precisam
            conhecer o amor de Jesus.
          </Typography>
        </Box>
      </Box>

      {isAuthenticated && weekMaterial && (
        <WeekBanner
          title={weekMaterial.title ?? 'Sem título'}
          subtitle={weekMaterial.subtitle ?? ''}
          linkTo={`/${weekMaterial.route.path}`}
        />
      )}

      {isLoading ? (
        <Box sx={{ my: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredCards.length > 0 ? (
        <Box sx={{ width: { xs: '95%', sm: '90%', md: '85%' }, py: { xs: 4, sm: 6 } }}>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {filteredCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id} display="flex">
                <motion.div
                  style={{ width: '100%' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <a
                    href={`/${card.path}`}
                    style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                  >
                    <CustomCard
                      title={card.title}
                      description={card.description}
                      image={card.image}
                      link={`/${card.path}`}
                    />
                  </a>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
    </Box>
  );
};

export default Home;
