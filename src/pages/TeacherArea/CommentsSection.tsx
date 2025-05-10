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
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/slices';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '@/config/axiosConfig';
import { setComments } from 'store/slices/comment/commentsSlice';

const CommentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
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
      autoplaySpeed: 3000,
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

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: '5px solid #0288d1',
        backgroundColor: '#e1f5fe',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 0, md: 3 } }}>
        <CommentIcon sx={{ color: '#0288d1', mr: 1 }} />
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#424242"
          sx={{
            mt: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },

            fontSize: { xs: '1rem', md: '1.5rem' },
          }}
        >
          Comentários dos Professores
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ExpandMoreIcon />}
          onClick={() => setFormOpen(!formOpen)}
          sx={{
            mb: 2,
            borderRadius: 20,
            textTransform: 'none',
            color: '#0288d1',
            borderColor: '#0288d1',
          }}
        >
          {formOpen ? 'Fechar formulário' : 'Adicionar Comentário'}
        </Button>
        <Collapse in={formOpen}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {['name', 'comment', 'clubinho', 'neighborhood'].map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <TextField
                      fullWidth
                      required
                      label={labels[field]}
                      placeholder={placeholders[field]}
                      variant="outlined"
                      size="small"
                      multiline={field === 'comment'}
                      rows={field === 'comment' ? 3 : 1}
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
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ borderRadius: 20, textTransform: 'none' }}
                disabled={isSubmitting}
                endIcon={
                  isSubmitting && (
                    <CircularProgress color="inherit" size={18} sx={{ ml: 1 }} />
                  )
                }
              >
                {isSubmitting ? 'Enviando...' : 'Submeter comentário'}
              </Button>
            </Box>
          </motion.div>
        </Collapse>
      </Box>

      {comments.length > 0 ? (
        <Box sx={{ position: 'relative', px: 1, '& .slick-prev:before, & .slick-next:before': { color: '#0288d1', fontSize: '28px', }, }}>
          <Slider {...sliderSettings}>
            {comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      width: { xs: '100%', sm: '95%', md: '90%' },
                      maxWidth: 1000,
                      minHeight: { xs: 250, md: 200 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        px: { xs: 0.3, md: 1 }
                      }}
                    >
                      <Box sx={{ mb: 2, }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: '#0288d1', mr: 2 }}>
                            {comment.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="#424242"
                              sx={{
                                fontSize: { xs: '.8rem', md: '1.25rem' },
                                mb: { xs: 1, md: 2 },
                                textAlign: { xs: 'left', md: 'left' },
                              }}
                            >
                              {comment.name}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            mb: { xs: 0, md: 2 },
                            lineHeight: 1.6,
                            backgroundColor: '#f9f9f9',
                            padding: { xs: 0, md: 1.5 },
                            borderRadius: 1,
                            borderLeft: '4px solid #0288d1',
                          }}
                        >
                          {comment.comment}
                        </Typography>

                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'inline-block',
                          mt: 1,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: '#e3f2fd',
                          color: '#0288d1',
                          fontWeight: 500,
                          borderRadius: 2,
                          fontSize: '0.75rem',
                        }}
                      >
                        {comment.clubinho} • {comment.neighborhood}
                      </Typography>

                    </CardContent>
                  </Card>

                </motion.div>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhum comentário publicado ainda. Envie o seu e ele aparecerá após avaliação.
        </Typography>
      )}

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={10000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Comentário enviado com sucesso! Ele será avaliado antes de ser publicado.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CommentsSection;
