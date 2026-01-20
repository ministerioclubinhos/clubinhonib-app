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
import { useApiError } from '@/hooks/useApiError';
import { UserErrorCode } from '@/types/api-error';
import { getErrorMessage, logApiError } from '@/utils/apiError';

import { PASSWORD_RECOVERY_MESSAGES, GENERIC_ERROR_MESSAGES } from '@/constants/errorMessages';

const MESSAGES = {
    VERIFICATION_NEEDED: PASSWORD_RECOVERY_MESSAGES.VERIFICATION_NEEDED,
    SUCCESS_RESET_LINK: PASSWORD_RECOVERY_MESSAGES.RESET_LINK_SENT,
    SUCCESS_GENERIC: PASSWORD_RECOVERY_MESSAGES.SUCCESS_GENERIC,
    ERROR_NOT_FOUND: PASSWORD_RECOVERY_MESSAGES.EMAIL_NOT_FOUND,
    ERROR_GENERIC: GENERIC_ERROR_MESSAGES.TRY_AGAIN,
};

type MessageType = 'success' | 'error' | 'info';

interface Message {
    type: MessageType;
    text: string;
    action?: () => void;
    actionLabel?: string;
}

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const {
        handleError,
        clearError,
        hasFieldError,
        getFieldError,
        clearFieldError,
        isErrorCode,
    } = useApiError();

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
        clearError();

        try {
            const response = await api.post(
                '/auth/forgot-password',
                { email },
                { skipGlobalError: true } as any
            );

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

        } catch (error) {
            logApiError(error, 'ForgotPassword');
            const analyzed = handleError(error, 'ForgotPassword');

            // Mensagem customizada para email não encontrado
            if (analyzed.code === UserErrorCode.NOT_FOUND || analyzed.httpStatus === 404) {
                setMessage({
                    type: 'error',
                    text: analyzed.message || MESSAGES.ERROR_NOT_FOUND,
                });
            } else {
                setMessage({
                    type: 'error',
                    text: analyzed.message || MESSAGES.ERROR_GENERIC,
                });
            }
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

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (hasFieldError('email')) clearFieldError('email');
        if (message?.type === 'error') setMessage(null);
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
                            onChange={handleEmailChange}
                            required
                            disabled={loading || cooldown > 0}
                            error={hasFieldError('email')}
                            helperText={getFieldError('email')}
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
