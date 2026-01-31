import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';

interface ErrorPageProps {
    error: any;
    resetErrorBoundary: (...args: any[]) => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
    const handleReload = () => {
        if (resetErrorBoundary) {
            resetErrorBoundary();
        } else {
            window.location.reload();
        }
    };

    const handleGoHome = () => {
        // Use window.location instead of navigate to avoid Router context dependency
        window.location.href = '/';
        if (resetErrorBoundary) {
            resetErrorBoundary();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: -2 }}>
                        😕
                    </Typography>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                        Algo deu errado
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Encontramos um erro inesperado. Tente recarregar a página ou voltar para o início.
                    </Typography>

                    {import.meta.env.DEV && error && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffeeee', borderRadius: 1, width: '100%', textAlign: 'left', overflow: 'auto' }}>
                            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                                {error.message}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<ReplayIcon />}
                            onClick={handleReload}
                            size="large"
                        >
                            Tentar Novamente
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<HomeIcon />}
                            onClick={handleGoHome}
                            size="large"
                        >
                            Ir para o Início
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ErrorPage;
