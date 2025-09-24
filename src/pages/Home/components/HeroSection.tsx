import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroSectionProps } from '../types';
import banner from '@/assets/banner.jpg';

const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '60vh', sm: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden',
        mt: { xs: -2, sm: 0 },
      }}
    >
      {/* Background Image */}
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
      
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: '#FFD700',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 2,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #FFE55C 30%, #FFD700 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              fontFamily: "'Poppins', sans-serif",
              mb: { xs: 2, md: 3 },
              lineHeight: 1.1,
            }}
          >
            Bem-vindo ao Clubinho NIB
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem', lg: '2rem' },
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.5,
              fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            Ministério de evangelismo que leva a palavra de Deus para as crianças que precisam conhecer o amor de Jesus
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  component={Link}
                  to="/area-do-professor"
                  size="large"
                  sx={{
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #F4D03F 30%, #F1C40F 90%)',
                    color: '#2C3E50',
                    boxShadow: '0 8px 20px rgba(244, 208, 63, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #F1C40F 30%, #D4AC0D 90%)',
                      boxShadow: '0 12px 25px rgba(244, 208, 63, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Área do Professor
                </Button>
              </motion.div>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HeroSection;
