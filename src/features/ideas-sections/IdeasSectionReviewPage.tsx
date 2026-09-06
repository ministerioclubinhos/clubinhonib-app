import { useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import BackHeader from '@/components/common/header/BackHeader';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { IdeasSectionFields } from '@/features/ideas-pages';

import { IDEAS_SECTION_ROUTES } from './constants';
import {
  useIdeasPages,
  useIdeasSectionById,
  useIdeasSectionReview,
} from './hooks';
import type { IdeasSectionDraft } from './types';
import { toSectionDraft } from './utils';

const EMPTY_DRAFT: IdeasSectionDraft = {
  title: '',
  description: '',
  public: true,
  medias: [],
};

/**
 * Revisão de uma ideia compartilhada.
 *
 * A administração ajusta o texto e as mídias e escolhe em qual página de
 * ideias a contribuição será publicada.
 */
export default function IdeasSectionReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { section, loading, error } = useIdeasSectionById(id);
  const {
    pages,
    loading: loadingPages,
    error: pagesError,
    fetchPages,
  } = useIdeasPages();
  const { saving, saveError, setSaveError, publish } = useIdeasSectionReview();

  const [draft, setDraft] = useState<IdeasSectionDraft>(EMPTY_DRAFT);
  const [pageId, setPageId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    setDraft(section ? toSectionDraft(section) : EMPTY_DRAFT);
    setSubmitted(false);
  }, [section]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === pageId) ?? null,
    [pages, pageId],
  );

  const handlePublish = async () => {
    setSubmitted(true);
    if (!section || !pageId) return;

    const ok = await publish(section.id, pageId, draft);
    if (ok) navigate(IDEAS_SECTION_ROUTES.QUEUE);
  };

  if (loading) {
    return (
      <Box data-testid="ideas-sections-ideas-section-review-page" sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!section) {
    return (
      <Box data-testid="ideas-sections-ideas-section-review-page" component="section" sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
            >
              Ver a fila
            </Button>
          }
        >
          <AlertTitle>Ideia não encontrada</AlertTitle>
          {error || 'Abra pela fila a ideia que você quer revisar.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box data-testid="ideas-sections-ideas-section-review-page"
      sx={{
        px: { xs: 2, md: 0 },
        pb: 4,
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        bgcolor: '#f9fafb',
      }}
    >
      <BackHeader title="Revisar ideia" mobileFontSize="1.05rem" />

      {saveError || pagesError ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSaveError('')}
        >
          {saveError || pagesError}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <FormControl
            size="small"
            required
            error={submitted && !pageId}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <InputLabel id="ideas-review-page">Página de destino</InputLabel>
            <Select
              labelId="ideas-review-page"
              label="Página de destino"
              value={pageId}
              onChange={(event) => setPageId(String(event.target.value))}
              disabled={loadingPages || saving}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel id="ideas-review-visibility">Visibilidade</InputLabel>
            <Select
              labelId="ideas-review-visibility"
              label="Visibilidade"
              value={draft.public ? 'true' : 'false'}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  public: event.target.value === 'true',
                }))
              }
              disabled={saving}
            >
              <MenuItem value="true">Pública</MenuItem>
              <MenuItem value="false">Privada</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={() => void handlePublish()}
            disabled={saving}
            sx={{
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Publicar ideia
          </Button>
        </Stack>

        {submitted && !pageId ? (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {FORM_VALIDATION_MESSAGES.SELECT_DESTINATION_PAGE}
          </Typography>
        ) : null}

        {selectedPage ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Publicando em <strong>{selectedPage.title}</strong>
          </Typography>
        ) : null}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 3 },
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <IdeasSectionFields
          section={draft}
          onUpdate={setDraft}
          isCreationMode={false}
          titleError={submitted && !draft.title.trim()}
        />
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
          sx={{ minHeight: 44, textTransform: 'none' }}
        >
          Voltar para a fila
        </Button>
      </Box>
    </Box>
  );
}
