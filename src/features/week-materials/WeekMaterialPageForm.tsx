import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { MediaType } from '@/store/slices/types';

import { MediaEditor } from '@/components/common/media';
import {
  WEEK_MATERIAL_MEDIA_TABS,
  WEEK_MATERIAL_ROUTES,
  WEEK_MEDIA_EDITOR_CONFIG,
} from './constants';
import {
  useUnsavedChangesGuard,
  useWeekMaterialById,
  useWeekMaterialForm,
} from './hooks';
import { toMediaDraft } from './utils';
import { WeekMaterialMediaDraft } from './types';

interface WeekMaterialPageFormProps {
  /** True quando o admin está criando a página a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

const MEDIA_DRAFT_KEY: Record<MediaType, keyof WeekMaterialMediaDraft> = {
  [MediaType.VIDEO]: 'videos',
  [MediaType.DOCUMENT]: 'documents',
  [MediaType.IMAGE]: 'images',
  [MediaType.AUDIO]: 'audios',
};

const EMPTY_VALUES = {
  pageTitle: '',
  pageSubtitle: '',
  pageDescription: '',
  currentWeek: false,
};

const EMPTY_MEDIA: WeekMaterialMediaDraft = {
  videos: [],
  documents: [],
  images: [],
  audios: [],
};

/** Formulário usado para criar e para editar uma página de material semanal. */
export default function WeekMaterialPageForm({
  fromTemplatePage = false,
}: WeekMaterialPageFormProps) {
  // A página vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    material: loadedMaterial,
    loading: loadingMaterial,
    error: loadError,
  } = useWeekMaterialById(fromTemplatePage ? undefined : id);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0);
  const [pendingTab, setPendingTab] = useState<number | null>(null);
  const [hasMediaDraft, setHasMediaDraft] = useState(false);

  const isMissingPageToEdit =
    !fromTemplatePage && !loadingMaterial && !loadedMaterial;

  const {
    values,
    setValue,
    media,
    setMedia,
    reset,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useWeekMaterialForm({
    isCreation: fromTemplatePage,
    pageId: loadedMaterial?.id,
  });

  useEffect(() => {
    if (fromTemplatePage) {
      reset(EMPTY_VALUES, EMPTY_MEDIA);
    }
  }, [fromTemplatePage, reset]);

  useEffect(() => {
    if (fromTemplatePage || !loadedMaterial) return;

    reset(
      {
        pageTitle: loadedMaterial.title,
        pageSubtitle: loadedMaterial.subtitle,
        pageDescription: loadedMaterial.description,
        currentWeek: loadedMaterial.currentWeek,
      },
      toMediaDraft(loadedMaterial),
    );
  }, [fromTemplatePage, loadedMaterial, reset]);

  const activeTab = WEEK_MATERIAL_MEDIA_TABS[tab];
  const activeKey = MEDIA_DRAFT_KEY[activeTab.mediaType];

  const totalMedia = useMemo(
    () =>
      media.videos.length +
      media.documents.length +
      media.images.length +
      media.audios.length,
    [media],
  );

  const hasFieldErrors = errors.title || errors.subtitle || errors.description;

  useUnsavedChangesGuard(isDirty || hasMediaDraft);

  // Trocar de aba remonta o editor e descarta o rascunho: confirmar antes.
  const handleTabChange = (nextTab: number) => {
    if (hasMediaDraft) {
      setPendingTab(nextTab);
      return;
    }
    setTab(nextTab);
  };

  const confirmTabChange = () => {
    if (pendingTab === null) return;
    setHasMediaDraft(false);
    setTab(pendingTab);
    setPendingTab(null);
  };

  if (loadingMaterial) {
    return (
      <Box
        component="section"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isMissingPageToEdit) {
    return (
      <Box component="section" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              type="button"
              onClick={() => navigate(WEEK_MATERIAL_ROUTES.MANAGE_PAGES)}
            >
              Ver materiais
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
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          Editar Semana
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
          <Grid2 size={{ xs: 12, md: 5 }}>
            <TextField
              label="Semana"
              fullWidth
              required
              value={values.pageTitle}
              onChange={(event) => setValue('pageTitle', event.target.value)}
              error={errors.title}
              helperText={
                errors.title
                  ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                  : 'Ex.: Semana 12'
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 7 }}>
            <TextField
              label="Tema da Semana"
              fullWidth
              required
              value={values.pageSubtitle}
              onChange={(event) => setValue('pageSubtitle', event.target.value)}
              error={errors.subtitle}
              helperText={
                errors.subtitle
                  ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                  : 'Assunto tratado na visita'
              }
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Descrição do Tema da Semana"
              fullWidth
              required
              multiline
              minRows={3}
              value={values.pageDescription}
              onChange={(event) =>
                setValue('pageDescription', event.target.value)
              }
              error={errors.description}
              helperText={
                errors.description
                  ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                  : 'Um resumo curto do que será trabalhado'
              }
            />
          </Grid2>
        </Grid2>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Materiais da Semana
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione os arquivos e links de cada tipo. Nenhum tipo é obrigatório.
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value: number) => handleTabChange(value)}
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="Tipos de material da semana"
          sx={{
            px: { xs: 0, md: 2 },
            mt: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          {WEEK_MATERIAL_MEDIA_TABS.map((mediaTab) => {
            const count = media[MEDIA_DRAFT_KEY[mediaTab.mediaType]].length;

            return (
              <Tab
                key={mediaTab.mediaType}
                aria-label={`${mediaTab.label}${count > 0 ? `: ${count}` : ''}`}
                label={
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Box component="span" aria-hidden>
                      {mediaTab.icon}
                    </Box>
                    {!isMobile && (
                      <Box component="span">{mediaTab.label}</Box>
                    )}
                    {count > 0 && (
                      <Chip
                        label={count}
                        size="small"
                        color="primary"
                        sx={{ height: 20, '& .MuiChip-label': { px: 0.75 } }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <MediaEditor
            key={activeTab.mediaType}
            config={WEEK_MEDIA_EDITOR_CONFIG[activeTab.mediaType]}
            items={media[activeKey]}
            onChange={(items) => setMedia(activeKey, items)}
            onDraftChange={setHasMediaDraft}
          />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          pb: {
            xs: 'calc(12px + env(safe-area-inset-bottom))',
            md: 2,
          },
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.25, sm: 2 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          {hasFieldErrors ? (
            <Typography variant="body2" color="error">
              {FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {totalMedia === 0
                ? 'Nenhum material adicionado'
                : `${totalMedia} ${totalMedia === 1 ? 'material' : 'materiais'} nesta página`}
            </Typography>
          )}
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

      <Dialog
        open={pendingTab !== null}
        onClose={() => setPendingTab(null)}
        aria-labelledby="descartar-rascunho-titulo"
      >
        <DialogTitle id="descartar-rascunho-titulo">
          Descartar {activeTab.label.toLowerCase()} em edição?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você começou a preencher um item em {activeTab.label} e ainda não o
            adicionou. Ao trocar de aba, esse preenchimento é perdido. Os itens
            já adicionados continuam salvos no formulário.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setPendingTab(null)}>
            Continuar preenchendo
          </Button>
          <Button type="button" color="error" onClick={confirmTabChange}>
            Descartar
          </Button>
        </DialogActions>
      </Dialog>

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
