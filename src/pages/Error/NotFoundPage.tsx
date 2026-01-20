import React from 'react';
import { Box, Button, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f7fa',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
                position: 'relative',
                overflow: 'hidden',
                p: 3,
            }}
        >
            <Box
                component={motion.div}
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: { xs: '200px', md: '400px' },
                    height: { xs: '200px', md: '400px' },
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(139, 195, 74, 0.2), rgba(139, 195, 74, 0.05))',
                    zIndex: 0,
                }}
            />
            <Box
                component={motion.div}
                animate={{
                    y: [0, 30, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-5%',
                    width: { xs: '150px', md: '300px' },
                    height: { xs: '150px', md: '300px' },
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.05))',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="md" sx={{ zIndex: 1, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '8rem', sm: '10rem', md: '14rem' },
                            fontWeight: 900,
                            letterSpacing: '-0.05em',
                            color: 'transparent',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            backgroundImage: 'linear-gradient(135deg, #8BC34A 0%, #4CAF50 100%)',
                            filter: 'drop-shadow(0 10px 20px rgba(76, 175, 80, 0.2))',
                            lineHeight: 1,
                            fontFamily: '"Outfit", "Roboto", sans-serif',
                            mb: 2,
                            userSelect: 'none',
                        }}
                    >
                        404
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: '#2c3e50',
                            mb: 2,
                            fontSize: { xs: '1.5rem', md: '2.5rem' },
                            fontFamily: '"Outfit", "Roboto", sans-serif',
                        }}
                    >
                        Ops! Caminho errado.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: '#546e7a',
                            mb: 6,
                            maxWidth: '500px',
                            mx: 'auto',
                            fontSize: { xs: '1rem', md: '1.15rem' },
                            lineHeight: 1.6
                        }}
                    >
                        Parece que a página que você está procurando não faz parte do nosso Clubinho.
                        Que tal voltarmos para um lugar seguro?
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            fullWidth={isMobile}
                            sx={{
                                borderColor: '#8BC34A',
                                color: '#558B2F',
                                borderWidth: 2,
                                px: 4,
                                py: 1.5,
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: '160px',
                                '&:hover': {
                                    borderColor: '#689F38',
                                    backgroundColor: 'rgba(139, 195, 74, 0.08)',
                                    borderWidth: 2,
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/')}
                            fullWidth={isMobile}
                            sx={{
                                background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                                boxShadow: '0 8px 16px rgba(139, 195, 74, 0.25)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: '160px',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7CB342 0%, #558B2F 100%)',
                                    boxShadow: '0 12px 24px rgba(139, 195, 74, 0.35)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            Ir para o Início
                        </Button>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default NotFoundPage;
