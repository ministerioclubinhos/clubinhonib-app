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
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { STICKY_ACTION_BAR_Z_INDEX } from '@/constants/app';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { useUnsavedChangesGuard } from '@/hooks';
import {
  HTTP_CONFLICT,
  IDEAS_SECTION_ROUTES,
  IDEA_REVIEW_EMPTY_DRAFT,
  IDEA_REVIEW_MAX_DESCRIPTION,
  IDEA_REVIEW_MAX_TITLE,
} from './constants';
import IdeaAiRegenerateDialog from './components/ai/IdeaAiRegenerateDialog';
import IdeaAiComparePanel from './components/ai/IdeaAiComparePanel';
import IdeaAiStatusPanel from './components/ai/IdeaAiStatusPanel';
import IdeasSectionReviewFields from './components/review/IdeasSectionReviewFields';
import IdeasSectionReviewMaterials from './components/review/IdeasSectionReviewMaterials';
import ReviewStepCard from './components/review/ReviewStepCard';
import {
  useIdeasPages,
  useIdeasSectionById,
  useIdeasSectionReview,
  useIdeaAiActions,
} from './hooks';
import {
  ideaAiChoiceSummary,
  initialIdeaAiDecisions,
  initialIdeaAiFinalText,
  excludedIdeaSourceIds,
} from './ai-utils';
import type { IdeasSectionDraft, IdeaAiDecisions } from './types';
import { toSectionDraft } from './utils';

/**
 * Revisão de uma ideia compartilhada, em quatro etapas numeradas.
 *
 * 1. o estado da melhoria por IA; 2. a escolha entre original e versão da IA
 * (ou a edição direta do texto, quando não há o que comparar); 3. os
 * materiais que acompanham a publicação; 4. o destino e a publicação.
 */
