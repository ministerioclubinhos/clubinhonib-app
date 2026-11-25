import { useState } from 'react';
import {
  Alert,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { apiCreatePlayCategory } from '@/features/play/api';
import { PLAY_SCOPE, PLAY_SCOPE_OPTIONS } from '@/features/play/constants';
import { usePlayCategories } from '@/features/play/hooks';
import type { PlayScope } from '@/features/play/types';
import { extractErrorMessage } from '@/utils/apiError';

interface PlaySettingsProps {
  value: PlayScope;
  onChange: (scope: PlayScope) => void;
  categoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const NO_CATEGORY = '';

/** Define se a galeria vai para o Clubinho Play (inteira ou só alguns) e em qual categoria. */
export default function PlaySettings({
  value,
  onChange,
  categoryId,
  onCategoryChange,
}: PlaySettingsProps) {
  const categories = usePlayCategories();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const createCategory = async () => {
    setCreating(true);
    setError('');
    try {
      const created = await apiCreatePlayCategory(newName.trim());
      categories.setData((current) => [...(current ?? []), created]);
      onCategoryChange(created.id);
      setNewName('');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Não foi possível criar a categoria.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Paper
      data-testid="video-page-play-settings"
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}
    >
      <Typography component="h2" variant="h6" fontWeight={700}>
        Clubinho Play
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Escolha o que desta galeria aparece na plataforma de vídeos da Área do Professor.
      </Typography>
      <RadioGroup
        name="play-scope"
        value={value}
        onChange={(event) => onChange(event.target.value as PlayScope)}
      >
        {PLAY_SCOPE_OPTIONS.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio data-testid={`play-scope-${option.value}`} />}
            label={
              <>
                <Typography component="span" fontWeight={600}>
                  {option.label}
                </Typography>
                <Typography component="span" variant="body2" color="text.secondary">
                  {' — '}
                  {option.hint}
                </Typography>
              </>
            }
            sx={{ alignItems: 'flex-start', mb: 0.5 }}
          />
        ))}
      </RadioGroup>

      {value !== PLAY_SCOPE.NONE && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <TextField
            select
            size="small"
            label="Categoria"
            value={categoryId ?? NO_CATEGORY}
            onChange={(event) => onCategoryChange(event.target.value || null)}
            helperText="Aparece como filtro e como fileira na home do Play."
            inputProps={{ 'data-testid': 'play-category-select' }}
          >
            <MenuItem value={NO_CATEGORY}>Sem categoria</MenuItem>
            {(categories.data ?? []).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Nova categoria"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              inputProps={{ maxLength: 100 }}
              fullWidth
            />
            <Button
              variant="outlined"
              disabled={!newName.trim() || creating}
              onClick={() => void createCategory()}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Criar categoria
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      )}
    </Paper>
  );
}
