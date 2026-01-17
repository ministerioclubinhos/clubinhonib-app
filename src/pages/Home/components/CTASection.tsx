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
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
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
              color: '#2c3e50',
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
            Junte-se a mais de 20 anos de experiência evangelística. Seja um servo comprometido em levar a Palavra de Deus às crianças de forma alegre e criativa, criando ambientes acolhedores com princípios bíblicos.
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
                    px: { xs: 4, md: 6 },
                    py: { xs: 2, md: 2.5 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #81d742 30%, #67bf1b 90%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(129, 215, 66, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #67bf1b 30%, #5aa814 90%)',
                      boxShadow: '0 12px 25px rgba(129, 215, 66, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explorar Recursos
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
                    background: 'linear-gradient(45deg, #e74c3c 30%, #c0392b 90%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 20px rgba(231, 76, 60, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #c0392b 30%, #a93226 90%)',
                      boxShadow: '0 12px 25px rgba(231, 76, 60, 0.4)',
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
