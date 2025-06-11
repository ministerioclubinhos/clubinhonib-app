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

// Estilização personalizada para as setas do carrossel
const StyledSlider = styled(Slider)(({ theme }) => ({
  '.slick-prev, .slick-next': {
    zIndex: 1000,
    width: 40,
    height: 40,
    backgroundColor: theme.palette.grey[800],
    borderRadius: '50%',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.grey[700],
    },
    [theme.breakpoints.down('sm')]: {
      width: 32,
      height: 32,
    },
  },
  '.slick-prev': {
    left: 10,
  },
  '.slick-next': {
    right: 10,
  },
  '.slick-dots': {
    bottom: -10,
  },
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

  const formatDate = (date?: string | Date) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para lidar com o clique no botão Editar
  const handleEdit = (section: SectionData) => {
    dispatch(setData(section));
    navigate('/adm/editar-imagens-clubinho');
  };

  // Configurações do carrossel
  const carouselSettings = {
    dots: true,
    infinite: section?.mediaItems?.length ? section.mediaItems.length > 1 : false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    prevArrow: <Button aria-label="Imagem anterior" />,
    nextArrow: <Button aria-label="Próxima imagem" />,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isMobile ? false : 'lg'}
      sx={{ '& .MuiDialog-paper': { width: isMobile ? '98%' : '60%', maxWidth: '100%' } }}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">Detalhes das imagens</DialogTitle>
      <DialogContent>
        {section ? (
          <Stack spacing={3} mt={1}>
            {/* Informações Gerais em Duas Colunas no Desktop */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom color="primary">
                Informações Gerais
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      <strong>Legenda:</strong> {section.caption || 'Não informado'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Descrição:</strong> {section.description || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      <strong>Criado em:</strong> {formatDate(section.createdAt)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Atualizado em:</strong> {formatDate(section.updatedAt)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Carrossel de Imagens */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom color="primary">
                Galeria de Imagens
              </Typography>
              {section.mediaItems?.length ? (
                <StyledSlider {...carouselSettings}>
                  {section.mediaItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        textAlign: 'center',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 2, sm: 4 },
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.originalName}
                        style={{
                          width: '100%',
                          maxHeight: isMobile ? 300 : 500,
                          objectFit: 'contain',
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  ))}
                </StyledSlider>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Nenhuma imagem disponível.
                </Typography>
              )}
            </Paper>
          </Stack>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Nenhuma seção selecionada.
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 2,
          alignItems: isMobile ? 'stretch' : 'center',
          p: { xs: 2, sm: 3 },
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
          variant="contained"
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