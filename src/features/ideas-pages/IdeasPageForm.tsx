import { useCallback, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Grid2,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

import IdeasSectionEditor from './components/IdeasSectionEditor';
import { IDEAS_PAGE_ROUTES } from './constants';
import {
  useIdeasPageById,
  useIdeasPageForm,
  useUnsavedChangesGuard,
} from './hooks';
import { IdeasSectionDraft } from './types';
import { countMedia } from './utils';

interface IdeasPageFormProps {
  /** True quando o admin cria a página a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

const emptySection = (): IdeasSectionDraft => ({
  title: '',
  description: '',
  public: false,
  medias: [],
});

/** Formulário usado para criar e para editar uma página de ideias. */
export default function IdeasPageForm({
  fromTemplatePage = false,
}: IdeasPageFormProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // A página vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    page: loadedPage,
    loading: loadingPage,
    error: loadError,
  } = useIdeasPageById(fromTemplatePage ? undefined : id);

  // Uma mídia começada em qualquer seção conta como alteração pendente.
  const [sectionDrafts, setSectionDrafts] = useState<Record<number, boolean>>(
    {},
  );

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
  } = useIdeasPageForm({ isCreation: fromTemplatePage, page: loadedPage });

  const hasMediaDraft = Object.values(sectionDrafts).some(Boolean);
  useUnsavedChangesGuard(isDirty || hasMediaDraft);

  const totalMedia = countMedia(sections);

  const updateSection = (index: number, section: IdeasSectionDraft) =>
    setSections(sections.map((item, i) => (i === index ? section : item)));

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
    setSectionDrafts({});
  };

  const trackDraft = useCallback(
    (index: number) => (hasDraft: boolean) =>
      setSectionDrafts((previous) =>
        previous[index] === hasDraft
          ? previous
          : { ...previous, [index]: hasDraft },
      ),
    [],
  );

  if (loadingPage) {
    return (
      <Box
        component="section"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isMissingPage) {
    return (
      <Box component="section" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              type="button"
              onClick={() => navigate(IDEAS_PAGE_ROUTES.MANAGE)}
            >
              Ver páginas
            </Button>
          }
        >
          <AlertTitle>Página não encontrada</AlertTitle>
          {loadError || 'Abra a página que você quer editar pela lista.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ pb: { xs: 2, md: 3 } }}>
      {!fromTemplatePage && (
        <Typography variant="h5" fontWeight={700} sx={{ mb: { xs: 2, md: 3 } }}>
          Editar Página de Ideias
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
          Aparecem no topo da página que os professores abrem.
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="Título da página"
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
                  : 'Um resumo curto do que a página reúne'
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
              Seções da página
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cada seção reúne os documentos, imagens e vídeos de uma ideia.
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
              borderColor: errors.sections ? 'error.main' : undefined,
            }}
          >
            <Typography
              variant="body2"
              color={errors.sections ? 'error' : 'text.secondary'}
            >
              {errors.sections
                ? 'Adicione ao menos uma seção antes de salvar.'
                : 'Nenhuma seção criada ainda. Comece adicionando uma seção.'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {sections.map((section, index) => (
              <IdeasSectionEditor
                key={`${section.id ?? 'nova'}-${index}`}
                section={section}
                index={index}
                onChange={(next) => updateSection(index, next)}
                onRemove={() => removeSection(index)}
                titleError={errors.sectionTitles && !section.title.trim()}
                onDraftChange={trackDraft(index)}
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
              : `${sections.length} ${sections.length === 1 ? 'seção' : 'seções'} · ${totalMedia} ${totalMedia === 1 ? 'mídia' : 'mídias'}`}
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
            saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{ minHeight: 44, textTransform: 'none', px: 3 }}
        >
          {saving ? 'Salvando...' : 'Salvar Página'}
        </Button>
      </Paper>

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
