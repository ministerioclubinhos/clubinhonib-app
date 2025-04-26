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

import api from '../../config/axiosConfig';
import { RootState as RootStateType, AppDispatch as AppDispatchType } from '../../store/slices';
import { login, RoleUser } from '../../store/slices/auth/authSlice';

interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  accessToken: string;
  refreshToken: string;
}

const log = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
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
      const { accessToken, refreshToken, user: responseUser } = response.data;

      log('[Login] Login realizado com sucesso:', { accessToken, refreshToken, responseUser });

      // Mapeia o role para RoleUser
      const mappedUser = {
        ...responseUser,
        role: responseUser.role === 'admin' ? RoleUser.ADMIN : RoleUser.USER,
      };

      // Armazena tokens e usuário no Redux
      dispatch(login({ accessToken, refreshToken, user: mappedUser }));

      // Redireciona com base na role do usuário
      const redirectPath = mappedUser.role === RoleUser.ADMIN ? '/adm' : '/area-do-professor';
      navigate(redirectPath);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
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

  return (
    <Container maxWidth="sm" sx={{ mt: 16 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#fff',
        }}
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
      </Paper>
    </Container>
  );
};

export default Login;
