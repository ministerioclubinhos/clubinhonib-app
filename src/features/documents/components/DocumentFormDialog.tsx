import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

import type { DocumentFormValues, DocumentResponse } from '../types';
import { MediaUploadType } from '../types';
import { hasErrors, toFormValues, validateForm } from '../utils';
import DocumentMediaForm from './DocumentMediaForm';

interface Props {
  open: boolean;
  /** `null` cria; um documento edita. */
  document: DocumentResponse | null;
  saving: boolean;
  error: string;
  onDismissError: () => void;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => Promise<boolean>;
}

const NO_ERRORS = { name: false, description: false, media: false };

/** Formulário de criação e edição de documento. */
export default function DocumentFormDialog({
  open,
  document,
  saving,
  error,
  onDismissError,
  onClose,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [values, setValues] = useState<DocumentFormValues>(() =>
    toFormValues(document),
  );
  const [errors, setErrors] = useState(NO_ERRORS);

  const isEditing = Boolean(document?.id);

  // O estado vem por prop, não pelo store: antes a edição dependia de um dado
  // guardado no Redux, e reabrir o formulário logo depois de outro documento
  // mostrava os campos do anterior.
  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(document));
    setErrors(NO_ERRORS);
    onDismissError();
  }, [open, document, onDismissError]);

  const setValue = <K extends keyof DocumentFormValues>(
    key: K,
    value: DocumentFormValues[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const saved = await onSubmit(values);
    if (saved) onClose();
  };

  const storedMedia = values.storedMedia;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          fontWeight: 700,
        }}
      >
        {isEditing ? 'Editar documento' : 'Novo documento'}
        <IconButton
          onClick={onClose}
          disabled={saving}
          aria-label="Fechar"
          sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onDismissError}>
            {error}
          </Alert>
        ) : null}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Nome do documento"
              value={values.name}
              onChange={(event) => setValue('name', event.target.value)}
              error={errors.name}
              helperText={errors.name ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ' '}
              disabled={saving}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Descrição"
              multiline
              rows={2}
              value={values.description}
              onChange={(event) => setValue('description', event.target.value)}
              error={errors.description}
              helperText={
                errors.description ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ' '
              }
              disabled={saving}
            />
          </Grid2>
        </Grid2>

        <Paper
          variant="outlined"
          sx={{ mt: 1, p: { xs: 1.5, sm: 2.5 }, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Arquivo ou link
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            O título e a descrição da mídia acompanham os do documento.
          </Typography>

          <Grid2 container spacing={2}>
            <DocumentMediaForm
              uploadType={values.uploadType}
              setUploadType={(value) => setValue('uploadType', value)}
              url={values.url}
              setUrl={(value) => setValue('url', value)}
              platformType={values.platformType}
              setPlatformType={(value) => setValue('platformType', value)}
              file={values.file}
              setFile={(file) => setValue('file', file)}
              existingMedia={
                storedMedia
                  ? storedMedia.isLocalFile
                    ? {
                        type: 'upload',
                        fileName: storedMedia.originalName || 'Arquivo enviado',
                      }
                    : { type: 'link', url: storedMedia.url }
                  : null
              }
            />
          </Grid2>

          {errors.media ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {values.uploadType === MediaUploadType.LINK
                ? 'Informe o link do documento.'
                : 'Selecione o arquivo do documento.'}
            </Alert>
          ) : null}
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            fullWidth={isMobile}
            sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
          >
            {isEditing ? 'Salvar alterações' : 'Criar documento'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
