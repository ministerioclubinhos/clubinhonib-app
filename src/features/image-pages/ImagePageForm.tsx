import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid2,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { MediaItem } from '@/store/slices/types';

import AddImagesDialog from './components/AddImagesDialog';
import ImageSectionEditor from './components/ImageSectionEditor';
import { IMAGE_PAGE_ROUTES } from './constants';
import {
  useImagePageById,
  useImagePageForm,
  useUnsavedChangesGuard,
} from './hooks';
import { ImageSectionDraft } from './types';
import { countMedia } from './utils';

interface ImagePageFormProps {
  /** True quando o admin cria a galeria a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

const emptySection = (): ImageSectionDraft => ({
  caption: '',
  description: '',
  public: true,
  mediaItems: [],
});

/** Formulário usado para criar e para editar uma galeria de fotos. */
export default function ImagePageForm({
  fromTemplatePage = false,
}: ImagePageFormProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // A galeria vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    page: loadedPage,
    loading: loadingPage,
    error: loadError,
  } = useImagePageById(fromTemplatePage ? undefined : id);

  const [sectionForImages, setSectionForImages] = useState<number | null>(null);

  const isMissingPage = !fromTemplatePage && !loadingPage && !loadedPage;

  const {
    values,
    setValue,
    sections,
    setSections,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useImagePageForm({ isCreation: fromTemplatePage, page: loadedPage });

  useUnsavedChangesGuard(isDirty);

  const totalImages = countMedia(sections);

  const updateSection = (index: number, section: ImageSectionDraft) =>
    setSections(sections.map((item, i) => (i === index ? section : item)));

  const addImagesToSection = (images: MediaItem[]) => {
    if (sectionForImages === null) return;

    setSections(
      sections.map((section, index) =>
        index === sectionForImages
          ? { ...section, mediaItems: [...section.mediaItems, ...images] }
          : section,
      ),
    );
    setSectionForImages(null);
  };

  if (loadingPage) {
    return (
      <Box data-testid="image-pages-image-page-form"
        component="section"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isMissingPage) {
    return (
      <Box data-testid="image-pages-image-page-form" component="section" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              type="button"
              onClick={() => navigate(IMAGE_PAGE_ROUTES.MANAGE)}
            >
              Ver galerias
            </Button>
          }
        >
          <AlertTitle>Galeria não encontrada</AlertTitle>
          {loadError || 'Abra a galeria que você quer editar pela lista.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box data-testid="image-pages-image-page-form" component="section" sx={{ pb: { xs: 2, md: 3 } }}>
      {!fromTemplatePage && (
        <Typography variant="h5" fontWeight={700} sx={{ mb: { xs: 2, md: 3 } }}>
          Editar Galeria de Fotos
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: { xs: 2, md: 3 } }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Informações da página
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Aparecem no topo da galeria que os visitantes abrem.
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="Título da galeria"
              fullWidth
              required
              value={values.title}
              onChange={(event) => setValue('title', event.target.value)}
              error={errors.title}
              helperText={
                errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
              }
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Descrição"
              fullWidth
              required
              multiline
              minRows={3}
              value={values.description}
              onChange={(event) => setValue('description', event.target.value)}
              error={errors.description}
              helperText={
                errors.description
                  ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                  : 'Um resumo curto do que a galeria reúne'
              }
            />
          </Grid2>

          <Grid2 size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.public}
                  onChange={(event) => setValue('public', event.target.checked)}
                />
              }
              label={
                values.public
                  ? 'Página pública'
                  : 'Página visível apenas para quem está logado'
              }
            />
          </Grid2>
        </Grid2>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: { xs: 2, md: 3 } }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Seções da galeria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cada seção agrupa um conjunto de fotos.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setSections([...sections, emptySection()])}
            fullWidth={isMobile}
            sx={{ minHeight: 44, textTransform: 'none', flexShrink: 0 }}
          >
            Nova seção
          </Button>
        </Stack>

        {sections.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              textAlign: 'center',
              borderStyle: 'dashed',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhuma seção criada ainda. Comece adicionando uma seção.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {sections.map((section, index) => (
              <ImageSectionEditor
                key={`${section.id ?? 'nova'}-${index}`}
                section={section}
                index={index}
                onChange={(next) => updateSection(index, next)}
                onRemove={() =>
                  setSections(sections.filter((_, i) => i !== index))
                }
                onAddImages={() => setSectionForImages(index)}
              />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', md: 2 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.25, sm: 2 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="body2" color="text.secondary">
            {sections.length === 0
              ? 'Nenhuma seção adicionada'
              : `${sections.length} ${sections.length === 1 ? 'seção' : 'seções'} · ${totalImages} ${totalImages === 1 ? 'imagem' : 'imagens'}`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          type="button"
          onClick={save}
          disabled={saving}
          fullWidth={isMobile}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
          }
          sx={{ minHeight: 44, textTransform: 'none', px: 3 }}
        >
          {saving ? 'Salvando...' : 'Salvar Galeria'}
        </Button>
      </Paper>

      <AddImagesDialog
        open={sectionForImages !== null}
        onClose={() => setSectionForImages(null)}
        onConfirm={addImagesToSection}
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={dismissFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback?.severity ?? 'success'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
