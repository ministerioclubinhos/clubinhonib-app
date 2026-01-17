import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import CompleteProfileAlert from './CompleteProfileAlert';
import { useProfileAlerts } from '@/features/profile/hooks/useProfileAlerts';

const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const profileAlerts = useProfileAlerts();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#81d742', zIndex: 1300 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Clubinhos NIB
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && <CompleteProfileAlert alerts={profileAlerts} />}
          {isMobile ? <MobileNavigation /> : <DesktopNavigation />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
