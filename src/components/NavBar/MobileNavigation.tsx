import React, { useState } from 'react';
import { Drawer, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavLinks from './NavLinks';
import NavbarNotifications from './NavbarNotifications';

const MobileNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen((s) => !s);
  const closeDrawer = () => setOpen(false);

  return (
    <Box
      data-testid="nav-bar-mobile-navigation"
      sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}
    >
      <NavbarNotifications />
      <IconButton
        onClick={toggleDrawer}
        sx={{ color: '#fff', minWidth: 44, minHeight: 44 }}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={closeDrawer}
        sx={{ zIndex: 1230 }} // Higher than Footer (1220)
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: '100dvw', sm: 360 },
            maxWidth: '100dvw',
            height: { xs: '100dvh', sm: '100vh' },
            bgcolor: '#81d742',
            boxSizing: 'border-box',
            pt: 'max(env(safe-area-inset-top), 16px)',
            pb: 'max(env(safe-area-inset-bottom), 16px)',
            px: 2,
            overflowX: 'hidden',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          },
        }}
      >
        <NavLinks closeMenu={closeDrawer} isMobile />
      </Drawer>
    </Box>
  );
};

export default MobileNavigation;
