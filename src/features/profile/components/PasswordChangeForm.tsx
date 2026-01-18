import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { ChangePasswordDto } from '../types';
import { apiChangePassword } from '../api';

interface PasswordChangeFormProps {
  onError: (error: string) => void;
  isCommonUser: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onError, isCommonUser }) => {
  const [formData, setFormData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordDto | 'confirmPassword', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateLive = (
    next: { currentPassword: string; newPassword: string; confirmPassword: string },
    touched?: Partial<Record<'currentPassword' | 'newPassword' | 'confirmPassword', boolean>>
  ) => {
    const newErrors: Partial<Record<keyof ChangePasswordDto | 'confirmPassword', string>> = {};

    const should = (key: 'currentPassword' | 'newPassword' | 'confirmPassword') =>
      touched?.[key] ?? true;

    if (should('currentPassword') && isCommonUser) {
      if (!next.currentPassword.trim()) newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (should('newPassword')) {
      if (!next.newPassword.trim()) newErrors.newPassword = 'Nova senha é obrigatória';
      else if (next.newPassword.length < 6) newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
      else if (isCommonUser && next.currentPassword && next.currentPassword === next.newPassword) {
        newErrors.newPassword = 'A nova senha deve ser diferente da senha atual';
      }
    }

    if (should('confirmPassword')) {
      if (!next.confirmPassword.trim()) newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      else if (next.newPassword !== next.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ChangePasswordDto | 'confirmPassword', string>> = {};

    if (isCommonUser && !formData.currentPassword?.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (isCommonUser && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'A nova senha deve ser diferente da senha atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormReady =
    (!isCommonUser || !!formData.currentPassword?.trim()) &&
    !!formData.newPassword.trim() &&
    !!confirmPassword.trim() &&
    formData.newPassword.length >= 6 &&
    formData.newPassword === confirmPassword &&
    (!isCommonUser || (formData.currentPassword && formData.currentPassword !== formData.newPassword)) &&
    Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    onError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ChangePasswordDto = {
        newPassword: formData.newPassword,
        ...(isCommonUser && formData.currentPassword ? { currentPassword: formData.currentPassword } : {}),
      };
      await apiChangePassword(payload);
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao alterar senha';
      onError(errorMessage);

      if (isCommonUser && errorMessage.includes('incorreta')) {
        setErrors({ currentPassword: 'Senha atual incorreta' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isCommonUser && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Para alterar sua senha, você precisa informar sua senha atual.
                </Alert>
              </Grid>
            )}

            {!isCommonUser && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Como você utiliza autenticação via Google, não é necessário informar a senha atual.
                </Alert>
              </Grid>
            )}

            {isCommonUser && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Senha Atual"
                  value={formData.currentPassword}
                  onChange={(e) => {
                    const next = { ...formData, currentPassword: e.target.value };
                    setFormData(next);
                    validateLive({ ...next, confirmPassword, currentPassword: next.currentPassword || '' }, { currentPassword: true });
                  }}
                  onBlur={() =>
                    validateLive(
                      { ...formData, confirmPassword, currentPassword: formData.currentPassword || '' },
                      { currentPassword: true, newPassword: false, confirmPassword: false }
                    )
                  }
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={isCommonUser ? 6 : 6}>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label="Nova Senha"
                value={formData.newPassword}
                onChange={(e) => {
                  const next = { ...formData, newPassword: e.target.value };
                  setFormData(next);
                  validateLive({ ...next, confirmPassword, currentPassword: next.currentPassword || '' }, { newPassword: true, confirmPassword: true });
                }}
                onBlur={() =>
                  validateLive(
                    { ...formData, confirmPassword, currentPassword: formData.currentPassword || '' },
                    { currentPassword: false, newPassword: true, confirmPassword: true }
                  )
                }
                error={!!errors.newPassword}
                helperText={errors.newPassword || 'Mínimo de 6 caracteres'}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
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
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => {
                  const nextConfirm = e.target.value;
                  setConfirmPassword(nextConfirm);
                  validateLive({ ...formData, confirmPassword: nextConfirm, currentPassword: formData.currentPassword || '' }, { confirmPassword: true });
                }}
                onBlur={() =>
                  validateLive(
                    { ...formData, confirmPassword, currentPassword: formData.currentPassword || '' },
                    { currentPassword: false, newPassword: true, confirmPassword: true }
                  )
                }
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword || 'Repita a nova senha'}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
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
                  Senha alterada com sucesso!
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
                  disabled={isSubmitting || !isFormReady}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </motion.div>
  );
};

export default PasswordChangeForm;
