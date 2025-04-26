import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import NavLinks from './NavLinks';
import { Drawer, IconButton, Box } from '@mui/material';

const MobileNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <IconButton onClick={toggleDrawer} sx={{ color: '#fff' }}>
        {open ? <FaTimes size="24px" /> : <FaBars size="24px" />}
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '100vw',
            bgcolor: '#81d742',
            height: '100vh',
            boxSizing: 'border-box',
            p: 2,
            overflowX: 'hidden',
          },
        }}
      >
        <NavLinks closeMenu={closeDrawer} isMobile />
      </Drawer>
    </Box>
  );
};

export default MobileNavigation;
