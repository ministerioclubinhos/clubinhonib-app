import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { MediaTargetType } from 'store/slices/types';
import { motion } from 'framer-motion';

const TeacherWeekBanner: React.FC = () => {
  const routes = useSelector((state: RootState) => state.routes.routes);
  const { user } = useSelector((state: RootState) => state.auth);
  const currentWeekRoute = routes.find(
    (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current === true
  );

  if (!currentWeekRoute) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          height: {
            xs: 'auto',
            sm: 'auto',
            md: 350
          },
          minHeight: {
            xs: 300,
            sm: 300,
            md: 280
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: '5px', sm: 3, md: '16px' },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 500,
          }}
        >
          Nenhum material semanal atual encontrado.
        </Typography>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          height: {
            xs: 'auto',
            sm: 'auto',
            md: 350
          },
          minHeight: {
            xs: 300,
            sm: 300,
            md: 280
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: '5px', sm: 3, md: '16px' },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #0073E6 0%, #4A90E2 50%, #87CEEB 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: { xs: '100%', md: '600px' },
        }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.4rem', sm: '2rem', md: '2.8rem' },
              fontWeight: 700,
              mb: { xs: 3, sm: 4, md: 5 },
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              px: { xs: 2, sm: 0 },
            }}
          >
            Olá {user?.name || 'Professor'}
          </Typography>

          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/lista-materias-semanais"
            sx={{
              bgcolor: 'white',
              color: '#0073E6',
              fontWeight: 'bold',
              px: { xs: 3, sm: 5, md: 8 },
              py: { xs: 1.2, sm: 1.8, md: 2.5 },
              fontSize: { xs: '0.95rem', sm: '1.2rem', md: '1.4rem' },
              borderRadius: 3,
              boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s ease',
              minWidth: { xs: '200px', sm: '240px', md: '280px' },
            }}
          >
            Histórias Bíblicas
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default TeacherWeekBanner;