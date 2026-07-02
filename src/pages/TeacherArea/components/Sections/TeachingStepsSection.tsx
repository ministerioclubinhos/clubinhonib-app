import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TEACHING_STEPS } from '../../constants';

const TeachingStepsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleStepToggle = (index: number) => {
    if (isMobile) {
      setExpandedStep(expandedStep === index ? null : index);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: '5px solid #7b1fa2',
        backgroundColor: '#f3e5f5',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <MenuBookIcon sx={{ color: '#7b1fa2', mr: 1 }} />
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#424242"
          sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          Passo a Passo da sua Aula
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="#616161"
        sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.85rem', md: '0.95rem' } }}
      >
        Um caminho simples, do preparo à colheita, para cada encontro do Clubinho — tudo fundamentado na
        Palavra de Deus. 📖
        {isMobile && ' Toque em cada passo para ver os detalhes.'}
      </Typography>

      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
        {TEACHING_STEPS.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          const showDetails = !isMobile || isExpanded;

          return (
            <Grid key={idx} item xs={12} sm={6} md={4} lg={2.4} sx={{ display: 'flex' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: isMobile ? 0 : idx * 0.1 }}
                style={{ width: '100%', display: 'flex' }}
              >
                <Card
                  elevation={3}
                  onClick={() => handleStepToggle(idx)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    borderTop: { xs: 'none', md: `4px solid ${step.color}` },
                    borderLeft: { xs: `4px solid ${step.color}`, md: 'none' },
                    background: 'linear-gradient(180deg, #ffffff 0%, #fdfbff 100%)',
                    cursor: isMobile ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-4px)' },
                      boxShadow: { xs: undefined, md: `0 12px 24px ${step.color}25` },
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      p: { xs: 1.5, md: 2 },
                      '&:last-child': { pb: { xs: 1.5, md: 2 } },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'space-between', md: 'center' },
                        flexDirection: { xs: 'row', md: 'column' },
                        gap: { xs: 1, md: 0 },
                        mb: showDetails ? 1 : 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: { xs: 'row', md: 'column' },
                          gap: { xs: 1.5, md: 0.5 },
                        }}
                      >
                        <Typography sx={{ fontSize: { xs: '1.5rem', md: '2.2rem' }, lineHeight: 1 }}>
                          {step.emoji}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            color: step.color,
                            textAlign: { xs: 'left', md: 'center' },
                            fontSize: { xs: '0.9rem', md: '0.95rem' },
                          }}
                        >
                          {step.title}
                        </Typography>
                      </Box>

                      {isMobile && (
                        <IconButton
                          size="small"
                          aria-label={isExpanded ? 'Recolher passo' : 'Expandir passo'}
                          sx={{
                            color: step.color,
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      )}
                    </Box>

                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.8rem', md: '0.82rem' },
                              lineHeight: 1.5,
                              flexGrow: 1,
                            }}
                          >
                            {step.description}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: `${step.color}0d`,
                              borderLeft: `3px solid ${step.color}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                fontSize: { xs: '0.72rem', md: '0.74rem' },
                                lineHeight: 1.4,
                              }}
                            >
                              “{step.verse.text}”
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                fontWeight: 700,
                                color: step.color,
                                fontSize: { xs: '0.7rem', md: '0.72rem' },
                              }}
                            >
                              {step.verse.reference}
                            </Typography>
                          </Box>
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
    </Paper>
  );
};

export default TeachingStepsSection;
