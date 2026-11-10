import IdeaAiComparePanel from './components/ai/IdeaAiComparePanel';
import { initialIdeaAiDecisions, excludedIdeaSourceIds } from './ai-utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { IDEAS_SECTION_ROUTES, IDEA_REVIEW_EMPTY_DRAFT } from './constants';
import IdeasSectionReviewMaterials from './components/review/IdeasSectionReviewMaterials';
import {
  useIdeasPages,
  useIdeasSectionById,
  useIdeasSectionReview,
  useIdeaAiReprocess,
} from './hooks';
import type { IdeasSectionDraft, IdeaAiDecisions } from './types';
import { toSectionDraft } from './utils';

/**
 * Revisão de uma ideia compartilhada.
 *
 * A administração ajusta o texto e as mídias e escolhe em qual página de
 * ideias a contribuição será publicada.
 */
export default function IdeasSectionReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { section, loading, error, refresh } = useIdeasSectionById(id);
  const { pages, loading: loadingPages, error: pagesError, fetchPages } = useIdeasPages();
  const { saving, saveError, setSaveError, publish } = useIdeasSectionReview();

  const ai = useIdeaAiReprocess(id, refresh);
  const [decisions, setDecisions] = useState<IdeaAiDecisions | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const initialized = useRef<string | null>(null);
  const resultId = useRef<string | null>(null);
  const [draft, setDraft] = useState<IdeasSectionDraft>(IDEA_REVIEW_EMPTY_DRAFT);
  const [pageId, setPageId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    if (section && initialized.current !== section.id) {
      initialized.current = section.id;
      setDraft(toSectionDraft(section));
      setSubmitted(false);
    }
    const currentId = section?.aiEnhancement?.currentResult?.id ?? null;
    if (currentId !== resultId.current) {
      resultId.current = currentId;
      setDecisions(initialIdeaAiDecisions(section?.aiEnhancement));
      setConfirmed(false);
    }
  }, [section]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === pageId) ?? null,
    [pages, pageId]
  );

  const excludedMediaIds = useMemo(
    () => (section ? excludedIdeaSourceIds(section, draft.medias) : []),
    [section, draft.medias]
  );

  const handlePublish = async (ignoreAiEnhancement = false) => {
    setSubmitted(true);
    if (!section || !pageId) return;

    if (section.aiEnhancement?.activeAttempt && !ignoreAiEnhancement) {
      setConfirmOriginal(true);
      return;
    }
    if (decisions && !confirmed && !ignoreAiEnhancement) return;
    setConfirmOriginal(false);
    const ok = await publish(section.id, pageId, {
      ...draft,
      ...(decisions && !ignoreAiEnhancement
        ? {
            aiDecisions: {
              ...decisions,
              medias: decisions.medias.filter((m) => !excludedMediaIds.includes(m.sourceMediaId)),
            },
          }
        : {}),
      ignoreAiEnhancement,
    });
    if (ok) navigate(IDEAS_SECTION_ROUTES.QUEUE);
  };

  if (loading) {
    return (
      <Box
        data-testid="ideas-sections-ideas-section-review-page"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!section) {
    return (
      <Box
        data-testid="ideas-sections-ideas-section-review-page"
        component="section"
        sx={{ p: { xs: 2, md: 3 } }}
      >
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
    <Box
      data-testid="ideas-sections-ideas-section-review-page"
      sx={{
        py: { xs: 2, md: 3 },
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        bgcolor: 'grey.50',
      }}
    >
      <Container maxWidth={false} sx={{ width: { xs: '98%', md: '95%' }, px: '0 !important' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'minmax(0, 1fr) 300px',
            },
            gridTemplateAreas: {
              xs: '"header" "compare" "editor" "sidebar" "footer"',
              md: '"header header" "compare sidebar" "editor sidebar" "footer footer"',
            },
            alignItems: 'start',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ gridArea: 'header' }}>
            <Button
              type="button"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
              sx={{ minHeight: 44, mb: 1 }}
            >
              Ideias compartilhadas
            </Button>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={800}
              sx={{ mb: 0.5, fontSize: { xs: 26, md: 30 } }}
            >
              Revisar ideia compartilhada
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Compare o original com a versão da IA, confirme suas escolhas e publique.
            </Typography>
            {saveError || pagesError ? (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
                {saveError || pagesError}
              </Alert>
            ) : null}
          </Box>

          <Box sx={{ gridArea: 'compare', minWidth: 0 }}>
            <IdeaAiComparePanel
              excludedMediaIds={excludedMediaIds}
              section={section}
              decisions={decisions}
              onChange={(value) => {
                setDecisions(value);
                setConfirmed(false);
              }}
              onRetry={() => void ai.reprocess()}
              retrying={ai.retrying}
              disabled={saving}
              error={ai.error || error}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              minWidth: 0,
              gridArea: 'sidebar',
              position: { md: 'sticky' },
              top: { md: 2 },
            }}
          >
            <Stack direction="column" spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
              <Typography component="h2" variant="h6" fontWeight={800}>
                Publicação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                O original ficará preservado após a publicação.
              </Typography>
              {decisions && (
                <FormControlLabel
                  control={
                    <Checkbox
                      data-testid="idea-ai-confirm-choices"
                      checked={confirmed}
                      onChange={(event) => setConfirmed(event.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Revisei e confirmo as versões escolhidas"
                />
              )}
              {submitted && decisions && !confirmed && (
                <Alert severity="warning">Confirme as escolhas acima antes de publicar.</Alert>
              )}
              <FormControl
                size="small"
                required
                error={submitted && !pageId}
                sx={{ width: '100%', minWidth: 0 }}
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

              <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
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
                type="button"
                data-testid="idea-review-publish"
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => void handlePublish()}
                disabled={saving || Boolean(section.pageId)}
                fullWidth
                sx={{
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {section.pageId ? 'Ideia já publicada' : 'Publicar ideia'}
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
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              minWidth: 0,
              gridArea: 'editor',
            }}
          >
            <Stack spacing={3}>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Ajustes e materiais adicionais
              </Typography>
              {!decisions && (
                <>
                  <TextField
                    label="Título da ideia"
                    value={draft.title}
                    fullWidth
                    inputProps={{ maxLength: 120, 'data-testid': 'ideas-section-review-title' }}
                    onChange={(event) =>
                      setDraft((previous) => ({ ...previous, title: event.target.value }))
                    }
                    error={submitted && !draft.title.trim()}
                    helperText={
                      submitted && !draft.title.trim()
                        ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                        : `${draft.title.length}/120`
                    }
                  />
                  <TextField
                    label="Descrição da ideia"
                    value={draft.description}
                    fullWidth
                    multiline
                    minRows={5}
                    inputProps={{
                      maxLength: 2000,
                      'data-testid': 'ideas-section-review-description',
                    }}
                    onChange={(event) =>
                      setDraft((previous) => ({ ...previous, description: event.target.value }))
                    }
                    helperText={`${draft.description.length}/2000`}
                  />
                </>
              )}
              {decisions && (
                <Alert severity="info">
                  O título e a descrição seguem as versões escolhidas na comparação acima. Materiais
                  removidos abaixo continuam preservados no original.
                </Alert>
              )}
              <IdeasSectionReviewMaterials
                medias={draft.medias}
                onChange={(medias) => {
                  setDraft((previous) => ({ ...previous, medias }));
                  setConfirmed(false);
                }}
                disabled={saving}
              />
            </Stack>
          </Paper>

          <Box sx={{ mt: 0, gridArea: 'footer' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Voltar para a fila
            </Button>
          </Box>
        </Box>
      </Container>
      <Dialog
        data-testid="idea-ai-publish-original-dialog"
        open={confirmOriginal}
        onClose={() => setConfirmOriginal(false)}
      >
        <DialogTitle>A IA ainda está trabalhando</DialogTitle>
        <DialogContent>
          Publicar com o original? A tentativa em andamento será cancelada e nenhum resultado
          posterior será aplicado.
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setConfirmOriginal(false)}>
            Aguardar a IA
          </Button>
          <Button
            type="button"
            data-testid="idea-ai-confirm-publish-original"
            onClick={() => void handlePublish(true)}
            disabled={saving}
          >
            Publicar original
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
