import React, { forwardRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { IMaskInput } from 'react-imask';
import api from '@/config/axiosConfig';

const PhoneMask = forwardRef<HTMLInputElement, any>(function PhoneMask(props, ref) {
  return (
    <IMaskInput
      {...props}
      mask="(00) 00000-0000"
      definitions={{
        '0': /[0-9]/,
      }}
      inputRef={ref}
      overwrite
    />
  );
});

// Schema de validação sem DDD fixo
const schema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .matches(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: Yup.string()
    .required('Email é obrigatório')
    .email('Email inválido'),
  telefone: Yup.string()
    .required('Telefone é obrigatório')
    .test('valid-phone', 'Telefone inválido (ex.: (11) 91234-5678)', (val) => {
      const digits = val?.replace(/\D/g, '');
      return digits?.length === 10 || digits?.length === 11;
    }),
  mensagem: Yup.string()
    .required('Mensagem é obrigatória')
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

interface ContactFormData {
  name: string;
  email: string;
  telefone: string;
  mensagem: string;
}

const Contact: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      telefone: '',
      mensagem: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setGlobalError(null);
    try {
      await api.post('/contact', {
        name: data.name,
        email: data.email,
        phone: data.telefone,
        message: data.mensagem,
      });
      setSubmitted(true);
      reset();
    } catch (error) {
      setGlobalError('Erro ao enviar a mensagem. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 128px)"
      px={{ xs: 2, sm: 3, md: 4 }}
      sx={{
        background: 'linear-gradient(135deg, white 0%, #007bff 100%)',
        width: '100%',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 700,
          borderRadius: 3,
          width: '100%',
        }}
      >
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Fale Conosco
        </Typography>
        <Typography variant="subtitle1" textAlign="center" gutterBottom>
          Entre em contato para saber mais informações.
        </Typography>

        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}
        {submitted && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Mensagem enviada com sucesso!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              />
            )}
          />

          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telefone"
                fullWidth
                margin="normal"
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                slotProps={{
                  input: {
                    inputComponent: PhoneMask as any,
                  },
                }}
              />
            )}
          />

          <Controller
            name="mensagem"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mensagem"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                error={!!errors.mensagem}
                helperText={errors.mensagem?.message}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Contact;
