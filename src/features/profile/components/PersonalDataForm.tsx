import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { extractErrorMessage } from '@/utils/apiError';
import SaveIcon from '@mui/icons-material/Save';
import { SimpleDatePicker } from '@/components/common/inputs/DatePickerInput';
import { PersonalData, UpdatePersonalDataDto } from '../types';
import { apiUpdateCompleteProfile, apiUpdateProfileById } from '../api';
import { maskPhoneBR, digitsOnly } from '@/utils/masks';

interface PersonalDataFormProps {
  personalData: PersonalData | undefined;
  onUpdate: () => void;
  onError: (error: string) => void;
  userId?: string;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
  personalData,
  onUpdate,
  onError,
  userId,
}) => {
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [formData, setFormData] = useState<Omit<UpdatePersonalDataDto, 'birthDate'>>({
    gender: '',
    gaLeaderName: '',
    gaLeaderContact: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdatePersonalDataDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (personalData) {
      setBirthDate(personalData.birthDate ? dayjs(personalData.birthDate) : null);
      setFormData({
        gender: personalData.gender || '',
        gaLeaderName: personalData.gaLeaderName || '',
        gaLeaderContact: maskPhoneBR(personalData.gaLeaderContact || ''),
      });
    }
  }, [personalData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdatePersonalDataDto, string>> = {};

    if (birthDate && !birthDate.isValid()) {
      newErrors.birthDate = 'Data inválida';
    }

    if (formData.gaLeaderContact) {
      const phoneDigits = digitsOnly(formData.gaLeaderContact);
      if (phoneDigits.length > 0 && phoneDigits.length < 8) {
        newErrors.gaLeaderContact = 'Contato inválido';
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
      // Simplificado: Envia sempre os dados atuais do formulário
      const newBirthDate = birthDate ? birthDate.format('YYYY-MM-DD') : '';

      const payload: UpdatePersonalDataDto = {
        birthDate: newBirthDate || undefined,
        gender: formData.gender || undefined,
        gaLeaderName: formData.gaLeaderName?.trim() || undefined,
        gaLeaderContact: digitsOnly(formData.gaLeaderContact) || undefined,
      };

      console.log('PersonalDataForm Payload:', payload);

      if (Object.keys(payload).length === 0) {
        // Se realmente estiver tudo vazio (o que é difícil dado que birthDate pode ser string vazia pra limpar),
        // mas vamos deixar passar se tiver valor.
        // Na verdade, se tudo for undefined, o objeto terá chaves com valores undefined.
        // A API deve ignorar undefineds ou tratar.
        // Vamos limpar chaves undefined para garantir.
        Object.keys(payload).forEach(key => payload[key as keyof UpdatePersonalDataDto] === undefined && delete payload[key as keyof UpdatePersonalDataDto]);
      }

      if (Object.keys(payload).length === 0) {
        onError('Nenhuma alteração detectada para enviar.');
        setIsSubmitting(false);
        return;
      }

      if (userId) {
        await apiUpdateProfileById(userId, { personalData: payload });
      } else {
        await apiUpdateCompleteProfile({ personalData: payload });
      }

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Erro ao atualizar dados pessoais');
      onError(errorMessage);
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
            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Data de Nascimento"
                value={birthDate ? birthDate.format('YYYY-MM-DD') : ''}
                onChange={(val) => setBirthDate(val ? dayjs(val) : null)}
                maxDate={dayjs().format('YYYY-MM-DD')}
                error={!!errors.birthDate}
                helperText={errors.birthDate}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="medium">
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gênero"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Não informado</em>
                  </MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Feminino">Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Líder de GA"
                value={formData.gaLeaderName}
                onChange={(e) => setFormData({ ...formData, gaLeaderName: e.target.value })}
                error={!!errors.gaLeaderName}
                helperText={errors.gaLeaderName || 'Ex: Israel e Paulina'}
                placeholder="Nome do seu líder de GA"
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contato do Líder de GA"
                value={formData.gaLeaderContact}
                onChange={(e) => setFormData({ ...formData, gaLeaderContact: maskPhoneBR(e.target.value) })}
                error={!!errors.gaLeaderContact}
                helperText={errors.gaLeaderContact || 'Telefone do líder'}
                placeholder="(00) 00000-0000"
                size="medium"
              />
            </Grid>

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" onClose={() => setSuccess(false)}>
                  Dados pessoais atualizados com sucesso!
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  size="small"
                  startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                  sx={{
                    px: 3,
                    py: 1,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    fontWeight: 600,
                    borderRadius: 1.5,
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

export default PersonalDataForm;
