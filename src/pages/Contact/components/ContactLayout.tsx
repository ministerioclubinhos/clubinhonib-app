import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';

interface ContactLayoutProps {
  children: React.ReactNode;
}

const ContactLayout: React.FC<ContactLayoutProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: 'calc(100vh - 128px)',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 50%, #f0f8ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 2, sm: 3, md: 2 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, sm: 4, md: 6 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            variant="h2"
            component="h1"
             sx={{
               fontSize: { xs: '1.8rem', sm: '2.5rem', md: '2.8rem', lg: '3rem' },
               fontWeight: 800,
               background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
               backgroundClip: 'text',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               textShadow: '0 2px 4px rgba(0,0,0,0.1)',
               fontFamily: "'Poppins', sans-serif",
               mb: { xs: 1.5, sm: 2 },
               lineHeight: 1.2,
             }}
          >
            Fale Conosco
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#5a6c7d',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
              fontWeight: 400,
              maxWidth: { xs: '100%', sm: 500, md: 600 },
              mx: 'auto',
              lineHeight: 1.5,
              px: { xs: 1, sm: 0 },
            }}
          >
            Entre em contato para saber mais informações sobre o Clubinho NIB
          </Typography>
        </Box>

        {/* Form Card */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
              border: '1px solid rgba(102, 126, 234, 0.4)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ContactLayout;
