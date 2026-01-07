import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Paper,
  Grid,
  Box,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SectionData, setData } from '@/store/slices/image-section/imageSectionSlice';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDatePtBr } from '../utils';

const StyledSlider = styled(Slider)(({ theme }) => ({
  '.slick-prev, .slick-next': {
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: theme.palette.grey[800],
    borderRadius: '50%',
    color: theme.palette.common.white,
    '&:hover': { backgroundColor: theme.palette.grey[700] },
    [theme.breakpoints.down('sm')]: { width: 32, height: 32 },
  },
  '.slick-prev': { left: 10 },
  '.slick-next': { right: 10 },
  '.slick-dots': { bottom: -10 },
}));

interface Props {
  section: SectionData | null;
  open: boolean;
  onClose: () => void;
}

export default function ImagePageDetailsModal({ section, open, onClose }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleEdit = (s: SectionData) => {
    dispatch(setData(s));
    navigate('/adm/editar-imagens-clubinho');
  };

  const carouselSettings = {
    dots: true,
    infinite: (section?.mediaItems?.length ?? 0) > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: false,
  };
  const aspect = isMobile ? '16 / 10' : '16 / 9';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="dialog-title"
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle id="dialog-title">Detalhes das imagens</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {section ? (
          <Stack spacing={3} mt={0.5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Informações Gerais
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body1">
                      <strong>Legenda:</strong> {section.caption || 'Não informado'}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      <strong>Descrição:</strong> {section.description || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body1">
                      <strong>Criado em:</strong> {formatDatePtBr(section.createdAt)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Atualizado em:</strong> {formatDatePtBr(section.updatedAt)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Galeria de Imagens
              </Typography>
              {(section.mediaItems?.length ?? 0) > 0 ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: aspect,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <StyledSlider {...(carouselSettings as any)}>
                    {section.mediaItems!.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={item.url}
                          alt={item.originalName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    ))}
                  </StyledSlider>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma imagem disponível.
                </Typography>
              )}
            </Paper>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhuma seção selecionada.
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 1.5,
          alignItems: isMobile ? 'stretch' : 'center',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {section && (
          <Button
            onClick={() => handleEdit(section)}
            variant="contained"
            color="secondary"
            aria-label="Editar e publicar"
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            Editar e publicar
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          aria-label="Fechar modal"
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