export default function IdeasSectionReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { section, loading, error, refresh } = useIdeasSectionById(id);
  const { pages, loading: loadingPages, error: pagesError, fetchPages } = useIdeasPages();
  const { saving, saveError, saveErrorStatus, setSaveError, publish } = useIdeasSectionReview();
  const { enqueueSnackbar } = useSnackbar();

  const ai = useIdeaAiActions(id, refresh);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [resultNotice, setResultNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const [decisions, setDecisions] = useState<IdeaAiDecisions | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const initialized = useRef<string | null>(null);
  const resultId = useRef<string | null>(null);
  const [draft, setDraft] = useState<IdeasSectionDraft>(IDEA_REVIEW_EMPTY_DRAFT);
  const [pageId, setPageId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const publicationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    if (!section) return;
    const firstLoad = initialized.current !== section.id;
    if (firstLoad) {
      initialized.current = section.id;
      setDraft(toSectionDraft(section));
      setSubmitted(false);
      setDirty(false);
    }
    const currentId = section.aiEnhancement?.currentResult?.id ?? null;
    if (currentId !== resultId.current) {
      const replaced = !firstLoad;
      resultId.current = currentId;
      const next = initialIdeaAiDecisions(section.aiEnhancement);
      setDecisions(next);
      setConfirmed(false);
      // O texto final parte da versão escolhida de cada campo.
      if (next)
        setDraft((previous) => ({
          ...previous,
          ...initialIdeaAiFinalText(section.aiEnhancement, next, previous),
        }));
      if (replaced && currentId)
        setResultNotice(
          'Chegou um novo resultado da IA. As escolhas e o texto da etapa 2 voltaram às versões sugeridas.'
        );
    }
  }, [section]);

  const published = Boolean(section?.pageId);
  useUnsavedChangesGuard(dirty && !published && !saving);
  const edit = () => setDirty(true);

  // Decisões desatualizadas (outro admin regenerou ou trocou o resultado).
  useEffect(() => {
    if (saveErrorStatus === HTTP_CONFLICT) refresh();
  }, [saveErrorStatus, refresh]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === pageId) ?? null,
    [pages, pageId]
  );

  const excludedMediaIds = useMemo(
    () => (section ? excludedIdeaSourceIds(section, draft.medias) : []),
    [section, draft.medias]
  );

  const choiceSummary = useMemo(
    () => ideaAiChoiceSummary(decisions, excludedMediaIds),
    [decisions, excludedMediaIds]
  );

  const titleInvalid = !draft.title.trim() || draft.title.length > IDEA_REVIEW_MAX_TITLE;
  const descriptionInvalid =
    !draft.description.trim() || draft.description.length > IDEA_REVIEW_MAX_DESCRIPTION;
  const textInvalid = titleInvalid || descriptionInvalid;

  const handlePublish = async (ignoreAiEnhancement = false) => {
    setSubmitted(true);
    if (!section || !pageId || textInvalid || published) return;

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
    if (ok) {
      setDirty(false);
      enqueueSnackbar(
        `Ideia publicada${selectedPage ? ` em ${selectedPage.title}` : ''}.`,
        { variant: 'success' }
      );
      navigate(IDEAS_SECTION_ROUTES.QUEUE);
    }
  };

  /**
   * O que ainda falta para publicar. A barra fixa do celular mostra o motivo
   * e leva até a etapa 4, que fica a algumas telas de distância.
   */
  const blockedReason = !pageId
    ? FORM_VALIDATION_MESSAGES.SELECT_DESTINATION_PAGE
    : textInvalid
      ? 'Revise o título e a descrição da etapa 2.'
      : decisions && !confirmed
      ? 'Confirme as escolhas da etapa 2 antes de publicar.'
      : '';

  const requestPublish = () => {
    if (blockedReason) {
      setSubmitted(true);
      publicationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    void handlePublish();
  };

  if (loading) {
    return (
      <Box
        data-testid="ideas-sections-ideas-section-review-page"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress data-testid="idea-review-loading" aria-label="Carregando a ideia" />
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
          data-testid="idea-review-not-found"
          severity={error ? 'error' : 'info'}
          action={
            <Stack direction="row" gap={1}>
              {error && (
                <Button
                  data-testid="idea-review-retry"
                  color="inherit"
                  onClick={refresh}
                  sx={{ minHeight: 44 }}
                >
                  Tentar novamente
                </Button>
              )}
              <Button
                data-testid="idea-review-open-queue"
                color="inherit"
                onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
                sx={{ minHeight: 44 }}
              >
                Ver a fila
              </Button>
            </Stack>
          }
        >
          <AlertTitle>{error ? 'Não foi possível abrir a ideia' : 'Ideia não encontrada'}</AlertTitle>
          {error || 'Abra pela fila a ideia que você quer revisar.'}
        </Alert>
      </Box>
    );
  }

  const readOnly = saving || published;

  return (
    <Box
      data-testid="ideas-sections-ideas-section-review-page"
      sx={{
        pt: { xs: 2, md: 3 },
        /* Espaço para a barra fixa de publicação no celular. */
        pb: { xs: 13, md: 3 },
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        bgcolor: 'grey.50',
      }}
    >
      {/* Largura padrão do site: 98% no celular, 95% a partir do desktop. */}
      <Container maxWidth={false} sx={{ width: { xs: '98%', md: '95%' }, px: '0 !important' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'minmax(0, 1fr) 320px',
            },
            gridTemplateAreas: {
              xs: '"header" "status" "choices" "materials" "publish" "footer"',
              md: `"header header" "status publish" "choices publish" "materials publish" "footer footer"`,
            },
            alignItems: 'start',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ gridArea: 'header' }}>
            <Button
              type="button"
              data-testid="idea-review-back-top"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
              sx={{ minHeight: 44, mb: 1, textTransform: 'none' }}
            >
              Ideias compartilhadas
            </Button>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={800}
              sx={{ mb: 0.5, fontSize: { xs: 24, md: 30 } }}
            >
              Revisar ideia compartilhada
            </Typography>
            <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {section.title || 'Ideia sem título'}
            </Typography>
            {published ? (
              <Alert data-testid="idea-review-published" severity="success" sx={{ mt: 2 }}>
                Esta ideia já foi publicada. As etapas abaixo ficam disponíveis só para consulta.
              </Alert>
            ) : null}
            {resultNotice ? (
              <Alert
                data-testid="idea-ai-new-result"
                severity="info"
                sx={{ mt: 2 }}
                onClose={() => setResultNotice('')}
              >
                {resultNotice}
              </Alert>
            ) : null}
            {saveError ? (
              <Alert
                data-testid="idea-review-save-error"
                severity="error"
                sx={{ mt: 2 }}
                onClose={() => setSaveError('')}
              >
                {saveError}
                {saveErrorStatus === HTTP_CONFLICT
                  ? ' A revisão foi atualizada: confira a etapa 2 e confirme de novo.'
                  : ''}
              </Alert>
            ) : null}
            {pagesError ? (
              <Alert
                data-testid="idea-review-pages-error"
                severity="error"
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" onClick={() => void fetchPages()} sx={{ minHeight: 44 }}>
                    Tentar novamente
                  </Button>
                }
              >
                {pagesError}
              </Alert>
            ) : null}
          </Box>

          <ReviewStepCard
            step={1}
            title="Melhoria com IA"
            description="A IA pode ter começado sozinha no envio. Você pode regenerar tudo ou só partes, com orientações. O original fica sempre preservado."
            testId="idea-review-step-ai"
            sx={{ gridArea: 'status' }}
          >
            <IdeaAiStatusPanel
              section={section}
              onRegenerate={() => setRegenerateOpen(true)}
              onCancel={() => void ai.cancel()}
              onRestore={(attemptId) => void ai.restore(attemptId)}
              busy={ai.busy}
              disabled={saving}
              error={ai.error || error}
            />
          </ReviewStepCard>

          <ReviewStepCard
            step={2}
            title={decisions ? 'Escolha o que será publicado' : 'Texto da publicação'}
            description={
              decisions
                ? 'Para cada item, compare as duas versões e escolha uma. O que você escolher aqui é o que vai ao ar.'
                : 'Ajuste o título e a descrição que irão para a página de ideias.'
            }
            testId="idea-review-step-choices"
            sx={{ gridArea: 'choices' }}
          >
            {decisions ? (
              <IdeaAiComparePanel
                excludedMediaIds={excludedMediaIds}
                section={section}
                decisions={decisions}
                onChange={(value) => {
                  setDecisions(value);
                  setConfirmed(false);
                  edit();
                }}
                text={{ title: draft.title, description: draft.description }}
                onTextChange={(patch) => {
                  setDraft((previous) => ({ ...previous, ...patch }));
                  setConfirmed(false);
                  edit();
                }}
                disabled={readOnly}
              />
            ) : (
              <IdeasSectionReviewFields
                title={draft.title}
                description={draft.description}
                submitted={submitted}
                disabled={readOnly}
                onChange={(patch) => {
                  setDraft((previous) => ({ ...previous, ...patch }));
                  edit();
                }}
              />
            )}
          </ReviewStepCard>

          <ReviewStepCard
            step={3}
            title="Materiais da publicação"
            description="Os arquivos que vão junto com a ideia. Remover aqui tira o material da publicação; o original continua preservado."
            testId="idea-review-step-materials"
            sx={{ gridArea: 'materials' }}
          >
            <IdeasSectionReviewMaterials
              medias={draft.medias}
              onChange={(medias) => {
                setDraft((previous) => ({ ...previous, medias }));
                setConfirmed(false);
                edit();
              }}
              disabled={readOnly}
            />
          </ReviewStepCard>

          {/*
            O cartão gruda enquanto as etapas 1 a 3 passam: para isso o item
            do grid precisa ocupar toda a altura das três linhas, senão não
            sobra percurso para o `sticky`.
          */}
          <Box sx={{ gridArea: 'publish', alignSelf: 'stretch', minWidth: 0 }}>
            <ReviewStepCard
              step={4}
              title="Publicar"
              description="Escolha a página de destino e confirme."
              testId="idea-review-publication"
              /* Abaixo do cabeçalho fixo do site, não do topo da janela. */
              sx={{
                position: { md: 'sticky' },
                top: { md: 'calc(var(--app-header-h, 64px) + 16px)' },
              }}
            >
              <Box ref={publicationRef}>
                <Stack direction="column" spacing={{ xs: 2, md: 2 }} alignItems="stretch">
                  <FormControl
                    size="small"
                    required
                    error={submitted && !pageId}
                    sx={{ width: '100%', minWidth: 0 }}
                  >
                    <InputLabel id="ideas-review-page">Página de destino</InputLabel>
                    <Select
                      data-testid="idea-review-page-select"
                      labelId="ideas-review-page"
                      label="Página de destino"
                      value={pageId}
                      onChange={(event) => setPageId(String(event.target.value))}
                      disabled={loadingPages || readOnly}
                    >
                      {pages.map((page) => (
                        <MenuItem key={page.id} value={page.id}>
                          {page.title}
                        </MenuItem>
                      ))}
                    </Select>
                    {!loadingPages && !pages.length && !pagesError && (
                      <Typography
                        data-testid="idea-review-no-pages"
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        Nenhuma página de ideias cadastrada. Crie uma em Páginas de ideias.
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
                    <InputLabel id="ideas-review-visibility">Visibilidade</InputLabel>
                    <Select
                      data-testid="idea-review-visibility-select"
                      labelId="ideas-review-visibility"
                      label="Visibilidade"
                      value={draft.public ? 'true' : 'false'}
                      onChange={(event) => {
                        setDraft((previous) => ({
                          ...previous,
                          public: event.target.value === 'true',
                        }));
                        edit();
                      }}
                      disabled={readOnly}
                    >
                      <MenuItem value="true">Pública</MenuItem>
                      <MenuItem value="false">Privada</MenuItem>
                    </Select>
                  </FormControl>

                  {choiceSummary.length > 0 && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Suas escolhas da etapa 2
                      </Typography>
                      {choiceSummary.map((line) => (
                        <Typography key={line} variant="body2" color="text.secondary">
                          {line}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {decisions && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          data-testid="idea-ai-confirm-choices"
                          checked={confirmed}
                          onChange={(event) => setConfirmed(event.target.checked)}
                          disabled={readOnly}
                        />
                      }
                      label="Revisei e confirmo as versões escolhidas"
                    />
                  )}
                  {submitted && decisions && !confirmed && (
                    <Alert severity="warning">Confirme as escolhas acima antes de publicar.</Alert>
                  )}
                  {submitted && textInvalid ? (
                    <Alert data-testid="idea-review-text-invalid" severity="warning">
                      Revise o título e a descrição da etapa 2.
                    </Alert>
                  ) : null}
                  {submitted && !pageId ? (
                    <Alert severity="warning">
                      {FORM_VALIDATION_MESSAGES.SELECT_DESTINATION_PAGE}
                    </Alert>
                  ) : null}

                  <Button
                    type="button"
                    data-testid="idea-review-publish"
                    variant="contained"
                    startIcon={
                      saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
                    }
                    onClick={() => void handlePublish()}
                    disabled={saving || published}
                    fullWidth
                    sx={{
                      /*
                       * No celular quem publica é a barra fixa do rodapé;
                       * dois botões iguais na mesma tela só confundem.
                       */
                      display: { xs: 'none', md: 'inline-flex' },
                      minHeight: 44,
                      textTransform: 'none',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {published ? 'Ideia já publicada' : 'Publicar ideia'}
                  </Button>

                  {/* Com o botão escondido no celular, é esta linha que diz o estado. */}
                  <Typography variant="caption" color="text.secondary">
                    {published
                      ? 'Ideia já publicada.'
                      : selectedPage
                        ? `A ideia vai para ${selectedPage.title}. O original continua preservado.`
                        : 'O original ficará preservado após a publicação.'}
                  </Typography>
                </Stack>
              </Box>
            </ReviewStepCard>
          </Box>

          <Box sx={{ gridArea: 'footer' }}>
            <Button
              data-testid="idea-review-back-bottom"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Voltar para a fila
            </Button>
          </Box>
        </Box>
      </Container>

      {!published && (
        <Paper
          data-testid="idea-review-mobile-actions"
          elevation={8}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: STICKY_ACTION_BAR_Z_INDEX,
            px: 2,
            pt: 1.5,
            pb: 'calc(12px + env(safe-area-inset-bottom))',
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            type="button"
            data-testid="idea-review-publish-mobile"
            variant="contained"
            fullWidth
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={requestPublish}
            disabled={saving}
            sx={{ minHeight: 48, textTransform: 'none', fontWeight: 700 }}
          >
            Publicar ideia
          </Button>
          <Typography
            variant="caption"
            color={submitted && blockedReason ? 'error' : 'text.secondary'}
            sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}
          >
            {blockedReason || `Publicando em ${selectedPage?.title ?? 'página escolhida'}`}
          </Typography>
        </Paper>
      )}

      <Dialog
        data-testid="idea-ai-publish-original-dialog"
        open={confirmOriginal}
        onClose={() => setConfirmOriginal(false)}
      >
        <DialogTitle>A IA ainda está trabalhando</DialogTitle>
        <DialogContent>
          Publicar agora, sem a melhoria em andamento? Ela será cancelada (não conta no limite) e o
          que você revisou nas etapas 2 e 3 — texto e materiais — é publicado como está.
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            data-testid="idea-ai-wait"
            onClick={() => setConfirmOriginal(false)}
            sx={{ minHeight: 44 }}
          >
            Aguardar a IA
          </Button>
          <Button
            type="button"
            data-testid="idea-ai-confirm-publish-original"
            onClick={() => void handlePublish(true)}
            disabled={saving}
            sx={{ minHeight: 44 }}
          >
            Publicar sem a IA
          </Button>
        </DialogActions>
      </Dialog>

      <IdeaAiRegenerateDialog
        open={regenerateOpen}
        section={section}
        busy={ai.busy}
        onClose={() => setRegenerateOpen(false)}
        onConfirm={(request) => {
          void ai.request(request).then((ok) => {
            if (ok) setRegenerateOpen(false);
          });
        }}
      />
    </Box>
  );
}
