import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { EventNote, AddBox, PhotoLibrary, VideoLibrary, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const cardData = [
  {
    title: 'Páginas de Materiais',
    description: 'Gerencie conteúdos como textos, PDFs e links úteis.',
    icon: <Description fontSize="large" color="primary" />,
    path: '/adm/paginas-materiais-semanais',
  },
  {
    title: 'Páginas de Fotos',
    description: 'Organize e edite galerias de imagens do site.',
    icon: <PhotoLibrary fontSize="large" color="primary" />,
    path: '/adm/paginas-fotos',
  },
  {
    title: 'Páginas de Vídeos',
    description: 'Adicione vídeos ou links do YouTube para o site.',
    icon: <VideoLibrary fontSize="large" color="primary" />,
    path: '/adm/paginas-videos',
  },
  {
    title: 'Páginas de Ideias',
    description: 'Gerencie as páginas de ideias que os professores podem acessar.',
    icon: <EventNote fontSize="large" color="primary" />,
    path: '/adm/paginas-ideias',
  },
  {
    title: 'Meditações',
    description: 'Crie, edite e visualize meditações semanais.',
    icon: <EventNote fontSize="large" color="primary" />,
    path: '/adm/meditacoes',
  },
  {
    title: 'Comentários',
    description: 'Gerencie comentários e feedbacks dos usuários.',
    icon: <EventNote fontSize="large" color="primary" />,
    path: '/adm/comentarios',
  },
  {
    title: 'Documentos',
    description: 'Gerencie documentos que os professores podem acessar.',
    icon: <EventNote fontSize="large" color="primary" />,
    path: '/adm/documentos',
  },
  {
    title: 'Informativos',
    description: 'Gerencie banners informativos do site.',
    icon: <EventNote fontSize="large" color="primary" />,
    path: '/adm/informativos',
  },
  {
    title: 'Criar Página',
    description: 'Adicione novas páginas de conteúdo ao site.',
    icon: <AddBox fontSize="large" color="primary" />,
    path: '/adm/criar-pagina',
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign={{ xs: 'center', md: 'left' }}
        mb={6}
        sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'primary.main' }}
      >
        Bem-vindo(a), Admin 👋
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {cardData.map((card, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 3,
                backgroundColor: '#ffffff',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Box sx={{ mb: 2 }}>{card.icon}</Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </Box>
              <Button variant="contained" fullWidth onClick={() => navigate(card.path)}>
                Acessar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
