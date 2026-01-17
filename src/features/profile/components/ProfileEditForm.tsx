import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/Save';
import { Profile, UpdateProfileDto } from '../types';
import { apiUpdateProfile } from '../api';
import { digitsOnly, maskPhoneBR, maskCPF } from '../../../utils/masks';
import { isValidEmail, normalizeEmail, isValidCPF } from '../../../utils/validators';

interface ProfileEditFormProps {
  profile: Profile | null;
  onUpdate: () => void;
  onError: (error: string) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onUpdate,
  onError,
}) => {
  const [formData, setFormData] = useState<UpdateProfileDto>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: maskPhoneBR(profile.phone || ''),
        cpf: maskCPF(profile.cpf || ''),
      });
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProfileDto, string>> = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else {
      const parts = formData.name.trim().split(/\s+/);
      if (parts.length < 2) {
        newErrors.name = 'Digite seu nome e sobrenome';
      } else if (parts.length < 3) {
        newErrors.name = 'Digite seu nome completo (mínimo 3 nomes)';
      }
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    const phoneDigits = digitsOnly(formData.phone);
    if (!phoneDigits) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const isWithCC = phoneDigits.startsWith('55') && phoneDigits.length > 11;
      const lenOk = isWithCC
        ? phoneDigits.length === 12 || phoneDigits.length === 13
        : phoneDigits.length === 10 || phoneDigits.length === 11;
      if (!lenOk) newErrors.phone = 'Telefone inválido';
    }

    if (formData.cpf) {
      if (!isValidCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    onError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateProfileDto = {};
      if (formData.name && formData.name.trim() !== profile?.name) {
        payload.name = formData.name.trim();
      }
      if (formData.email && formData.email.trim() !== profile?.email) {
        payload.email = normalizeEmail(formData.email);
      }
      const nextPhoneDigits = digitsOnly(formData.phone);
      const prevPhoneDigits = digitsOnly(profile?.phone);
      if (nextPhoneDigits && nextPhoneDigits !== prevPhoneDigits) {
        payload.phone = nextPhoneDigits;
      }

      const nextCpfDigits = digitsOnly(formData.cpf);
      const prevCpfDigits = digitsOnly(profile?.cpf);

      // Send CPF if it's new/changed, or send empty string if user cleared it (though validator might block that if required, here it's optional)
      if (nextCpfDigits !== prevCpfDigits) {
        payload.cpf = nextCpfDigits;
      }

      if (Object.keys(payload).length === 0) {
        onError('Nenhuma alteração foi feita');
        setIsSubmitting(false);
        return;
      }

      await apiUpdateProfile(payload);
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = errorData?.message || 'Erro ao atualizar perfil';
      const errorField = errorData?.field;

      onError(errorMessage);

      if (errorField === 'cpf') {
        setErrors({ cpf: errorMessage });
      } else if (errorField === 'email') {
        setErrors({ email: errorMessage });
      } else {
        // Fallback logic based on message content
        if (errorMessage.toLowerCase().includes('cpf')) {
          setErrors({ cpf: errorMessage });
        } else if (errorMessage.toLowerCase().includes('email') || errorMessage.includes('já está em uso')) {
          setErrors({ email: errorMessage });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  const v = e.target.value;
                  const parts = v.trim().split(/\s+/);

                  if (!v.trim()) setErrors({ ...errors, name: 'Nome é obrigatório' });
                  else if (parts.length < 2) setErrors({ ...errors, name: 'Digite seu nome e sobrenome' });
                  else if (parts.length < 3) setErrors({ ...errors, name: 'Digite seu nome completo (mínimo 3 nomes)' });
                  else if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                onBlur={() => {
                  const v = formData.name || '';
                  const parts = v.trim().split(/\s+/);

                  if (!v.trim()) setErrors({ ...errors, name: 'Nome é obrigatório' });
                  else if (parts.length < 2) setErrors({ ...errors, name: 'Digite seu nome e sobrenome' });
                  else if (parts.length < 3) setErrors({ ...errors, name: 'Digite seu nome completo (mínimo 3 nomes)' });
                }}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  const v = e.target.value;
                  if (!v.trim()) setErrors({ ...errors, email: 'Email é obrigatório' });
                  else if (!isValidEmail(v)) setErrors({ ...errors, email: 'Email inválido' });
                  else if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                onBlur={() => {
                  const v = formData.email || '';
                  if (!v.trim()) setErrors({ ...errors, email: 'Email é obrigatório' });
                  else if (!isValidEmail(v)) setErrors({ ...errors, email: 'Email inválido' });
                }}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="tel"
                label="Telefone"
                inputMode="numeric"
                value={maskPhoneBR(formData.phone || '')}
                onChange={(e) => {
                  setFormData({ ...formData, phone: maskPhoneBR(e.target.value) });
                  const digits = digitsOnly(e.target.value);
                  if (!digits) setErrors({ ...errors, phone: 'Telefone é obrigatório' });
                  else {
                    const isWithCC = digits.startsWith('55') && digits.length > 11;
                    const lenOk = isWithCC
                      ? digits.length === 12 || digits.length === 13
                      : digits.length === 10 || digits.length === 11;
                    if (!lenOk) setErrors({ ...errors, phone: 'Telefone inválido' });
                    else if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }
                }}
                onBlur={() => {
                  const digits = digitsOnly(formData.phone);
                  if (!digits) setErrors({ ...errors, phone: 'Telefone é obrigatório' });
                  else {
                    const isWithCC = digits.startsWith('55') && digits.length > 11;
                    const lenOk = isWithCC
                      ? digits.length === 12 || digits.length === 13
                      : digits.length === 10 || digits.length === 11;
                    if (!lenOk) setErrors({ ...errors, phone: 'Telefone inválido' });
                  }
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="(DD) 9XXXX-XXXX"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.cpf}
                placeholder="000.000.000-00"
                onChange={(e) => {
                  setFormData({ ...formData, cpf: maskCPF(e.target.value) });
                  if (e.target.value && !isValidCPF(e.target.value)) {
                    setErrors({ ...errors, cpf: 'CPF inválido' });
                  } else {
                    setErrors({ ...errors, cpf: undefined });
                  }
                }}
                error={!!errors.cpf}
                helperText={errors.cpf}
                inputProps={{ maxLength: 14 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>

            {success && (
              <Grid item xs={12}>
                <Alert severity="success">
                  Perfil atualizado com sucesso!
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
                  disabled={isSubmitting}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  }}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </motion.div>
  );
};

export default ProfileEditForm;
