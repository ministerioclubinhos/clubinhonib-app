import React from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ContactFormData, ContactFormProps } from '../types';
import { contactFormSchema } from '../validation';
import PhoneMask from './PhoneMask';

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, loading, submitted, globalError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      telefone: '',
      mensagem: '',
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Box>
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

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth={isMobile}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </Box>
    </Box>
  );
};

export default ContactForm;
