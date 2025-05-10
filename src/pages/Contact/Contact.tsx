import React, { useState } from 'react';
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
import api from '@/config/axiosConfig';

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

  if (!match) return value;

  const [, ddd, prefixo, sufixo] = match;
  if (ddd && prefixo && sufixo) return `(${ddd}) ${prefixo}-${sufixo}`;
  if (ddd && prefixo) return `(${ddd}) ${prefixo}`;
  if (ddd) return `(${ddd}`;
  return '';
};

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });

  // Interface para erros com mensagens específicas
  interface FormErrors {
    nome: { hasError: boolean; message: string };
    email: { hasError: boolean; message: string };
    telefone: { hasError: boolean; message: string };
    mensagem: { hasError: boolean; message: string };
  }

  const [errors, setErrors] = useState<FormErrors>({
    nome: { hasError: false, message: '' },
    email: { hasError: false, message: '' },
    telefone: { hasError: false, message: '' },
    mensagem: { hasError: false, message: '' },
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Regex para validações
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefoneRegex = /^\(\d{2}\)\s[9]?\d{4}-\d{4}$/;
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;

  const validDDDs = [
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '21',
    '22',
    '24',
    '27',
    '28',
    '31',
    '32',
    '33',
    '34',
    '35',
    '37',
    '38',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '51',
    '53',
    '54',
    '55',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '71',
    '73',
    '74',
    '75',
    '77',
    '79',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
  ];

  const validateField = (name: keyof typeof form, value: string) => {
    let error: { hasError: boolean; message: string } = { hasError: false, message: '' };

    switch (name) {
      case 'nome':
        if (value.trim() === '') {
          error = { hasError: true, message: 'Nome é obrigatório.' };
        } else if (value.trim().length < 2) {
          error = { hasError: true, message: 'Nome deve ter pelo menos 2 caracteres.' };
        } else if (!nomeRegex.test(value)) {
          error = { hasError: true, message: 'Nome deve conter apenas letras.' };
        }
        break;

      case 'email':
        if (value.trim() === '') {
          error = { hasError: true, message: 'Email é obrigatório.' };
        } else if (!emailRegex.test(value)) {
          if (!value.includes('@')) {
            error = { hasError: true, message: "Email deve conter '@'." };
          } else if (!value.includes('.')) {
            error = { hasError: true, message: 'Email deve conter um domínio (ex.: .com).' };
          } else {
            error = { hasError: true, message: 'Email inválido.' };
          }
        }
        break;

      case 'telefone':
        if (value.trim() === '') {
          error = { hasError: true, message: 'Telefone é obrigatório.' };
        } else if (!telefoneRegex.test(value)) {
          error = { hasError: true, message: 'Telefone inválido (ex.: (11) 91234-5678).' };
        } else {
          const ddd = value.slice(1, 3); // Extrai o DDD
          if (!validDDDs.includes(ddd)) {
            error = { hasError: true, message: 'DDD inválido.' };
          }
        }
        break;

      case 'mensagem':
        if (value.trim() === '') {
          error = { hasError: true, message: 'Mensagem é obrigatória.' };
        } else if (value.trim().length < 10) {
          error = { hasError: true, message: 'Mensagem deve ter pelo menos 10 caracteres.' };
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Validação completa do formulário
  const validateForm = () => {
    const newErrors: FormErrors = {
      nome: validateField('nome', form.nome),
      email: validateField('email', form.email),
      telefone: validateField('telefone', form.telefone),
      mensagem: validateField('mensagem', form.mensagem),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err.hasError);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const formattedValue = name === 'telefone' ? formatPhone(value) : value;

    setForm((prevForm) => ({ ...prevForm, [name]: formattedValue }));

    const error = validateField(name as keyof typeof form, formattedValue);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));

    setSubmitted(false);
    setError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSubmitted(false);
    setError(false);

    try {
      await api.post('/contact', {
        name: form.nome,
        email: form.email,
        phone: form.telefone,
        message: form.mensagem,
      });

      setSubmitted(true);
      setForm({ nome: '', email: '', telefone: '', mensagem: '' });
      setErrors({
        nome: { hasError: false, message: '' },
        email: { hasError: false, message: '' },
        telefone: { hasError: false, message: '' },
        mensagem: { hasError: false, message: '' },
      });
    } catch (err) {
      setError(true);
      console.error('Erro ao enviar contato:', err);
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
      mt={{ xs: 7, md: 5 }}
      mb={0}
      sx={{
        background: 'linear-gradient(135deg, white 0%, #007bff 100%)',
        fontFamily: "'Roboto', sans-serif",
        width: '100%',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 4, md: 6 },
          mb: { xs: 2, md: 4 },
          width: '100%',
          maxWidth: { xs: '100%', sm: 700 },
          borderRadius: 3,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
          minHeight: '70%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        role="region"
        aria-label="Formulário de Contato do Clubinho NIB"
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Fale Conosco
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          textAlign="center"
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          Entre em contato para saber mais informações.
        </Typography>

        {submitted && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Mensagem enviada com sucesso!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={errors.nome.hasError}
            helperText={errors.nome.message}
            id="nome-input"
            aria-describedby="nome-helper-text"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={errors.email.hasError}
            helperText={errors.email.message}
            id="email-input"
            aria-describedby="email-helper-text"
          />

          <TextField
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={errors.telefone.hasError}
            helperText={errors.telefone.message}
            id="telefone-input"
            aria-describedby="telefone-helper-text"
          />

          <TextField
            label="Mensagem"
            name="mensagem"
            value={form.mensagem}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={4}
            margin="normal"
            error={errors.mensagem.hasError}
            helperText={errors.mensagem.message}
            id="mensagem-input"
            aria-describedby="mensagem-helper-text"
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
