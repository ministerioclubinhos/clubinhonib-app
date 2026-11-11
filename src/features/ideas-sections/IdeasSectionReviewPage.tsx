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

import { STICKY_ACTION_BAR_Z_INDEX } from '@/constants/app';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { IDEAS_SECTION_ROUTES, IDEA_REVIEW_EMPTY_DRAFT } from './constants';
import IdeaAiComparePanel from './components/ai/IdeaAiComparePanel';
import IdeaAiStatusPanel from './components/ai/IdeaAiStatusPanel';
import IdeasSectionReviewFields from './components/review/IdeasSectionReviewFields';
import IdeasSectionReviewMaterials from './components/review/IdeasSectionReviewMaterials';
import ReviewStepCard from './components/review/ReviewStepCard';
import {
  useIdeasPages,
  useIdeasSectionById,
  useIdeasSectionReview,
  useIdeaAiReprocess,
} from './hooks';
import { ideaAiChoiceSummary, initialIdeaAiDecisions, excludedIdeaSourceIds } from './ai-utils';
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
  const publicationRef = useRef<HTMLDivElement>(null);

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

  const choiceSummary = useMemo(
    () => ideaAiChoiceSummary(decisions, excludedMediaIds),
    [decisions, excludedMediaIds]
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

  /**
   * O que ainda falta para publicar. A barra fixa do celular mostra o motivo
   * e leva até a etapa 4, que fica a algumas telas de distância.
   */
  const blockedReason = !pageId
    ? FORM_VALIDATION_MESSAGES.SELECT_DESTINATION_PAGE
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

  const published = Boolean(section.pageId);

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
              <Alert severity="success" sx={{ mt: 2 }}>
                Esta ideia já foi publicada. As etapas abaixo ficam disponíveis só para consulta.
              </Alert>
            ) : null}
            {saveError || pagesError ? (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setSaveError('')}>
                {saveError || pagesError}
              </Alert>
            ) : null}
          </Box>

          <ReviewStepCard
            step={1}
            title="Melhoria com IA"
            description="Gere uma versão melhorada quando quiser. O original fica sempre preservado."
            sx={{ gridArea: 'status' }}
          >
            <IdeaAiStatusPanel
              section={section}
              onRetry={() => void ai.reprocess()}
              retrying={ai.retrying}
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
                }}
                disabled={saving}
              />
            ) : (
              <IdeasSectionReviewFields
                title={draft.title}
                description={draft.description}
                submitted={submitted}
                disabled={saving}
                onChange={(patch) => setDraft((previous) => ({ ...previous, ...patch }))}
              />
            )}
          </ReviewStepCard>

          <ReviewStepCard
            step={3}
            title="Materiais da publicação"
            description="Os arquivos que vão junto com a ideia. Remover aqui tira o material da publicação; o original continua preservado."
            sx={{ gridArea: 'materials' }}
          >
            <IdeasSectionReviewMaterials
              medias={draft.medias}
              onChange={(medias) => {
                setDraft((previous) => ({ ...previous, medias }));
                setConfirmed(false);
              }}
              disabled={saving}
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
                          disabled={saving}
                        />
                      }
                      label="Revisei e confirmo as versões escolhidas"
                    />
                  )}
                  {submitted && decisions && !confirmed && (
                    <Alert severity="warning">Confirme as escolhas acima antes de publicar.</Alert>
                  )}
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
