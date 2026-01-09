import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CTASectionProps } from '../types';

const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated }) => {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 50%, #f0f8ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 3, md: 4 },
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Faça Parte da Nossa Missão
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#5a6c7d',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '1rem', md: '1.3rem' },
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Junte-se a mais de 20 anos de experiência evangelística. Seja um servo comprometido em
            levar a Palavra de Deus às crianças de forma alegre e criativa, criando ambientes
            acolhedores com princípios bíblicos.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/area-do-professor"
                  size="large"
                  sx={{
                    px: { xs: 4, md: 6 },
                    py: { xs: 2, md: 2.5 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explorar Recursos
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/contato"
                  size="large"
                  sx={{
                    px: { xs: 4, md: 6 },
                    py: { xs: 2, md: 2.5 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Entre em Contato
                </Button>
              </motion.div>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CTASection;
