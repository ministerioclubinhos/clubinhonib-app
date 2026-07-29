import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { MediaTargetType } from 'store/slices/types';
import { motion } from 'framer-motion';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TeacherWeekBanner: React.FC = () => {
  const routes = useSelector((state: RootState) => state.routes.routes);
  const { user } = useSelector((state: RootState) => state.auth);
  const currentWeekRoute = routes.find(
    (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current === true
  );

  const firstName = (user?.name || 'Professor').split(' ')[0];

  if (!currentWeekRoute) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 220, sm: 240, md: 320 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: 2, sm: 3 },
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
      style={{ height: '100%' }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 240, sm: 260, md: 320 },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #0073E6 0%, #4A90E2 50%, #87CEEB 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.09)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: { xs: '100%', md: 600 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.8,
                py: 0.5,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
              <Typography
                variant="overline"
                sx={{
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  lineHeight: 1.6,
                }}
              >
                Material da Semana
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.85rem', md: '0.95rem' },
                opacity: 0.9,
                fontStyle: 'italic',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              {firstName}, a história desta semana já está pronta para o seu Clubinho! 📖
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/lista-materias-semanais"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: '#0073E6',
                fontWeight: 'bold',
                textTransform: 'none',
                px: { xs: 3, sm: 4, md: 5 },
                py: { xs: 1.2, md: 1.5 },
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                borderRadius: 3,
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: 200, md: 240 },
              }}
            >
              Ver Histórias Bíblicas
            </Button>
          </motion.div>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default TeacherWeekBanner;
