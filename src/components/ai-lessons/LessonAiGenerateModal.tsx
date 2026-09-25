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
  const [lessonTheme, setLessonTheme] = useState('');
  const [biblicalReference, setBiblicalReference] = useState('');

  const generateMutation = useGenerateLessonDraft();

  const handleGenerate = async () => {
    if (!lessonTheme.trim() || !biblicalReference.trim()) return;

    try {
      const result = await generateMutation.mutateAsync({
        theme: lessonTheme.trim(),
        biblicalReference: biblicalReference.trim(),
      });

      onSuccess(result.id);
      onClose();
    } catch (error) {
      console.error('Erro ao gerar lição:', error);
    }
  };

  const handleCloseModal = () => {
    setLessonTheme('');
    setBiblicalReference('');
    onClose();
  };

  return (
    <Dialog
      data-testid="ai-lessons-generate-modal"
      open={open}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AiIcon color="primary" /> Criar Pacote de Nova Lição
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          Informe o <strong>Tema/Título</strong> e as <strong>Referências Bíblicas</strong> (suporta múltiplas referências separadas por <code>/</code>, <code>;</code> ou vírgula).
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Tema / Título da Lição *"
            placeholder="Ex: A última ceia do Senhor com os discípulos"
            fullWidth
            value={lessonTheme}
            onChange={(e) => setLessonTheme(e.target.value)}
            disabled={generateMutation.isPending}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />

          <TextField
            label="Texto / Referências Bíblicas *"
            placeholder="Ex: Mateus 26:17-30 / Marcos 14:12-26 / Lucas 22:7-39"
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            value={biblicalReference}
            onChange={(e) => setBiblicalReference(e.target.value)}
            disabled={generateMutation.isPending}
            helperText="Suporta múltiplas referências paralelas separadas por barra ( / ), ponto e vírgula ( ; ) ou quebra de linha."
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />

          {generateMutation.isPending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Criando o pacote de trabalho em rascunho...
              </Typography>
            </Box>
          )}

          {generateMutation.isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Ocorreu um erro ao criar a lição. Verifique os dados e tente novamente.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCloseModal} disabled={generateMutation.isPending} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<AiIcon />}
          onClick={handleGenerate}
          disabled={!lessonTheme.trim() || !biblicalReference.trim() || generateMutation.isPending}
          sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none' }}
        >
          {generateMutation.isPending ? 'Criando...' : 'Criar pacote da lição'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
