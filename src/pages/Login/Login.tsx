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
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import api from '@/config/axiosConfig';
import { RootState as RootStateType, AppDispatch as AppDispatchType } from '@/store/slices';
import {
  login,
  LoginResponse,
  setGoogleUser,
  fetchCurrentUser,
} from '@/store/slices/auth/authSlice';
import { UserRole } from '@/types/shared';
import { useApiError } from '@/hooks/useApiError';
import { AuthErrorCode, UserErrorCode } from '@/types/api-error';
import { logApiError } from '@/utils/apiError';

const log = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) console.log(message, ...args);
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const {
    error: errorMessage,
    handleError,
    clearError,
    hasFieldError,
    getFieldError,
    clearFieldError,
    setError,
    isErrorCode,
  } = useApiError();

  const dispatch = useDispatch<AppDispatchType>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isAuthenticated, user } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.role === UserRole.ADMIN || user?.role === UserRole.COORDINATOR ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 6;
  };

  const bootstrapAfterLogin = async (accessToken: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch { }
    try {
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (e) {
      log('[Login] fetchCurrentUser falhou após login:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isFormValid()) {
      setError('Por favor, insira um email válido e uma senha com pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    log('[Login] Tentando login com:', { email });

    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { skipGlobalError: true } as any
      );

      if (response.data.user.active === false) {
        if (response.data.emailVerification) {
          setVerificationMessage(response.data.emailVerification.message);
          setVerificationNeeded(true);
        }
        setError('Usuário não validado, entre em contato com (92) 99127-4881 ou (92) 98155-3139');
        return;
      }

      const { accessToken, refreshToken, user: responseUser, emailVerification } = response.data;

      const mappedUser = {
        ...responseUser,
        role: responseUser.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.TEACHER,
      };

      dispatch(login({ accessToken, refreshToken, user: mappedUser, emailVerification }));
      await bootstrapAfterLogin(accessToken);

      const redirectPath = mappedUser.role === UserRole.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    } catch (error) {
      logApiError(error, 'Login');
      const analyzed = handleError(error, 'Login');

      // Mensagens customizadas para erros específicos
      if (analyzed.code === AuthErrorCode.INVALID_CREDENTIALS) {
        setError('Email ou senha incorretos.');
      } else if (analyzed.code === UserErrorCode.INACTIVE) {
        setError('Usuário inativo. Entre em contato com o administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    clearError();
    log('[Login] Login com Google bem-sucedido:', credentialResponse);

    try {
      const { credential } = credentialResponse;
      const res = await api.post('/auth/google', { token: credential }, { skipGlobalError: true } as any);

      if (res.data.active === false) {
        if (res.data.emailVerification) {
          setVerificationMessage(res.data.emailVerification.message);
          setVerificationNeeded(true);
        }
        setError('Usuário não validado, entre em contato com (92) 99127-4881 ou (92) 98155-3139');
        return;
      }

      if (res.data.newUser) {
        if (res.data.name && res.data.email) {
          dispatch(setGoogleUser({ name: res.data.name, email: res.data.email }));
        }
        navigate('/cadastrar-google');
        return;
      }

      const { accessToken, refreshToken, user: responseUser, emailVerification } = res.data;
      const mappedUser = {
        ...responseUser,
        role: responseUser.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.TEACHER,
      };

      dispatch(login({ accessToken, refreshToken, user: mappedUser, emailVerification }));
      await bootstrapAfterLogin(accessToken);

      const redirectPath = mappedUser.role === UserRole.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    } catch (error) {
      logApiError(error, 'Login Google');
      handleError(error, 'Login Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Erro ao fazer login com Google. Tente novamente.');
    log('[Login] Falha no login com Google');
  };

  // Limpa erros de campo quando o usuário digita
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (hasFieldError('email')) clearFieldError('email');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (hasFieldError('password')) clearFieldError('password');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
      <Box
        sx={{
          minHeight: 'calc(100vh - var(--app-header-h, 64px))',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 10, md: 15 },
          pb: { xs: 0, md: 0 },
          px: 2,
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

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
                aria-label="Digite seu email"
                variant="outlined"
                error={hasFieldError('email')}
                helperText={getFieldError('email')}
              />
              <TextField
                fullWidth
                type="password"
                label="Senha"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={loading}
                aria-label="Digite sua senha"
                variant="outlined"
                error={hasFieldError('password')}
                helperText={getFieldError('password')}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Button
                  onClick={() => navigate('/esqueci-senha')}
                  sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                >
                  Esqueci minha senha
                </Button>
              </Box>

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
              Cadastre-se
            </Button>

            {verificationNeeded && verificationMessage && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" component="span" align="center">
                    {verificationMessage}
                  </Typography>
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    onClick={() => navigate('/verificar-email')}
                    sx={{
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                      p: 0,
                      '&:hover': {
                        textDecoration: 'underline',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Clique aqui para mais instruções
                  </Button>
                </Box>
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;
