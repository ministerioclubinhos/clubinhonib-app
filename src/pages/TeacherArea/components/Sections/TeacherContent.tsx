import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TeacherContentProps } from '../../types';
import { SECTION_DATA } from '../../constants';
import { DocumentsSection, IdeasGallerySection, TrainingVideosSection, CommentsSection, TeachingStepsSection } from './';

const TeacherContent: React.FC<TeacherContentProps> = ({ userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleCardToggle = (index: number) => {
    if (isMobile) {
      setExpandedCard(expandedCard === index ? null : index);
    }
  };

  return (
    <Box>
      <Box
        textAlign="center"
        mb={5}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          border: '2px solid #2196f320',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            background: 'rgba(33, 150, 243, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.4rem', md: '1.8rem' },
              color: 'primary.main',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              mb: 2,
            }}
          >
            👋 Olá, {userName || 'Professor'}!
          </Typography>

          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              maxWidth: '900px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: { xs: 1.6, md: 1.7 },
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              letterSpacing: '0.3px',
              mb: 1,
            }}
          >
            Que alegria ter você aqui! Encontre materiais, ideias e recursos para enriquecer suas aulas e semear a Palavra no coração das crianças.
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: { xs: 1.5, md: 1.6 },
              fontWeight: 400,
              letterSpacing: '0.2px',
            }}
          >
            Tudo atualizado semanalmente e alinhado ao calendário bíblico para sua missão evangelística! ✨
          </Typography>

          <Typography
            variant="body2"
            sx={{
              maxWidth: '700px',
              mx: 'auto',
              mt: 2,
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontStyle: 'italic',
              color: 'primary.dark',
              fontWeight: 500,
            }}
          >
            “E tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor.” — Colossenses 3:23
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {SECTION_DATA.map((section, idx) => {
          const IconComponent = section.icon === 'CheckCircle' ? CheckCircleIcon :
            section.icon === 'Info' ? InfoIcon : LightbulbIcon;

          const isExpanded = expandedCard === idx;
          const isCompressed = isMobile && !isExpanded;

          return (
            <Grid key={idx} item xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  elevation={6}
                  sx={{
                    height: isCompressed ? 'auto' : '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    border: `2px solid ${section.color}20`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isMobile ? 'pointer' : 'default',
                    '&:hover': {
                      elevation: 12,
                      borderColor: section.color,
                      boxShadow: `0 20px 40px ${section.color}20`,
                    },
                  }}
                  onClick={() => handleCardToggle(idx)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      background: `${section.color}10`,
                      borderRadius: '50%',
                      zIndex: 0,
                    }}
                  />

                  <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 1.5, md: 2 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={isCompressed ? 0 : 1.5}>
                      <Box display="flex" alignItems="center" flex={1}>
                        <Box
                          sx={{
                            p: 0.8,
                            borderRadius: 1.5,
                            bgcolor: `${section.color}20`,
                            color: section.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1,
                          }}
                        >
                          <IconComponent sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          {section.title}
                        </Typography>
                      </Box>

                      {isMobile && (
                        <IconButton
                          size="small"
                          sx={{
                            color: section.color,
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      )}
                    </Box>

                    <AnimatePresence>
                      {(!isMobile || isExpanded) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <Box component="ul" sx={{ pl: 0, m: 0, listStyle: 'none', mt: 1 }}>
                            {section.items.map((item: string, idy: number) => (
                              <Box
                                key={idy}
                                component="li"
                                sx={{
                                  mb: 1,
                                  p: { xs: 0.8, md: 1 },
                                  borderRadius: 1.5,
                                  background: 'rgba(255,255,255,0.7)',
                                  borderLeft: `2px solid ${section.color}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,1)',
                                    transform: 'translateX(3px)',
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                                    lineHeight: { xs: 1.3, md: 1.4 },
                                    fontWeight: 500,
                                    letterSpacing: '0.05px',
                                  }}
                                >
                                  {item}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {section.verse && (
                            <Box
                              sx={{
                                mt: 1.5,
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: `${section.color}0d`,
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontStyle: 'italic',
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.72rem', md: '0.75rem' },
                                  lineHeight: 1.4,
                                }}
                              >
                                “{section.verse.text}”
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 0.3,
                                  fontWeight: 700,
                                  color: section.color,
                                  fontSize: { xs: '0.7rem', md: '0.72rem' },
                                }}
                              >
                                {section.verse.reference}
                              </Typography>
                            </Box>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Box mt={6}>
        <TeachingStepsSection />
      </Box>
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
};

export default TeacherContent;
