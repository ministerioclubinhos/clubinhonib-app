import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    useTheme,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import api from '@/config/axiosConfig';

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
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setIsValidToken(false);
            return;
        }

        const validateToken = async () => {
            try {
                const response = await api.get(`/auth/reset-password/validate?token=${token}`);
                if (response.data.valid) {
                    setIsValidToken(true);
                    setEmailUser(response.data.email);
                } else {
                    setIsValidToken(false);
                }
            } catch (error) {
                setIsValidToken(false);
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando para o login...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Erro ao redefinir senha. O token pode ter expirado.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setSubmitting(false);
        }
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
                    <Typography variant="h5" color="error" gutterBottom fontWeight="bold">Link Inválido ou Expirado</Typography>
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

                    {message && (
                        <Alert severity={message.type} sx={{ mb: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Nova Senha"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={submitting || message?.type === 'success'}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirmar Nova Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            error={newPassword !== confirmPassword && confirmPassword.length > 0}
                            helperText={newPassword !== confirmPassword && confirmPassword.length > 0 ? "As senhas não conferem" : ""}
                            disabled={submitting || message?.type === 'success'}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={submitting || !newPassword || newPassword !== confirmPassword || message?.type === 'success'}
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
