import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { AutoAwesome as AiIcon } from '@mui/icons-material';
import { useGenerateLessonDraft } from '../../hooks/api/useAiLessons';

interface LessonAiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (lessonId: string) => void;
}

export const LessonAiGenerateModal: React.FC<LessonAiGenerateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [theme, setTheme] = useState('');
  const [biblicalReference, setBiblicalReference] = useState('');

  const generateMutation = useGenerateLessonDraft();

  const handleGenerate = async () => {
    if (!theme || !biblicalReference) return;

    try {
      const result = await generateMutation.mutateAsync({
        theme,
        biblicalReference,
      });

      onSuccess(result.id);
      onClose();
    } catch (error) {
      console.error('Erro ao gerar lição:', error);
    }
  };

  return (
    <Dialog data-testid="ai-lessons-generate-modal" open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AiIcon color="primary" /> Gerar Nova Lição Bíblica com IA (ChatGPT)
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Informe somente o <strong>Tema</strong> e a <strong>Referência Bíblica</strong>. Primeiro será criado o pacote em rascunho; depois você gera, revisa e aprova cada material separadamente.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tema da Lição *"
            placeholder="Ex: O Poder de Jesus sobre as Doenças"
            fullWidth
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={generateMutation.isPending}
          />

          <TextField
            label="Referência Bíblica *"
            placeholder="Ex: Mateus 9:1-8 / Marcos 2:1-12"
            fullWidth
            value={biblicalReference}
            onChange={(e) => setBiblicalReference(e.target.value)}
            disabled={generateMutation.isPending}
          />

          {generateMutation.isPending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Criando o pacote de trabalho em rascunho...
              </Typography>
            </Box>
          )}

          {generateMutation.isError && (
            <Alert severity="error">
              Ocorreu um erro ao gerar a lição. Verifique os dados e tente novamente.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={generateMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<AiIcon />}
          onClick={handleGenerate}
          disabled={!theme || !biblicalReference || generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Criando...' : 'Criar pacote da lição'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
