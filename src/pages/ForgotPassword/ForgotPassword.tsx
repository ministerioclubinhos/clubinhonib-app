import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';

const MESSAGES = {
    VERIFICATION_NEEDED: 'Seu email ainda não foi verificado na AWS. Um novo email de verificação foi enviado.',
    SUCCESS_RESET_LINK: 'As instruções de recuperação foram enviadas para o seu email.',
    SUCCESS_GENERIC: 'Solicitação processada. Verifique seu email.',
    ERROR_NOT_FOUND: 'Email não encontrado em nosso cadastro.',
    ERROR_GENERIC: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
};

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; action?: () => void; actionLabel?: string } | null>(null);

    const [cooldown, setCooldown] = useState(0);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [cooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/auth/forgot-password', { email });

            if (response.data?.status === 'VERIFICATION_EMAIL_SENT' || response.data?.message?.includes('verifi')) {
                setMessage({
                    type: 'info',
                    text: response.data?.message || MESSAGES.VERIFICATION_NEEDED,
                    actionLabel: 'Validar Email',
                    action: () => navigate('/verificar-email')
                });
                return;
            }

            if (response.status === 201 || response.data?.status === 'RESET_LINK_SENT') {
                setMessage({
                    type: 'success',
                    text: response.data?.message || MESSAGES.SUCCESS_RESET_LINK,
                });
                setCooldown(120);
            } else {
                setMessage({
                    type: 'success',
                    text: response.data?.message || MESSAGES.SUCCESS_GENERIC,
                });
                setCooldown(120);
            }

        } catch (error: any) {
            console.error('Error requesting password reset:', error);

            if (error.response?.status === 404) {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || MESSAGES.ERROR_NOT_FOUND,
                });
                return;
            }

            const msg = error.response?.data?.message;
            const finalText = typeof msg === 'string' ? msg : MESSAGES.ERROR_GENERIC;

            setMessage({
                type: 'error',
                text: finalText,
            });
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return null;
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60);
            const seconds = cooldown % 60;
            return `Reenviar em ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        return 'Enviar Link de Recuperação';
    };

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - var(--app-header-h, 64px))',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: { xs: 10, md: 15 },
                px: 2,
            }}
        >
            <Container maxWidth="sm" disableGutters sx={{ width: '100%', maxWidth: 480 }}>
                <Paper
                    elevation={3}
                    sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3, backgroundColor: '#fff' }}
                >
                    <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
                        Esqueceu sua senha?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Digite seu email abaixo e enviaremos as instruções para redefinir sua senha.
                    </Typography>

                    {message && (
                        <Alert
                            severity={message.type}
                            sx={{
                                mb: 3,
                                border: '1px solid',
                                borderColor: `${message.type}.main`,
                                alignItems: 'center',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 2, sm: 0 },
                                '& .MuiAlert-message': {
                                    textAlign: { xs: 'center', sm: 'left' },
                                    width: { xs: '100%', sm: 'auto' },
                                    flex: 1,
                                },
                                '& .MuiAlert-action': {
                                    pt: 0,
                                    pb: 0,
                                    pl: { xs: 0, sm: 2 },
                                    width: { xs: '100%', sm: 'auto' },
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mr: { sm: 1 },
                                }
                            }}
                            action={
                                message.action ? (
                                    <Button
                                        variant="contained"
                                        color={message.type === 'error' ? 'error' : 'primary'}
                                        size="small"
                                        onClick={message.action}
                                        fullWidth={isMobile}
                                        sx={{
                                            fontWeight: 'bold',
                                            boxShadow: 2,
                                            whiteSpace: 'nowrap',
                                            minWidth: '120px',
                                            py: 1
                                        }}
                                    >
                                        {message.actionLabel || 'Ver'}
                                    </Button>
                                ) : undefined
                            }
                        >
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {message.text}
                            </Typography>
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="email"
                            label="Email cadastrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || cooldown > 0}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || !email || cooldown > 0}
                            sx={{ mt: 1 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : getButtonText()}
                        </Button>
                    </Box>

                    <Button
                        variant="text"
                        fullWidth
                        onClick={() => navigate('/login')}
                        sx={{ mt: 2 }}
                    >
                        Voltar para o Login
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
