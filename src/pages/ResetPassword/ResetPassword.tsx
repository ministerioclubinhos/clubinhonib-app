import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { useApiError } from '@/hooks/useApiError';
import { AuthErrorCode, UserErrorCode } from '@/types/api-error';
import { logApiError } from '@/utils/apiError';
import { PASSWORD_RECOVERY_MESSAGES, FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { AUTH_SUCCESS_MESSAGES } from '@/constants/successMessages';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { token: paramToken } = useParams<{ token: string }>();

    const token = paramToken || searchParams.get('token');

    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [validating, setValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [emailUser, setEmailUser] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        error: errorMessage,
        handleError,
        clearError,
        hasFieldError,
        getFieldError,
        clearFieldError,
        setError,
        setFieldError,
    } = useApiError();

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setIsValidToken(false);
            return;
        }

        const validateToken = async () => {
            try {
                const response = await api.get(
                    `/auth/reset-password/validate?token=${token}`,
                    { skipGlobalError: true } as any
                );
                if (response.data.valid) {
                    setIsValidToken(true);
                    setEmailUser(response.data.email);
                } else {
                    setIsValidToken(false);
                }
            } catch (error) {
                logApiError(error, 'ResetPassword:validate');
                setIsValidToken(false);
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage(null);

        // Validações locais
        if (newPassword !== confirmPassword) {
            setFieldError('confirmPassword', FORM_VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH);
            return;
        }
        if (newPassword.length < 6) {
            setFieldError('newPassword', FORM_VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
            return;
        }

        setSubmitting(true);

        try {
            await api.post(
                '/auth/reset-password',
                { token, newPassword },
                { skipGlobalError: true } as any
            );
            setSuccessMessage(AUTH_SUCCESS_MESSAGES.PASSWORD_CHANGED);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            logApiError(error, 'ResetPassword');
            const analyzed = handleError(error, 'ResetPassword');

            // Mensagens customizadas por código
            if (analyzed.code === UserErrorCode.EXPIRED_RECOVERY_CODE) {
                setError(PASSWORD_RECOVERY_MESSAGES.LINK_EXPIRED);
            } else if (analyzed.code === UserErrorCode.INVALID_RECOVERY_CODE) {
                setError(PASSWORD_RECOVERY_MESSAGES.LINK_INVALID);
            } else if (analyzed.code === AuthErrorCode.NEW_PASSWORD_SAME_AS_CURRENT) {
                setFieldError('newPassword', PASSWORD_RECOVERY_MESSAGES.PASSWORD_SAME_AS_CURRENT);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
        if (hasFieldError('newPassword')) clearFieldError('newPassword');
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (hasFieldError('confirmPassword')) clearFieldError('confirmPassword');
    };

    if (validating) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isValidToken || !token) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 480, width: '100%' }}>
                    <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                        Link Inválido ou Expirado
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        O link de recuperação de senha que você utilizou não é válido ou já expirou. Por favor, solicite uma nova recuperação.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/esqueci-senha')}>
                        Solicitar Nova Recuperação
                    </Button>
                </Paper>
            </Box>
        );
    }

    const isSuccess = successMessage !== null;

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
                        Redefinir Senha
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Defina uma nova senha para <b>{emailUser}</b>
                    </Typography>

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Nova Senha"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            required
                            disabled={submitting || isSuccess}
                            error={hasFieldError('newPassword')}
                            helperText={getFieldError('newPassword')}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirmar Nova Senha"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                            error={hasFieldError('confirmPassword') || (newPassword !== confirmPassword && confirmPassword.length > 0)}
                            helperText={
                                getFieldError('confirmPassword') ||
                                (newPassword !== confirmPassword && confirmPassword.length > 0 ? FORM_VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH : '')
                            }
                            disabled={submitting || isSuccess}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={submitting || !newPassword || newPassword !== confirmPassword || isSuccess}
                            sx={{ mt: 1 }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Redefinir Senha'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPassword;
