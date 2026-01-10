import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Card, CardContent, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FormatQuote } from '@mui/icons-material';
import { TestimonialsSectionProps } from '../types';

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        borderRadius: { xs: 0, md: 0 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}
    >
      {/* Divisão Suave Superior */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
          zIndex: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
      
      {/* Ondas Decorativas Superiores */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
          clipPath: 'polygon(0 0%, 0 40%, 25% 60%, 50% 40%, 75% 70%, 100% 50%, 100% 0%)',
          zIndex: 1,
        }}
        animate={{
          clipPath: [
            'polygon(0 0%, 0 40%, 25% 60%, 50% 40%, 75% 70%, 100% 50%, 100% 0%)',
            'polygon(0 0%, 0 50%, 25% 40%, 50% 60%, 75% 50%, 100% 40%, 100% 0%)',
            'polygon(0 0%, 0 30%, 25% 70%, 50% 30%, 75% 60%, 100% 60%, 100% 0%)',
            'polygon(0 0%, 0 40%, 25% 60%, 50% 40%, 75% 70%, 100% 50%, 100% 0%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          px: { xs: 2, sm: 3, md: 4 },
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
              color: '#ffffff',
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontFamily: "'Poppins', sans-serif",
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            O que dizem sobre o Clubinho
          </Typography>
        </motion.div>

        <Box
          sx={{
            position: 'relative',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <FormatQuote
                      sx={{
                        fontSize: 60,
                        color: '#667eea',
                        mb: 2,
                        opacity: 0.3,
                      }}
                    />
                  </motion.div>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#2c3e50',
                      mb: 3,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      fontWeight: 400,
                    }}
                  >
                    "{testimonials[currentIndex].comment}"
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#667eea',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {testimonials[currentIndex].name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#5a6c7d',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    {testimonials[currentIndex].clubinho} - {testimonials[currentIndex].neighborhood}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <IconButton
            onClick={prevTestimonial}
            sx={{
            position: 'absolute',
            left: { xs: -6, md: -60 },
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#667eea',
            zIndex: 5,
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={nextTestimonial}
            sx={{
              position: 'absolute',
              right: { xs: -6, md: -60 },
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#667eea',
              zIndex: 5,
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots Indicator */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mt: 4,
            }}
          >
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: index === currentIndex ? '#FFD700' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Divisão Suave Inferior */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
          zIndex: 2,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      
      {/* Ondas Decorativas Inferiores */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
          clipPath: 'polygon(0 100%, 0 60%, 25% 40%, 50% 60%, 75% 30%, 100% 50%, 100% 100%)',
          zIndex: 1,
        }}
        animate={{
          clipPath: [
            'polygon(0 100%, 0 60%, 25% 40%, 50% 60%, 75% 30%, 100% 50%, 100% 100%)',
            'polygon(0 100%, 0 50%, 25% 60%, 50% 40%, 75% 50%, 100% 60%, 100% 100%)',
            'polygon(0 100%, 0 70%, 25% 30%, 50% 70%, 75% 40%, 100% 40%, 100% 100%)',
            'polygon(0 100%, 0 60%, 25% 40%, 50% 60%, 75% 30%, 100% 50%, 100% 100%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </Box>
  );
};

export default TestimonialsSection;
