import React from 'react';
import { Box, Button, Container, Typography, Paper, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const AccessDeniedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - var(--app-header-h, 64px))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fafafa',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                p: 3,
            }}
        >
            {/* Background decorations */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '-5%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="sm" sx={{ zIndex: 1 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 4,
                        textAlign: 'center',
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            mb: 3,
                            animation: `${pulse} 2s ease-in-out infinite`,
                        }}
                    >
                        <LockOutlinedIcon
                            sx={{
                                fontSize: 50,
                                color: '#f44336',
                            }}
                        />
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 2,
                        }}
                    >
                        Acesso Negado
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#f44336',
                            fontWeight: 600,
                            mb: 2,
                        }}
                    >
                        403 - Forbidden
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#666',
                            mb: 4,
                            maxWidth: '400px',
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Você não tem permissão para acessar esta página ou recurso.
                        Se você acredita que isso é um erro, entre em contato com o administrador.
                    </Typography>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                borderWidth: 2,
                                px: 4,
                                py: 1.5,
                                borderRadius: '50px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#d32f2f',
                                    backgroundColor: 'rgba(244, 67, 54, 0.05)',
                                    borderWidth: 2,
                                },
                            }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/')}
                            sx={{
                                backgroundImage: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                                boxShadow: '0 8px 16px rgba(139, 195, 74, 0.3)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                borderRadius: '50px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(135deg, #7CB342 0%, #558B2F 100%)',
                                    boxShadow: '0 12px 20px rgba(139, 195, 74, 0.4)',
                                },
                            }}
                        >
                            Ir para o Início
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AccessDeniedPage;
