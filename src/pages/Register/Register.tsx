import React, { Fragment, useEffect } from 'react';
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
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';
import api from '@/config/axiosConfig';
import { IMaskInput } from 'react-imask';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';

interface RegisterProps {
  commonUser: boolean;
}

type RoleChoice = '' | 'teacher' | 'coordinator';

const PhoneMask = React.forwardRef<HTMLInputElement, any>(function PhoneMask(props, ref) {
  return <IMaskInput {...props} mask="(00) 00000-0000" inputRef={ref} overwrite />;
});

const getSchema = (commonUser: boolean) =>
  Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    ...(commonUser && {
      confirmEmail: Yup.string()
        .oneOf([Yup.ref('email')], 'Os emails não coincidem')
        .required('Confirme o email'),
      password: Yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha obrigatória'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'As senhas não coincidem')
        .required('Confirme a senha'),
    }),
    phone: Yup.string()
      .test('len', 'Telefone inválido (DDD + número)', (val) => {
        const digits = val?.replace(/\D/g, '');
        return digits?.length === 10 || digits?.length === 11;
      })
      .required('Telefone é obrigatório'),
    role: (commonUser
      ? Yup.mixed<RoleChoice>().oneOf(['', 'teacher', 'coordinator'])
      : Yup.mixed<RoleChoice>().oneOf(['teacher', 'coordinator']).required('Selecione seu perfil')) as any,
  });

interface FormData {
  name: string;
  email: string;
  confirmEmail?: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  role: RoleChoice;
}

const Register: React.FC<RegisterProps> = ({ commonUser }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const googleUser = useSelector((state: RootState) => state.auth.googleUser);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(getSchema(commonUser)) as any,
    defaultValues: {
      name: '',
      email: '',
      confirmEmail: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  });

  useEffect(() => {
    if (!commonUser && googleUser) {
      if (googleUser.email) setValue('email', googleUser.email);
      if (googleUser.name) setValue('name', googleUser.name);
    }
  }, [googleUser, commonUser, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setGlobalError(null);

    const endpoint = commonUser ? '/auth/register' : '/auth/complete-register';

    try {
      await api.post(endpoint, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: commonUser ? data.password : undefined,
        role: data.role || undefined,
      });
      setSuccess(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setGlobalError(error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
      } else {
        setGlobalError('Erro inesperado. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box component="main" sx={{ flex: '1 0 auto' }}>
        <Container
          maxWidth="sm"
          sx={{
            pt: { xs: 15, md: 15 },
            pb: { xs: 5, md: 0 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2.25, md: 4 },
              borderRadius: 2,
              backgroundColor: '#fff',
            }}
          >
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 700 }}
            >
              {commonUser ? 'Cadastro de Usuário' : 'Completar Cadastro'}
            </Typography>

            {globalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {globalError}
              </Alert>
            )}

            {success ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 3 }}>
                <Alert
                  severity="success"
                  sx={{
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: 'bold',
                    p: { xs: 2, md: 2.5 },
                    textAlign: 'center',
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  Cadastro concluído com sucesso! <br />
                  Aguarde a aprovação do seu cadastro. <br />
                  Você será notificado pelo WhatsApp.
                </Alert>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ mt: 1, px: 4, py: 1.25, fontWeight: 'bold' }}
                >
                  Voltar para Login
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome"
                      fullWidth
                      margin="normal"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      margin="normal"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      slotProps={{
                        input: {
                          readOnly: !commonUser,
                        },
                      }}
                    />
                  )}
                />

                {commonUser && (
                  <Controller
                    name="confirmEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirmar Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        error={!!errors.confirmEmail}
                        helperText={errors.confirmEmail?.message}
                      />
                    )}
                  />
                )}

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      fullWidth
                      margin="normal"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      slotProps={{
                        input: {
                          inputComponent: PhoneMask as any,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Você é"
                      fullWidth
                      margin="normal"
                      error={!!errors.role}
                      helperText={errors.role?.message || 'Informe se você é Professor ou Coordenador'}
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="teacher">Professor</MenuItem>
                      <MenuItem value="coordinator">Coordenador</MenuItem>
                    </TextField>
                  )}
                />

                {commonUser && (
                  <Fragment>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Senha"
                          type="password"
                          fullWidth
                          margin="normal"
                          error={!!errors.password}
                          helperText={errors.password?.message}
                        />
                      )}
                    />

                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirmar Senha"
                          type="password"
                          fullWidth
                          margin="normal"
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                        />
                      )}
                    />
                  </Fragment>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: { xs: 2, md: 3 },
                    py: { xs: 1.5, md: 1 },
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : commonUser ? (
                    'Cadastrar'
                  ) : (
                    'Completar Cadastro'
                  )}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{
                    mt: { xs: 2, md: 2.5 },
                    py: { xs: 1.4, md: 1 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 'bold',
                  }}
                >
                  Já tem conta?
                </Button>
              </form>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Register;
