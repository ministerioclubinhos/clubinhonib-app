import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Chip,
  Stack,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/slices';
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
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import CommentDetailDialog from './CommentDetailDialog';

const ACCENT = '#0d9488';

const CommentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const rawComments = useSelector((state: RootState) => state.comments.comments);
  const comments = useMemo(() => rawComments?.filter((c) => c.published) || [], [rawComments]);

  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<(typeof comments)[number] | null>(null);

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

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || (rawComments && rawComments.length > 0)) return;

    hasFetched.current = true;
    fetchComments();
  }, [rawComments, fetchComments]);

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
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  const slidesToShow = Math.min(3, Math.max(1, comments.length));

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: comments.length > 3,
      speed: 500,
      slidesToShow,
      slidesToScroll: 1,
      autoplay: comments.length > 3,
      autoplaySpeed: 5000,
      pauseOnHover: true,
      responsive: [
        { breakpoint: 960, settings: { slidesToShow: Math.min(2, slidesToShow), infinite: comments.length > 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1, infinite: comments.length > 1 } },
      ],
      arrows: true,
    }),
    [comments.length, slidesToShow]
  );

  const labels: Record<string, string> = {
    name: 'Nome (obrigatório)',
    comment: 'Comentário (obrigatório)',
    clubinho: 'Clubinho (obrigatório)',
    neighborhood: 'Bairro (obrigatório)',
  };

  const placeholders: Record<string, string> = {
    name: 'Seu nome',
    comment: 'Escreva seu testemunho ou experiência aqui...',
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
    <Box data-testid="teacher-area-sections-comments-section">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3.5,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: `4px solid ${ACCENT}`,
          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: `${ACCENT}14`,
                color: ACCENT,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <CommentIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#0f172a"
                  sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.2 }}
                >
                  Mural de Testemunhos dos Professores
                </Typography>
                {comments.length > 0 && (
                  <Chip
                    size="small"
                    label={comments.length}
                    sx={{
                      bgcolor: `${ACCENT}18`,
                      color: ACCENT,
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="#64748b">
                Relatos e frutos de quem está semeando a Palavra nos Clubinhos
              </Typography>
            </Box>
          </Box>

          <Button
            variant={formOpen ? 'outlined' : 'contained'}
            startIcon={
              <ExpandMoreIcon
                sx={{
                  transform: formOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              />
            }
            onClick={() => setFormOpen(!formOpen)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: formOpen ? 'transparent' : ACCENT,
              borderColor: ACCENT,
              color: formOpen ? ACCENT : '#fff',
              '&:hover': {
                bgcolor: formOpen ? `${ACCENT}10` : '#0f766e',
              },
            }}
          >
            {formOpen ? 'Fechar Formulário' : 'Adicionar Comentário'}
          </Button>
        </Box>

        <Collapse in={formOpen}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              border: '1px solid #cbd5e1',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#0f172a"
                sx={{ mb: 2 }}
              >
                📝 Compartilhe sua experiência no Clubinho
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {['name', 'comment', 'clubinho', 'neighborhood'].map((field) => (
                  <Grid item xs={12} md={field === 'comment' ? 8 : 4} key={field}>
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
                          ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                          : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: ACCENT, display: 'flex', alignItems: 'center' }}>
                            {fieldIcons[field]}
                          </Box>
                        ),
                      }}
                      sx={{ bgcolor: '#ffffff' }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <SendIcon sx={{ fontSize: '1.1rem' }} />
                    )
                  }
                  sx={{
                    bgcolor: ACCENT,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: '#0f766e' },
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {comments.length > 0 ? (
          <Box
            sx={{
              position: 'relative',
              py: 1,
              pb: 3,
              px: { xs: 0.5, md: 1 },
              '& .slick-track': { display: 'flex !important', marginLeft: 0 },
              '& .slick-slide': {
                height: 'inherit',
                '& > div': { height: '100%' },
              },
              '& .slick-prev:before, & .slick-next:before': {
                color: ACCENT,
                fontSize: '26px',
              },
              '& .slick-prev': { left: { xs: -8, md: -16 }, zIndex: 2 },
              '& .slick-next': { right: { xs: -8, md: -16 }, zIndex: 2 },
              '& .slick-dots': {
                bottom: -24,
                '& li.slick-active button:before': { color: ACCENT },
                '& li button:before': { color: ACCENT, opacity: 0.25 },
              },
            }}
          >
            <Slider {...sliderSettings}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    p: 1,
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Card
                    elevation={0}
                    onClick={() => setSelectedComment(comment)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      minHeight: { xs: 230, md: 250 },
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        transform: 'translateY(-3px)',
                        borderColor: ACCENT,
                        boxShadow: `0 8px 20px ${ACCENT}1f`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: ACCENT,
                            mr: 1.5,
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 800,
                          }}
                        >
                          {comment.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            color="#0f172a"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {comment.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          flexGrow: 1,
                          mb: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderLeft: `3px solid ${ACCENT}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.55,
                            color: '#334155',
                            fontStyle: 'italic',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          “{comment.comment}”
                        </Typography>

                        {comment.comment.length > 180 && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.75,
                              color: ACCENT,
                              fontWeight: 700,
                            }}
                          >
                            Ler relato completo…
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 'auto' }}>
                        <Chip
                          icon={<HomeIcon />}
                          label={comment.clubinho}
                          size="small"
                          sx={{
                            bgcolor: `${theme.palette.primary.main}14`,
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 24,
                          }}
                        />
                        <Chip
                          icon={<LocationOnIcon />}
                          label={comment.neighborhood}
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 24,
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
              border: '1px dashed #cbd5e1',
            }}
          >
            <CommentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
              Nenhum comentário publicado ainda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Envie o seu relato sobre o Clubinho e ele aparecerá aqui após avaliação.
            </Typography>
          </Paper>
        )}
      </Paper>

      <CommentDetailDialog
        comment={selectedComment}
        onClose={() => setSelectedComment(null)}
      />

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
          {FEATURE_SUCCESS_MESSAGES.COMMENT_SENT}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentsSection;
