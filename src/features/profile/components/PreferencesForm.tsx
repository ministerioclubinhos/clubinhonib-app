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
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/Save';
import { UserPreferences, UpdateUserPreferencesDto } from '../types';
import { apiUpdateCompleteProfile, apiUpdateProfileById } from '../api';
import { extractErrorMessage } from '@/utils/apiError';

interface PreferencesFormProps {
  preferences: UserPreferences | undefined;
  onUpdate: () => void;
  onError: (error: string) => void;
  userId?: string;
}

const LOVE_LANGUAGES_OPTIONS = [
  'Toque',
  'Palavras',
  'Tempo de qualidade',
  'Presente',
  'Atos de serviço',
];

const TEMPERAMENTS_OPTIONS = [
  'Colérico',
  'Sanguíneo',
  'Melancólico',
  'Fleumático',
];

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onUpdate,
  onError,
  userId,
}) => {
  const [formData, setFormData] = useState<UpdateUserPreferencesDto>({
    loveLanguages: '',
    temperaments: '',
    favoriteColor: '',
    favoriteFood: '',
    favoriteMusic: '',
    whatMakesYouSmile: '',
    skillsAndTalents: '',
  });
  const [selectedLoveLanguages, setSelectedLoveLanguages] = useState<string[]>([]);
  const [selectedTemperaments, setSelectedTemperaments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        loveLanguages: preferences.loveLanguages || '',
        temperaments: preferences.temperaments || '',
        favoriteColor: preferences.favoriteColor || '',
        favoriteFood: preferences.favoriteFood || '',
        favoriteMusic: preferences.favoriteMusic || '',
        whatMakesYouSmile: preferences.whatMakesYouSmile || '',
        skillsAndTalents: preferences.skillsAndTalents || '',
      });

      if (preferences.loveLanguages) {
        setSelectedLoveLanguages(preferences.loveLanguages.split(', ').filter(Boolean));
      }
      if (preferences.temperaments) {
        setSelectedTemperaments(preferences.temperaments.split(' ').filter(Boolean));
      }
    }
  }, [preferences]);

  const handleLoveLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selected = typeof value === 'string' ? value.split(',') : value;
    setSelectedLoveLanguages(selected);
    setFormData({ ...formData, loveLanguages: selected.join(', ') });
  };

  const handleTemperamentsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const selected = typeof value === 'string' ? value.split(',') : value;

    if (selected.length <= 4) {
      setSelectedTemperaments(selected);
      setFormData({ ...formData, temperaments: selected.join(' ') });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    onError('');

    setIsSubmitting(true);
    try {
      const payload: UpdateUserPreferencesDto = {};

      if (formData.loveLanguages !== (preferences?.loveLanguages || '')) {
        payload.loveLanguages = formData.loveLanguages || undefined;
      }
      if (formData.temperaments !== (preferences?.temperaments || '')) {
        payload.temperaments = formData.temperaments || undefined;
      }
      if (formData.favoriteColor?.trim() !== (preferences?.favoriteColor || '')) {
        payload.favoriteColor = formData.favoriteColor?.trim() || undefined;
      }
      if (formData.favoriteFood?.trim() !== (preferences?.favoriteFood || '')) {
        payload.favoriteFood = formData.favoriteFood?.trim() || undefined;
      }
      if (formData.favoriteMusic?.trim() !== (preferences?.favoriteMusic || '')) {
        payload.favoriteMusic = formData.favoriteMusic?.trim() || undefined;
      }
      if (formData.whatMakesYouSmile?.trim() !== (preferences?.whatMakesYouSmile || '')) {
        payload.whatMakesYouSmile = formData.whatMakesYouSmile?.trim() || undefined;
      }
      if (formData.skillsAndTalents?.trim() !== (preferences?.skillsAndTalents || '')) {
        payload.skillsAndTalents = formData.skillsAndTalents?.trim() || undefined;
      }

      if (Object.keys(payload).length === 0) {
        onError('Nenhuma alteração foi feita');
        setIsSubmitting(false);
        return;
      }

      if (userId) {
        await apiUpdateProfileById(userId, { preferences: payload });
      } else {
        await apiUpdateCompleteProfile({ preferences: payload });
      }

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Erro ao atualizar preferências');
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
              <FormControl fullWidth>
                <InputLabel id="love-languages-label">Linguagens do Amor</InputLabel>
                <Select
                  labelId="love-languages-label"
                  multiple
                  value={selectedLoveLanguages}
                  onChange={handleLoveLanguagesChange}
                  input={<OutlinedInput label="Linguagens do Amor" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {LOVE_LANGUAGES_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="temperaments-label">Temperamentos</InputLabel>
                <Select
                  labelId="temperaments-label"
                  multiple
                  value={selectedTemperaments}
                  onChange={handleTemperamentsChange}
                  input={<OutlinedInput label="Temperamentos" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {TEMPERAMENTS_OPTIONS.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Cor Favorita"
                value={formData.favoriteColor}
                onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })}
                placeholder="Ex: Azul Marinho"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Comida Favorita"
                value={formData.favoriteFood}
                onChange={(e) => setFormData({ ...formData, favoriteFood: e.target.value })}
                placeholder="Ex: Peixe"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Música Favorita"
                value={formData.favoriteMusic}
                onChange={(e) => setFormData({ ...formData, favoriteMusic: e.target.value })}
                placeholder="Ex: Nas estrelas"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="O que te faz sorrir?"
                value={formData.whatMakesYouSmile}
                onChange={(e) => setFormData({ ...formData, whatMakesYouSmile: e.target.value })}
                placeholder="Conte-nos o que te traz alegria..."
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Habilidades e Talentos"
                value={formData.skillsAndTalents}
                onChange={(e) => setFormData({ ...formData, skillsAndTalents: e.target.value })}
                placeholder="Ex: Desenho, pintura, escultura..."
                size="small"
              />
            </Grid>

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" onClose={() => setSuccess(false)}>
                  Preferências atualizadas com sucesso!
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

export default PreferencesForm;
