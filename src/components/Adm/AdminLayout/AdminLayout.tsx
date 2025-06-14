import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  EventNote,
  AddBox,
  PhotoLibrary,
  VideoLibrary,
  Lightbulb,
  MenuBook,
  Description,
  Comment,
  Notifications,
  ContactMail,
  RateReview,
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ pb: 2, pt: 1, py: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Painel Admin
        </Typography>
      </Box>
      <Divider />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          Páginas
        </Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => navigate('/adm/paginas-materiais-semanais')}>
          <ListItemIcon><EventNote /></ListItemIcon>
          <ListItemText primary="Materiais semanais" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/paginas-fotos')}>
          <ListItemIcon><PhotoLibrary /></ListItemIcon>
          <ListItemText primary="Páginas de fotos" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/fotos-clubinhos')}>
          <ListItemIcon><PhotoLibrary /></ListItemIcon>
          <ListItemText primary="Fotos dos clubinhos" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/paginas-videos')}>
          <ListItemIcon><VideoLibrary /></ListItemIcon>
          <ListItemText primary="Páginas de vídeos" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/paginas-ideias')}>
          <ListItemIcon><Lightbulb /></ListItemIcon>
          <ListItemText primary="Páginas de ideias" />
        </ListItemButton>
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          Conteúdos
        </Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => navigate('/adm/meditacoes')}>
          <ListItemIcon><MenuBook /></ListItemIcon>
          <ListItemText primary="Meditações" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/documentos')}>
          <ListItemIcon><Description /></ListItemIcon>
          <ListItemText primary="Documentos" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/informativos')}>
          <ListItemIcon><Notifications /></ListItemIcon>
          <ListItemText primary="Informativos" />
        </ListItemButton>
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          Administração
        </Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => navigate('/adm/feedbacks')}>
          <ListItemIcon>
            <RateReview />
          </ListItemIcon>
          <ListItemText primary="Feedbacks" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/comentarios')}>
          <ListItemIcon><Comment /></ListItemIcon>
          <ListItemText primary="Comentários" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/contatos')}>
          <ListItemIcon><ContactMail /></ListItemIcon>
          <ListItemText primary="Contatos" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/adm/criar-pagina')}>
          <ListItemIcon><AddBox /></ListItemIcon>
          <ListItemText primary="Criar Página" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        minHeight: '100vh',
        mb: 16,
      }}
    >
      {isMobile && (
        <AppBar position="fixed" color="inherit" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Administração
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: isMobile ? 0 : 8,
            overflowY: 'auto',
            height: isMobile ? '100vh' : 'calc(100vh - 64px)',
            zIndex: isMobile ? 1300 : 'auto',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
          mt: isMobile ? 8 : 0,
          bgcolor: '#f5f7fa',
          minHeight: '100vh',
        }}
      >
        {isMobile && <Toolbar sx={{ minHeight: 0, paddingTop: 0, paddingBottom: 0 }} />}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
