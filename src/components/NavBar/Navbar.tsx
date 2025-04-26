import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';

const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#81d742', zIndex: 1300 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Clubinho NIB
        </Typography>
        <Box>{isMobile ? <MobileNavigation /> : <DesktopNavigation />}</Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
