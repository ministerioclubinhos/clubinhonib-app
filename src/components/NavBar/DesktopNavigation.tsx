import React from 'react';
import { Box, Stack } from '@mui/material';
import NavLinks from './NavLinks';

const DesktopNavigation: React.FC = () => {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        bgcolor: '#81d742',
        px: 4,
        py: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Stack direction="row" spacing={4} alignItems="center">
        <NavLinks />
      </Stack>
    </Box>
  );
};

export default DesktopNavigation;
