import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { FeaturesSectionProps } from '../types';

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
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
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Por que escolher o Clubinho NIB?
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={feature.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 4,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #81d742',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${feature.color}, ${feature.color}dd)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          mb: 3,
                          color: feature.color,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <feature.icon sx={{ fontSize: 60 }} />
                      </Box>
                    </motion.div>

                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#2c3e50',
                        mb: 2,
                        fontSize: { xs: '1.3rem', md: '1.5rem' },
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#5a6c7d',
                        lineHeight: 1.6,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
