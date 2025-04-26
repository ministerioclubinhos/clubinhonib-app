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
import { Menu as MenuIcon, EventNote, AddBox } from '@mui/icons-material';

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
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Painel Admin
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />

      <List>
        <ListItemButton onClick={() => navigate('/adm/paginas-materiais-semanais')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Páginas de materiais" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/paginas-fotos')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Páginas de fotos" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/paginas-videos')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Páginas de vídeos" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/paginas-ideias')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Páginas de ideias" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/meditacoes')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Meditações" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/documentos')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Documentos" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/comentarios')}>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Comentários" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/adm/criar-pagina')}>
          <ListItemIcon>
            <AddBox />
          </ListItemIcon>
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
      }}
    >
      {/* AppBar (mobile only) */}
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

      {/* Sidebar */}
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
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
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
        {/* Garante espaço abaixo da AppBar no mobile */}
        {isMobile && <Toolbar />}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
