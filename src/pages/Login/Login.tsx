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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import api from '@/config/axiosConfig';
import { RootState as RootStateType, AppDispatch as AppDispatchType } from '@/store/slices';
import { login, LoginResponse, RoleUser, setGoogleUser } from '@/store/slices/auth/authSlice';

const log = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) console.log(message, ...args);
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatchType>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isAuthenticated, user } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.role === RoleUser.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setErrorMessage('Por favor, insira um email válido e uma senha com pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    log('[Login] Tentando login com:', { email });

    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      if (response.data.user.active === false) {
        setErrorMessage('Usuário não validado, entre em contato com 92981553139.');
        return;
      }
      const { accessToken, refreshToken, user: responseUser } = response.data;

      const mappedUser = {
        ...responseUser,
        role: responseUser.role === RoleUser.ADMIN ? RoleUser.ADMIN : RoleUser.TEACHER,
      };

      dispatch(login({ accessToken, refreshToken, user: mappedUser }));

      const redirectPath = mappedUser.role === RoleUser.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as any)?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        setErrorMessage(message);
        log('[Login] Erro Axios:', error.response?.data || error.message);
      } else {
        setErrorMessage('Erro inesperado. Tente novamente mais tarde.');
        log('[Login] Erro inesperado:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setErrorMessage(null);
    log('[Login] Login com Google bem-sucedido:', credentialResponse);

    try {
      const { credential } = credentialResponse;
      const res = await api.post('/auth/google', { token: credential });

      if (res.data.active === false) {
        setErrorMessage('Usuário não validado, entre em contato com 92981553139.');
        return;
      }

      if (res.data.newUser) {
        if (res.data.name && res.data.email) {
          dispatch(setGoogleUser({ name: res.data.name, email: res.data.email }));
        }
        navigate('/cadastrar-google');
        return;
      }

      const { accessToken, refreshToken, user: responseUser } = res.data;
      const mappedUser = {
        ...responseUser,
        role: responseUser.role === RoleUser.ADMIN ? RoleUser.ADMIN : RoleUser.TEACHER,
      };

      dispatch(login({ accessToken, refreshToken, user: mappedUser }));

      const redirectPath = mappedUser.role === RoleUser.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as any)?.message || 'Erro ao fazer login com Google.';
        setErrorMessage(message);
        log('[Login] Erro Axios com Google:', error.response?.data || error.message);
      } else {
        setErrorMessage('Erro inesperado ao fazer login com Google.');
        log('[Login] Erro inesperado com Google:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Erro ao fazer login com Google. Tente novamente.');
    log('[Login] Falha no login com Google');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
      {/* WRAPPER que ocupa a tela e reserva espaço p/ o footer fixo */}
      <Box
        sx={{
          minHeight: 'calc(100vh - var(--app-header-h, 64px))',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 12, md: 20 },             // topo menor no mobile
          pb: { xs: '50px', md: '96px' },    // menos espaço no mobile
          px: { xs: 1, md: 2 },
        }}
      >
        <Container maxWidth="sm" disableGutters sx={{ width: '100%', maxWidth: 560 }}>
          <Paper
            elevation={3}
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 3, backgroundColor: '#fff' }}
          >
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Área do Professor
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-label="Digite seu email"
                variant="outlined"
                error={!!errorMessage && !email}
                helperText={!!errorMessage && !email ? 'Email é obrigatório' : ''}
              />
              <TextField
                fullWidth
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                aria-label="Digite sua senha"
                variant="outlined"
                error={!!errorMessage && !password}
                helperText={!!errorMessage && !password ? 'Senha é obrigatória' : ''}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                disabled={loading || !isFormValid()}
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/cadastrar')}
              sx={{ mt: 3, fontWeight: 'bold' }}
            >
              Não tem conta? Cadastre-se
            </Button>
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;
