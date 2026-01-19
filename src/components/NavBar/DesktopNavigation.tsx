import React from 'react';
import { Box, Stack } from '@mui/material';
import NavLinks from './NavLinks';

const DesktopNavigation: React.FC = () => {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        bgcolor: '#81d742',
        px: 2,
        py: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Stack direction="row" spacing={0} alignItems="center" width="100%">
        <NavLinks />
      </Stack>
    </Box>
  );
};

export default DesktopNavigation;
