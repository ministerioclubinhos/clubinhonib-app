import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Collapse,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/slices';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import SendIcon from '@mui/icons-material/Send';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '@/config/axiosConfig';
import { setComments } from 'store/slices/comment/commentsSlice';

const CommentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rawComments = useSelector((state: RootState) => state.comments.comments);
  const comments = useMemo(() => rawComments?.filter((c) => c.published) || [], [rawComments]);

  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    clubinho: '',
    neighborhood: '',
  });

  const [errors, setErrors] = useState({
    name: false,
    comment: false,
    clubinho: false,
    neighborhood: false,
  });

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get('/comments/published');
      dispatch(setComments(response.data));
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      comment: !formData.comment.trim(),
      clubinho: !formData.clubinho.trim(),
      neighborhood: !formData.neighborhood.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await api.post('/comments', formData);
      setFormData({ name: '', comment: '', clubinho: '', neighborhood: '' });
      setErrors({ name: false, comment: false, clubinho: false, neighborhood: false });
      setFormOpen(false);
      setSuccessSnackbarOpen(true);
      await fetchComments();
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      responsive: [
        { breakpoint: 960, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1 } },
      ],
      arrows: true,
      appendDots: (dots: React.ReactNode) => (
        <Box sx={{ mt: 2 }}>
          <ul style={{ margin: 0, padding: 0 }}>{dots}</ul>
        </Box>
      ),
    }),
    []
  );

  const labels: Record<string, string> = {
    name: 'Nome (obrigatório)',
    comment: 'Comentário (obrigatório)',
    clubinho: 'Clubinho (obrigatório)',
    neighborhood: 'Bairro (obrigatório)',
  };

  const placeholders: Record<string, string> = {
    name: 'Seu nome',
    comment: 'Escreva seu comentário aqui...',
    clubinho: 'Ex: Clubinho do Amor',
    neighborhood: 'Ex: Jardim das Flores',
  };

  const fieldIcons: Record<string, React.ReactNode> = {
    name: <PersonIcon />,
    comment: <CommentIcon />,
    clubinho: <HomeIcon />,
    neighborhood: <LocationOnIcon />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 0.6, md: 4 },
          mt: 5,
          borderRadius: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          border: `2px solid ${theme.palette.primary.main}20`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(25, 118, 210, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                p: { xs: 1, md: 1.5 },
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: { xs: 1.5, md: 2 },
              }}
            >
              <CommentIcon sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary.main"
              sx={{
                fontSize: { xs: '1rem', md: '1.8rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Comentários dos Professores
            </Typography>
          </Box>

          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                startIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: formOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                }
                onClick={() => setFormOpen(!formOpen)}
                sx={{
                  mb: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '1rem' },
                  px: { xs: 1.5, md: 3 },
                  py: { xs: 0.8, md: 1.5 },
                  minWidth: { xs: 'auto', md: 'auto' },
                  width: { xs: '100%', md: 'auto' },
                  boxShadow: { xs: 2, md: 3 },
                  '&:hover': {
                    boxShadow: { xs: 4, md: 6 },
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, md: 1 },
                    '& svg': {
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    },
                  },
                }}
              >
                {formOpen ? 'Fechar' : 'Adicionar Comentário'}
              </Button>
            </motion.div>

            <Collapse in={formOpen}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    border: `1px solid ${theme.palette.primary.main}20`,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                      sx={{
                        mb: { xs: 2, md: 3 },
                        textAlign: 'center',
                        fontSize: { xs: '0.9rem', md: '1.25rem' },
                      }}
                    >
                      📝 Compartilhe sua experiência
                    </Typography>

                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                      {['name', 'comment', 'clubinho', 'neighborhood'].map((field) => (
                        <Grid item xs={12} md={field === 'comment' ? 8 : 4} key={field}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              required
                              label={labels[field]}
                              placeholder={placeholders[field]}
                              variant="outlined"
                              size="medium"
                              multiline={field === 'comment'}
                              rows={field === 'comment' ? 4 : 1}
                              value={formData[field as keyof typeof formData]}
                              onChange={(e) =>
                                setFormData({ ...formData, [field]: e.target.value })
                              }
                              error={errors[field as keyof typeof errors]}
                              helperText={
                                errors[field as keyof typeof errors]
                                  ? `${labels[field].split(' ')[0]} é obrigatório`
                                  : ''
                              }
                              InputProps={{
                                startAdornment: (
                                  <Box
                                    sx={{
                                      mr: 1,
                                      color: 'primary.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    {fieldIcons[field]}
                                  </Box>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: { xs: '0.875rem', md: '1rem' },
                                },
                                '& .MuiOutlinedInput-input': {
                                  fontSize: { xs: '0.875rem', md: '1rem' },
                                  padding: { xs: '12px 14px', md: '16px 14px' },
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ textAlign: 'center' }}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          endIcon={
                            isSubmitting ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : (
                              <SendIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                            )
                          }
                          sx={{
                            borderRadius: { xs: 2, md: 3 },
                            textTransform: 'none',
                            fontSize: { xs: '0.8rem', md: '1rem' },
                            px: { xs: 2, md: 4 },
                            py: { xs: 1, md: 1.5 },
                            minWidth: { xs: 'auto', md: 'auto' },
                            boxShadow: 3,
                            '&:hover': {
                              boxShadow: 6,
                            },
                            '&:disabled': {
                              opacity: 0.7,
                            },
                          }}
                        >
                          {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
                        </Button>
                      </motion.div>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Collapse>
          </Box>

          {/* Comentários */}
          <AnimatePresence>
            {comments.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    px: 1,
                    '& .slick-prev:before, & .slick-next:before': {
                      color: theme.palette.primary.main,
                      fontSize: '28px',
                    },
                    '& .slick-prev': {
                      left: { xs: 5, md: -30 },
                      zIndex: 2,
                    },
                    '& .slick-next': {
                      right: { xs: 5, md: -30 },
                      zIndex: 2,
                    },
                    '& .slick-arrow': {
                      width: { xs: 30, md: 40 },
                      height: { xs: 30, md: 40 },
                      backgroundColor: { xs: 'rgba(255,255,255,0.9)', md: 'transparent' },
                      borderRadius: { xs: '50%', md: 0 },
                      boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.2)', md: 'none' },
                      '&:before': {
                        fontSize: { xs: '20px', md: '28px' },
                        color: theme.palette.primary.main,
                      },
                      '&:hover': {
                        backgroundColor: { xs: 'rgba(255,255,255,1)', md: 'transparent' },
                      },
                    },
                  }}
                >
                  <Slider {...sliderSettings}>
                    {comments.map((comment, index) => (
                      <Box
                        key={comment.id}
                        sx={{
                          p: { xs: 0.5, md: 2 },
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card
                            elevation={6}
                            sx={{
                              width: { xs: '100%', sm: '96%', md: '90%' },
                              maxWidth: { xs: 'none', md: 400 },
                              minHeight: { xs: 260, md: 320 },
                              borderRadius: { xs: 2, md: 3 },
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                              border: `2px solid ${theme.palette.primary.main}15`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                elevation: 12,
                                transform: 'translateY(-4px)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 20px 40px ${theme.palette.primary.main}20`,
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: { xs: 1.5, md: 3 },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: { xs: 1.5, md: 2 },
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: 'primary.main',
                                    mr: { xs: 1.5, md: 2 },
                                    width: { xs: 36, md: 48 },
                                    height: { xs: 36, md: 48 },
                                    fontSize: { xs: '0.9rem', md: '1.2rem' },
                                  }}
                                >
                                  {comment.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="primary.main"
                                    sx={{
                                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                                      mb: 0.5,
                                    }}
                                  >
                                    {comment.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                  >
                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Conteúdo do Comentário */}
                              <Box sx={{ flexGrow: 1, mb: { xs: 1.5, md: 2 } }}>
                                <Paper
                                  elevation={1}
                                  sx={{
                                    p: { xs: 1.5, md: 2 },
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontSize: { xs: '0.85rem', md: '1rem' },
                                      lineHeight: { xs: 1.5, md: 1.6 },
                                      color: 'text.primary',
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    "{comment.comment}"
                                  </Typography>
                                </Paper>
                              </Box>

                              {/* Footer com informações */}
                              <Box sx={{ mt: 'auto' }}>
                                <Stack
                                  direction="row"
                                  spacing={{ xs: 0.5, md: 1 }}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Chip
                                    icon={<HomeIcon />}
                                    label={comment.clubinho}
                                    size="small"
                                    sx={{
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                                      height: { xs: 24, md: 28 },
                                      '& .MuiChip-icon': {
                                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                                      },
                                    }}
                                  />
                                  <Chip
                                    icon={<LocationOnIcon />}
                                    label={comment.neighborhood}
                                    size="small"
                                    sx={{
                                      bgcolor: 'secondary.light',
                                      color: 'white',
                                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                                      height: { xs: 24, md: 28 },
                                      '& .MuiChip-icon': {
                                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                                      },
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                  }}
                >
                  <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Nenhum comentário publicado ainda
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Envie o seu e ele aparecerá após avaliação.
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={8000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: 6,
          }}
        >
          ✅ Comentário enviado com sucesso! Ele será avaliado antes de ser publicado.
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CommentsSection;
