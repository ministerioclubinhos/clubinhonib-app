import { useEffect, useMemo, useRef, useState } from 'react';
import { FEATURE, useFeatureFlagsContext } from '@/features/feature-flags';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import SaveIcon from '@mui/icons-material/Save';
import { alpha } from '@mui/material/styles';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Skeleton,
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
import ReviewReadiness from './components/review/ReviewReadiness';
import ReviewSectionCard from './components/review/ReviewSectionCard';
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
import {
  IdeaAiDecision,
  type IdeasSectionDraft,
  type IdeaAiDecisions,
  type IdeaAiFinalText,
} from './types';
import { formatDateTime, toSectionDraft } from './utils';

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

  const { section: loadedSection, loading, error, refresh } = useIdeasSectionById(id);
  // Flag `idea_ai_enhancement` desligada: nada de melhoria por IA na revisão.
  const aiEnabled = useFeatureFlagsContext().isEnabled(FEATURE.IDEA_AI_ENHANCEMENT);
  const section = useMemo(
    () =>
      loadedSection && !aiEnabled ? { ...loadedSection, aiEnhancement: undefined } : loadedSection,
    [loadedSection, aiEnabled]
  );
  const { pages, loading: loadingPages, error: pagesError, fetchPages } = useIdeasPages();
  const { saving, saveError, saveErrorStatus, setSaveError, publish } = useIdeasSectionReview();
  const { enqueueSnackbar } = useSnackbar();

  const ai = useIdeaAiActions(id, refresh);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [resultNotice, setResultNotice] = useState('');
  // O texto que estava na etapa 2 antes de um resultado novo da IA substituí-lo.
  const [previousText, setPreviousText] = useState<IdeaAiFinalText | null>(null);
  const [dirty, setDirty] = useState(false);
  const [decisions, setDecisions] = useState<IdeaAiDecisions | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const initialized = useRef<string | null>(null);
  const resultId = useRef<string | null>(null);
  const [draft, setDraft] = useState<IdeasSectionDraft>(IDEA_REVIEW_EMPTY_DRAFT);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const [pageId, setPageId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const publicationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  // Com uma única página de destino não há o que escolher.
  useEffect(() => {
    if (pages.length === 1) setPageId((current) => current || pages[0].id);
  }, [pages]);

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
      if (replaced && currentId) {
        setPreviousText({
          title: draftRef.current.title,
          description: draftRef.current.description,
        });
        setResultNotice(
          'Chegou um novo resultado da IA. As escolhas e o texto voltaram às versões sugeridas.'
        );
      }
    }
  }, [section]);

  // Só oferece voltar quando o texto de antes é diferente do que está agora.
  const canRestoreText =
    previousText !== null &&
    (previousText.title !== draft.title || previousText.description !== draft.description);
  const restoreText = () => {
    if (!previousText) return;
    setDraft((previous) => ({ ...previous, ...previousText }));
    setPreviousText(null);
    setConfirmed(false);
    setDirty(true);
  };

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

  const changeMediaDecision = (sourceMediaId: string, decision: IdeaAiDecision) => {
    if (!decisions) return;
    setDecisions({
      ...decisions,
      medias: decisions.medias.map((m) =>
        m.sourceMediaId === sourceMediaId ? { ...m, decision } : m
      ),
    });
    setConfirmed(false);
    edit();
  };

  const removedSources = useMemo(
    () =>
      (section?.aiEnhancement?.snapshot?.medias ?? []).filter((source) =>
        excludedMediaIds.includes(source.id)
      ),
    [section, excludedMediaIds]
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
      enqueueSnackbar(`Ideia publicada${selectedPage ? ` em ${selectedPage.title}` : ''}.`, {
        variant: 'success',
      });
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
      ? 'Revise o título e a descrição.'
      : decisions && !confirmed
        ? 'Confirme as escolhas antes de publicar.'
        : '';

  const requestPublish = () => {
    if (blockedReason) {
      setSubmitted(true);
      publicationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    void handlePublish();
  };

  const readiness = [
    { label: 'Título e descrição revisados', shortLabel: 'Texto', done: !textInvalid },
    ...(decisions
      ? [{ label: 'Escolhas confirmadas', shortLabel: 'Escolhas', done: confirmed }]
      : []),
    { label: 'Página de destino escolhida', shortLabel: 'Destino', done: Boolean(pageId) },
  ];

  if (loading) {
    return (
      <Box data-testid="ideas-sections-ideas-section-review-page" sx={{ py: { xs: 2, md: 3 } }}>
        <Container
          maxWidth={false}
          data-testid="idea-review-loading"
          aria-busy="true"
          aria-label="Carregando a ideia"
          sx={{ width: { xs: '98%', md: '95%' }, px: '0 !important' }}
        >
          <Skeleton variant="rounded" height={90} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={320} />
        </Container>
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
          <AlertTitle>
            {error ? 'Não foi possível abrir a ideia' : 'Ideia não encontrada'}
          </AlertTitle>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          <Box>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ md: 'flex-end' }}
              gap={1.5}
            >
              <Box sx={{ minWidth: 0 }}>
                <Button
                  type="button"
                  data-testid="idea-review-back-top"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
                  sx={{ minHeight: 44, ml: -1, textTransform: 'none', fontWeight: 700 }}
                >
                  Ideias compartilhadas
                </Button>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', lineHeight: 1.6, fontWeight: 700 }}
                >
                  Revisar ideia compartilhada
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={800}
                  sx={{
                    overflowWrap: 'anywhere',
                    fontSize: { xs: 22, md: 28 },
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                    color: 'text.primary',
                  }}
                >
                  {section.title || 'Ideia sem título'}
                </Typography>
              </Box>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Chip
                  size="small"
                  color={published ? 'success' : 'warning'}
                  label={published ? 'Publicada' : 'Aguardando revisão'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  icon={draft.public ? <PublicRoundedIcon /> : <LockOutlinedIcon />}
                  label={draft.public ? 'Pública' : 'Privada'}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<AttachFileRoundedIcon />}
                  label={
                    section.medias.length
                      ? `${section.medias.length} ${section.medias.length === 1 ? 'material' : 'materiais'}`
                      : 'Sem materiais'
                  }
                />
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<EventOutlinedIcon />}
                  label={`Enviada em ${formatDateTime(section.createdAt)}`}
                />
              </Stack>
            </Stack>

            {aiEnabled ? (
              <>
                {/* Melhoria com IA: uma faixa só, com o botão de regenerar à vista. */}
                <Paper
                  data-testid="idea-review-step-ai"
                  elevation={0}
                  sx={(theme) => ({
                    mt: 2,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    border: 1,
                    borderColor: alpha(theme.palette.secondary.main, 0.35),
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.07)}, ${theme.palette.background.paper} 60%)`,
                  })}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                    <AutoAwesomeOutlinedIcon color="secondary" />
                    <Typography component="h2" fontWeight={800} sx={{ fontSize: 17 }}>
                      Melhoria com IA
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                      · Regenere tudo ou só partes. Nada é publicado automaticamente e o original
                      fica sempre preservado.
                    </Typography>
                  </Stack>
                  <IdeaAiStatusPanel
                    section={section}
                    onRegenerate={() => setRegenerateOpen(true)}
                    onCancel={() => void ai.cancel()}
                    onRestore={(attemptId) => void ai.restore(attemptId)}
                    busy={ai.busy}
                    disabled={saving}
                    error={ai.error || error}
                  />
                </Paper>
              </>
            ) : null}
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
                onClose={() => {
                  setResultNotice('');
                  setPreviousText(null);
                }}
                action={
                  canRestoreText ? (
                    <Button
                      type="button"
                      data-testid="idea-ai-restore-text"
                      color="inherit"
                      size="small"
                      onClick={restoreText}
                      sx={{ minHeight: 44 }}
                    >
                      Restaurar meu texto
                    </Button>
                  ) : undefined
                }
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
                  ? ' A revisão foi atualizada: confira as escolhas e confirme de novo.'
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

          {decisions ? (
            /* Com a IA, título e descrição são dois blocos soltos, sem cartão em volta. */
            <Box data-testid="idea-review-step-choices" sx={{ minWidth: 0 }}>
              <IdeaAiComparePanel
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
                disabled={readOnly || Boolean(section.aiEnhancement?.activeAttempt)}
              />
            </Box>
          ) : (
            <ReviewSectionCard
              icon={<CompareArrowsRoundedIcon />}
              title="Título e descrição"
              description="Ajuste o título e a descrição que irão para a página de ideias."
              testId="idea-review-step-choices"
            >
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
            </ReviewSectionCard>
          )}

          <ReviewSectionCard
            accent="warning"
            icon={<FolderOpenRoundedIcon />}
            title="Materiais"
            description="Os arquivos que vão junto com a ideia, com a comparação de cada um. Remover tira o material da publicação; o original continua preservado."
            testId="idea-review-step-materials"
          >
            <IdeasSectionReviewMaterials
              medias={draft.medias}
              onChange={(medias) => {
                setDraft((previous) => ({ ...previous, medias }));
                setConfirmed(false);
                edit();
              }}
              disabled={readOnly}
              ai={
                section.aiEnhancement
                  ? {
                      section,
                      decisions,
                      onDecisionChange: changeMediaDecision,
                      onDocumentSaved: refresh,
                      removedSources,
                      disabled: readOnly || Boolean(section.aiEnhancement.activeAttempt),
                    }
                  : undefined
              }
            />
          </ReviewSectionCard>

          <Box sx={{ order: { xs: 6, md: 5 } }}>
            <Button
              data-testid="idea-review-back-bottom"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(IDEAS_SECTION_ROUTES.QUEUE)}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Voltar para a fila
            </Button>
          </Box>
          {/*
            Publicar: no celular é o último cartão da página; no desktop é uma
            barra fixa no rodapé da janela, com tudo em uma linha.
          */}
          <Paper
            data-testid="idea-review-publication"
            elevation={0}
            sx={{
              order: { xs: 5, md: 6 },
              p: 1.5,
              borderRadius: { xs: 4, md: 3 },
              border: 1,
              borderColor: 'divider',
              position: { md: 'sticky' },
              bottom: { md: 16 },
              zIndex: { md: 3 },
              boxShadow: {
                xs: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)',
                md: '0 8px 32px rgba(16, 24, 40, 0.2)',
              },
            }}
          >
            <Typography
              component="h2"
              fontWeight={800}
              sx={{ fontSize: 17, mb: 1.5, display: { xs: 'block', md: 'none' } }}
            >
              Publicar
            </Typography>
            <Box ref={publicationRef}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                useFlexGap
                flexWrap="wrap"
                alignItems={{ xs: 'stretch', md: 'center' }}
                sx={{ gap: { xs: 2, md: 2 } }}
              >
                <ReviewReadiness items={readiness} />
                <FormControl
                  size="small"
                  required
                  error={submitted && !pageId}
                  sx={{ width: { xs: '100%', md: 200 }, minWidth: 0 }}
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

                <FormControl size="small" sx={{ width: { xs: '100%', md: 110 }, minWidth: 0 }}>
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
                      display: { xs: 'block', md: 'none' },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                      Suas escolhas
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
                    label="Confirmo as escolhas"
                  />
                )}
                {submitted && decisions && !confirmed && (
                  <Alert severity="warning" sx={{ width: '100%' }}>
                    Confirme as escolhas acima antes de publicar.
                  </Alert>
                )}
                {submitted && textInvalid ? (
                  <Alert
                    data-testid="idea-review-text-invalid"
                    severity="warning"
                    sx={{ width: '100%' }}
                  >
                    Revise o título e a descrição.
                  </Alert>
                ) : null}
                {submitted && !pageId ? (
                  <Alert severity="warning" sx={{ width: '100%' }}>
                    {FORM_VALIDATION_MESSAGES.SELECT_DESTINATION_PAGE}
                  </Alert>
                ) : null}

                <Button
                  type="button"
                  data-testid="idea-review-publish"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  onClick={() => void handlePublish()}
                  disabled={saving || published}
                  sx={{
                    /*
                     * No celular quem publica é a barra fixa do rodapé;
                     * dois botões iguais na mesma tela só confundem.
                     */
                    display: { xs: 'none', md: 'inline-flex' },
                    ml: { md: 'auto' },
                    minWidth: { md: 170 },
                    minHeight: 44,
                    textTransform: 'none',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {published ? 'Ideia já publicada' : 'Publicar ideia'}
                </Button>

                {/* Com o botão escondido no celular, é esta linha que diz o estado. */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: 'block', md: 'none' } }}
                >
                  {published
                    ? 'Ideia já publicada.'
                    : selectedPage
                      ? `A ideia vai para ${selectedPage.title}. O original continua preservado.`
                      : 'O original ficará preservado após a publicação.'}
                </Typography>
              </Stack>
            </Box>
          </Paper>
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

      {aiEnabled ? (
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
      ) : null}
    </Box>
  );
}
