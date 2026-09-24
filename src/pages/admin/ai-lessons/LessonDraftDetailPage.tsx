import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  Check,
  DeleteOutline as DeleteIcon,
  Download,
  PictureAsPdf,
  RateReview,
  EditNote,
  AutoStories,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useDeleteLessonDraft,
  useGenerateStage,
  useLessonDraft,
  useStageAction,
  useSubmitLessonPackage,
  useUpdateDraftContent,
} from '@/hooks/api/useAiLessons';
import {
  aiLessonsService,
  LessonStage,
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
  TiptapDocument,
} from '@/services/aiLessonsService';
import { LibreOfficeDocEditor } from '@/components/ai-lessons/LibreOfficeDocEditor';

const LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição completa',
  LESSON_VISUALS: '2. Visuais da história',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Visuais do versículo',
  VERSE_FIXATION: '5. Fixação divertida do versículo',
  MEDITATION_YOUNGER: '6. Meditação dos menores',
  MEDITATION_OLDER: '7. Meditação dos maiores',
  MANUAL_WORK: '8. Trabalho manual',
};

const SHORT_LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição',
  LESSON_VISUALS: '2. Visuais',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Vis. Versículo',
  VERSE_FIXATION: '5. Fixação',
  MEDITATION_YOUNGER: '6. Med. Menores',
  MEDITATION_OLDER: '7. Med. Maiores',
  MANUAL_WORK: '8. Trab. Manual',
};

const DESCRIPTIONS: Record<LessonStageType, string> = {
  LESSON: 'Conteúdo-base da aula e escolha de um único versículo principal NVI para memorização.',
  LESSON_VISUALS: 'Personagens, ambientes e cenas, em ordem narrativa, para auxiliar o professor a contar a história.',
  STANDARD_GAME: 'Brincadeira prática da aula e seus visuais de apoio, separada da atividade de memorização.',
  VERSE_VISUALS: 'Sequência de imagens mnemônicas baseada na melhor quebra do versículo; a última imagem mostra somente a referência.',
  VERSE_FIXATION: 'Dinâmica ou brincadeira divertida para praticar e memorizar o versículo, separada dos visuais mnemônicos.',
  MEDITATION_YOUNGER: 'Folha A4 com duas cópias de atividades visuais simples para crianças de 5 a 7 anos.',
  MEDITATION_OLDER: 'Folha A4 com três desafios de compreensão e aplicação para crianças de 8 a 11 anos, acompanhados de gabarito.',
  MANUAL_WORK: 'Desenho bíblico em preto e branco para colorir, com o versículo principal, duplicado na folha para impressão e recorte.',
};

const ORDER = Object.values(LessonStageType);

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Não iniciada',
  GENERATING: 'Gerando',
  DRAFT: 'Em produção',
  PRODUCER_APPROVED: 'Concluída pelo produtor',
  IN_REVIEW: 'Em aprovação final',
  CHANGES_REQUESTED: 'Ajustes solicitados',
  APPROVED: 'Aprovada na revisão final',
  FAILED: 'Falhou',
  STALE: 'Desatualizada',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  NOT_STARTED: 'default',
  GENERATING: 'info',
  DRAFT: 'primary',
  PRODUCER_APPROVED: 'info',
  IN_REVIEW: 'warning',
  CHANGES_REQUESTED: 'error',
  APPROVED: 'success',
  FAILED: 'error',
  STALE: 'warning',
};

const VISUAL_TYPES: Array<{ value: LessonVisualType; title: string; description: string }> = [
  { value: LessonVisualType.STORY_SEQUENCE, title: 'Sequência da história', description: 'Cenas cronológicas para a criança reconstruir começo, desenvolvimento e conclusão.' },
  { value: LessonVisualType.CHARACTER_AND_EMOTION, title: 'Personagens e emoções', description: 'Destaca personagens, ações e emoções observáveis para compreender escolhas e consequências.' },
  { value: LessonVisualType.VISUAL_ANCHORS, title: 'Imagens-âncora', description: 'Uma ideia visual simples por imagem: objeto, lugar ou momento que facilita a recordação.' },
  { value: LessonVisualType.INTERACTIVE_COLORING, title: 'Cenas para colorir', description: 'Line art em preto e branco para recontar a lição enquanto as crianças pintam.' },
];

type VisualAsset = { id?: string; purpose?: string; altText?: string; displayText?: string; url?: string };
const objectValue = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const visualAssets = (value: Record<string, unknown> | undefined, stage: LessonStageType): VisualAsset[] => {
  const key = [LessonStageType.VERSE_VISUALS, LessonStageType.VERSE_FIXATION, LessonStageType.MEDITATION_YOUNGER, LessonStageType.MEDITATION_OLDER, LessonStageType.MANUAL_WORK].includes(stage) ? 'printableAssets' : 'assets';
  return Array.isArray(value?.[key]) ? value[key].map((item) => objectValue(item) as VisualAsset) : [];
};

export const LessonDraftDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error } = useLessonDraft(id);
  const generate = useGenerateStage();
  const save = useUpdateDraftContent();
  const complete = useStageAction('complete');
  const approve = useStageAction('approve');
  const changes = useStageAction('changes');
  const submitPackage = useSubmitLessonPackage();
  const deleteMutation = useDeleteLessonDraft();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LessonStageType>(LessonStageType.LESSON);
  const initialGenerationStarted = useRef(false);
  const [edited, setEdited] = useState<TiptapDocument | null>(null);
  const [instructions, setInstructions] = useState('');
  const [visualType, setVisualType] = useState<LessonVisualType | ''>('');
  const [visualOrientation, setVisualOrientation] = useState<LessonVisualOrientation | ''>('');
  const [visualQuantity, setVisualQuantity] = useState<number | ''>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const stage = useMemo(() => lesson?.stages.find((item) => item.type === selectedType), [lesson, selectedType]);
  const version = stage?.versions.find((item) => item.id === stage.currentVersionId);
  const document = edited ?? version?.tiptapAstJson ?? { type: 'doc', content: [] };
  const assets = stage ? visualAssets(version?.structuredDataJson, stage.type) : [];
  const approvedLessonStage = lesson?.stages.find((item) => item.type === LessonStageType.LESSON);
  const approvedLessonVersion = approvedLessonStage?.versions.find((item) => item.id === approvedLessonStage.currentVersionId);
  const mainVerse = objectValue(approvedLessonVersion?.structuredDataJson.memoryVerse);

  useEffect(() => {
    if (selectedType !== LessonStageType.LESSON_VISUALS) return;
    const config = objectValue(version?.structuredDataJson.visualConfig);
    setVisualType(Object.values(LessonVisualType).includes(config.type as LessonVisualType) ? (config.type as LessonVisualType) : '');
    setVisualOrientation(Object.values(LessonVisualOrientation).includes(config.orientation as LessonVisualOrientation) ? (config.orientation as LessonVisualOrientation) : '');
    setVisualQuantity(typeof config.quantity === 'number' && config.quantity >= 1 && config.quantity <= 10 ? config.quantity : '');
  }, [selectedType, version?.id]);

  useEffect(() => {
    const first = lesson?.stages.find((item) => item.type === LessonStageType.LESSON);
    if (!lesson || !first || first.status !== LessonStageStatus.NOT_STARTED || initialGenerationStarted.current) return;
    initialGenerationStarted.current = true;
    generate.mutate({ id: lesson.id, payload: { stage: LessonStageType.LESSON } });
  }, [generate, lesson]);

  if (isLoading) {
    return (
      <Box data-testid="ai-lessons-detail-loading" sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress size={44} thickness={4} />
        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          Carregando detalhes da lição...
        </Typography>
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box data-testid="ai-lessons-detail-error" sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Não foi possível carregar os detalhes da lição.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/adm/estudio/licoes')} sx={{ mt: 2 }}>
          Voltar para lições
        </Button>
      </Box>
    );
  }

  const currentIndex = ORDER.indexOf(selectedType);
  const previous = currentIndex > 0 ? lesson.stages.find((item) => item.type === ORDER[currentIndex - 1]) : undefined;
  const canGenerate = currentIndex === 0 || Boolean(previous && [LessonStageStatus.PRODUCER_APPROVED, LessonStageStatus.IN_REVIEW, LessonStageStatus.APPROVED].includes(previous.status));
  const approvedCount = lesson.stages.filter((item) => item.status === LessonStageStatus.APPROVED).length;
  const packageCompletedCount = lesson.stages.filter((item) => [LessonStageStatus.PRODUCER_APPROVED, LessonStageStatus.IN_REVIEW, LessonStageStatus.APPROVED].includes(item.status)).length;
  const isFinalReview = lesson.status === 'IN_REVIEW' || lesson.status === 'READY_FOR_PUBLICATION' || lesson.status === 'PUBLISHED';
  const progressCount = isFinalReview ? approvedCount : packageCompletedCount;
  const progress = lesson.stages.length ? (progressCount / lesson.stages.length) * 100 : 0;
  const lessonStatusLabel: Record<string, string> = { DRAFT: 'Novo pacote', IN_PROGRESS: 'Montando pacote', PACKAGE_READY: 'Pacote completo', IN_REVIEW: 'Em aprovação final', CHANGES_REQUESTED: 'Ajustes solicitados', READY_FOR_PUBLICATION: 'Aprovação concluída', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };

  const download = async () => {
    const blob = await aiLessonsService.exportPdf(id);
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = `licao-semana-${lesson.weekNumber}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const action = (mutation: typeof complete, target: LessonStage) => mutation.mutate({ id, stage: target.type });

  const openStagePreview = async () => {
    if (!stage || edited) return;
    setPreviewLoading(true); setPreviewError(null);
    try {
      const blob = await aiLessonsService.previewStagePdf(id, stage.type);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch { setPreviewError('Não foi possível gerar o preview. Verifique se o LibreOffice está instalado no servidor.'); }
    finally { setPreviewLoading(false); }
  };

  return (
    <Box
      data-testid="ai-lessons-detail"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
      }}
    >
      {/* Top Bar with Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/adm/estudio/licoes')}
        sx={{ mb: 2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para Produção de Lições
      </Button>

      {/* Hero Card Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={2.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 1 }}>
              <Chip
                label={`Semana ${lesson.weekNumber}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                  color: 'text.primary',
                  overflowWrap: 'anywhere',
                }}
              >
                {lesson.theme}
              </Typography>
              <Chip
                label={lessonStatusLabel[lesson.status] ?? lesson.status}
                color={
                  lesson.status === 'READY_FOR_PUBLICATION' || lesson.status === 'PUBLISHED'
                    ? 'success'
                    : lesson.status === 'CHANGES_REQUESTED'
                    ? 'warning'
                    : 'primary'
                }
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>

            <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ overflowWrap: 'anywhere', mb: 1 }}>
              {lesson.biblicalReference}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Criada em {new Date(lesson.createdAt).toLocaleString('pt-BR')} · Atualizada em {new Date(lesson.updatedAt).toLocaleString('pt-BR')}
            </Typography>

            <Box sx={{ mt: 2, maxWidth: 650 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Progresso geral da lição
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {progressCount}/{lesson.stages.length} ({Math.round(progress)}%) {isFinalReview ? 'aprovados' : 'itens concluídos'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 9,
                  borderRadius: 4.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4.5,
                    bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons Top Bar */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            {lesson.status === 'PACKAGE_READY' || lesson.status === 'CHANGES_REQUESTED' ? (
              <Button
                startIcon={<RateReview />}
                variant="contained"
                disabled={
                  submitPackage.isPending ||
                  !lesson.stages.every((item) => item.status === LessonStageStatus.PRODUCER_APPROVED || item.status === LessonStageStatus.APPROVED)
                }
                onClick={() => submitPackage.mutate(id)}
                sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 700 }}
              >
                {submitPackage.isPending ? 'Submetendo…' : 'Submeter para aprovação'}
              </Button>
            ) : null}

            <Button
              startIcon={<Download />}
              variant="outlined"
              disabled={lesson.status !== 'READY_FOR_PUBLICATION'}
              onClick={download}
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 600 }}
            >
              Salvar PDF aprovado
            </Button>

            <Button
              variant="contained"
              disabled={lesson.status !== 'READY_FOR_PUBLICATION'}
              onClick={() => aiLessonsService.publishToWeekMaterial(id)}
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 700 }}
            >
              Enviar ao material da semana
            </Button>

            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 600 }}
            >
              Excluir lição
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Mobile Horizontal Stage Tabs (visible on < lg) */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', lg: 'none' },
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={selectedType}
          onChange={(_, next) => {
            setSelectedType(next);
            setEdited(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            py: 0.5,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 700,
            },
          }}
        >
          {lesson.stages.map((item) => (
            <Tab
              key={item.id}
              data-testid={`ai-stage-tab-${item.type}`}
              value={item.type}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{SHORT_LABELS[item.type]}</span>
                  <Chip
                    size="small"
                    label={STATUS_LABELS[item.status] ?? item.status}
                    color={STATUS_COLORS[item.status] ?? 'default'}
                    sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700, borderRadius: 1 }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Main Grid: Sidebar (Desktop) + Stage Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        {/* Sidebar Sticky Menu (Desktop >= lg) */}
        <Paper
          elevation={0}
          sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'sticky',
            top: 88,
            p: 2.5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Fluxo da produção
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione a etapa para ver, editar e aprovar os materiais.
          </Typography>

          <Stack spacing={1}>
            {lesson.stages.map((item) => {
              const selected = selectedType === item.type;
              const color = STATUS_COLORS[item.status] ?? 'default';

              return (
                <Button
                  key={item.id}
                  data-testid={`ai-stage-tab-${item.type}`}
                  fullWidth
                  variant={selected ? 'contained' : 'outlined'}
                  color={selected ? 'primary' : 'inherit'}
                  onClick={() => {
                    setSelectedType(item.type);
                    setEdited(null);
                  }}
                  sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    py: 1.25,
                    px: 2,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? undefined : 'background.paper',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: selected ? '#ffffff' : 'text.primary', lineHeight: 1.3 }}
                    >
                      {LABELS[item.type]}
                    </Typography>
                    <Chip
                      size="small"
                      label={STATUS_LABELS[item.status] ?? item.status}
                      color={selected ? 'default' : color}
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        bgcolor: selected ? 'rgba(255,255,255,0.25)' : undefined,
                        color: selected ? '#ffffff' : undefined,
                      }}
                    />
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Paper>

        {/* Stage Main Details Card */}
        <Box>
          {!stage ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              Etapa ausente no pacote.
            </Alert>
          ) : (
            <Card
              data-testid={`ai-stage-${stage.type}`}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Stage Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1.5}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {LABELS[stage.type]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {DESCRIPTIONS[stage.type]}
                    </Typography>
                  </Box>

                  <Chip
                    label={STATUS_LABELS[stage.status] ?? stage.status}
                    color={STATUS_COLORS[stage.status] ?? 'default'}
                    sx={{ fontWeight: 800, px: 1, borderRadius: 2 }}
                  />
                </Stack>

                {/* Biblical Verse Reference Box if applicable */}
                {[
                  LessonStageType.VERSE_VISUALS,
                  LessonStageType.VERSE_FIXATION,
                  LessonStageType.MEDITATION_YOUNGER,
                  LessonStageType.MEDITATION_OLDER,
                  LessonStageType.MANUAL_WORK,
                ].includes(stage.type) && mainVerse.text ? (
                  <Alert severity="success" icon={<AutoStories />} sx={{ mb: 2, borderRadius: 2.5 }}>
                    <strong>{String(mainVerse.reference)} — NVI:</strong> “{String(mainVerse.text)}”
                  </Alert>
                ) : null}

                {/* Warning Messages */}
                {stage.failureMessage && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
                    {stage.failureMessage}
                  </Alert>
                )}

                {!canGenerate && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2.5 }}>
                    Aprove a etapa anterior no fluxo antes de gerar esta.
                  </Alert>
                )}

                {/* AI Instructions Input */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Orientações e instruções para a IA (geração ou ajuste)"
                    placeholder="Ex: Enfatize o amor de Deus, mantenha linguagem acessível para crianças de 6 anos..."
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${instructions.length}/1000 caracteres`}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                    }}
                  />
                </Box>

                {/* Config for LESSON_VISUALS */}
                {stage.type === LessonStageType.LESSON_VISUALS && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      mb: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                      Como os visuais devem ensinar a lição?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      A história aprovada é a fonte fechada. A geração de imagens preservará a narrativa bíblica original.
                    </Typography>

                    <RadioGroup
                      value={visualType}
                      onChange={(event) => setVisualType(event.target.value as LessonVisualType)}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        {VISUAL_TYPES.map((option) => (
                          <Paper
                            key={option.value}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              border: '1px solid',
                              borderColor: visualType === option.value ? 'primary.main' : 'divider',
                              bgcolor: visualType === option.value ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                            }}
                          >
                            <FormControlLabel
                              value={option.value}
                              control={<Radio />}
                              sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                              label={
                                <Box sx={{ ml: 0.5 }}>
                                  <Typography fontWeight={700} variant="body2">
                                    {option.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                    {option.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Paper>
                        ))}
                      </Box>
                    </RadioGroup>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="visual-orientation-label">Orientação</InputLabel>
                        <Select
                          labelId="visual-orientation-label"
                          label="Orientação"
                          value={visualOrientation}
                          onChange={(event) => setVisualOrientation(event.target.value as LessonVisualOrientation)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value={LessonVisualOrientation.LANDSCAPE}>Horizontal — Paisagem (A4)</MenuItem>
                          <MenuItem value={LessonVisualOrientation.PORTRAIT}>Vertical — Retrato (A4)</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel id="visual-quantity-label">Quantidade</InputLabel>
                        <Select
                          labelId="visual-quantity-label"
                          label="Quantidade"
                          value={visualQuantity}
                          onChange={(event) => setVisualQuantity(Number(event.target.value))}
                          sx={{ borderRadius: 2 }}
                        >
                          {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => (
                            <MenuItem key={quantity} value={quantity}>
                              {quantity} {quantity === 1 ? 'imagem' : 'imagens'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Paper>
                )}

                {/* Stage Action Controls */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 3 }}
                >
                  <Button
                    startIcon={<AutoAwesome />}
                    variant="contained"
                    disabled={
                      !canGenerate ||
                      generate.isPending ||
                      stage.status === LessonStageStatus.GENERATING ||
                      (stage.type === LessonStageType.LESSON_VISUALS && (!visualType || !visualOrientation || !visualQuantity))
                    }
                    onClick={() =>
                      generate.mutate({
                        id,
                        payload: {
                          stage: stage.type,
                          revisionInstructions: instructions || undefined,
                          ...(stage.type === LessonStageType.LESSON_VISUALS
                            ? {
                                visualType: visualType as LessonVisualType,
                                visualOrientation: visualOrientation as LessonVisualOrientation,
                                visualQuantity: Number(visualQuantity),
                              }
                            : {}),
                        },
                      })
                    }
                    sx={{ borderRadius: 2.5, px: 2.5, minHeight: 44, fontWeight: 700 }}
                  >
                    {stage.currentVersionId ? 'Regenerar minuta' : 'Gerar minuta'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<EditNote />}
                    disabled={!edited || save.isPending}
                    onClick={() =>
                      save.mutate({
                        id,
                        payload: {
                          stage: stage.type,
                          lockVersion: stage.lockVersion,
                          tiptapAstJson: document,
                          structuredDataJson: version?.structuredDataJson,
                          changeSummary: 'Revisão manual',
                        },
                      }, { onSuccess: () => setEdited(null) })
                    }
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    Salvar edição
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={previewLoading ? <CircularProgress size={18} /> : <PictureAsPdf />}
                    disabled={!stage.currentVersionId || Boolean(edited) || previewLoading}
                    onClick={() => void openStagePreview()}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    {edited ? 'Salve para visualizar' : 'Visualizar PDF do item'}
                  </Button>

                  <Button
                    startIcon={<Check />}
                    color="primary"
                    variant="outlined"
                    disabled={stage.status !== LessonStageStatus.DRAFT && stage.status !== LessonStageStatus.CHANGES_REQUESTED}
                    onClick={() => action(complete, stage)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    Concluir item para o pacote
                  </Button>

                  <Button
                    startIcon={<Check />}
                    color="success"
                    variant="contained"
                    disabled={lesson.status !== 'IN_REVIEW' || stage.status !== LessonStageStatus.IN_REVIEW}
                    onClick={() => action(approve, stage)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 700 }}
                  >
                    Aprovar item
                  </Button>

                  <Button
                    color="warning"
                    variant="outlined"
                    disabled={lesson.status !== 'IN_REVIEW' || stage.status !== LessonStageStatus.IN_REVIEW}
                    onClick={() => action(changes, stage)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    Solicitar ajustes
                  </Button>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {/* Editor Container: materiais puramente visuais não recebem folha/cabeçalho textual. */}
                {![LessonStageType.LESSON_VISUALS, LessonStageType.VERSE_VISUALS, LessonStageType.MANUAL_WORK].includes(stage.type) && <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                    Conteúdo da Minuta (Edição Rich Text)
                  </Typography>

                  {version ? (
                    <LibreOfficeDocEditor initialJson={document} onChange={(value) => setEdited(value)} />
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }}
                    >
                      <Typography color="text.secondary" fontWeight={500}>
                        Gere esta etapa para iniciar a revisão e visualização do conteúdo.
                      </Typography>
                    </Paper>
                  )}
                </Box>}

                {stage.type === LessonStageType.MANUAL_WORK && assets[0]?.url && (
                  <Paper variant="outlined" sx={{ bgcolor: 'white', color: 'black', maxWidth: 794, mx: 'auto', p: { xs: 1.5, sm: 2.5 }, mb: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
                      <Box component="img" src="/header_direito.png" alt="Clubinho Bíblico" sx={{ width: { xs: 90, sm: 120 }, maxHeight: 58, objectFit: 'contain' }} />
                      <Typography sx={{ bgcolor: '#111', color: '#fff', px: 2, py: 0.5, borderRadius: 1, fontWeight: 900 }}>TRABALHO MANUAL</Typography>
                    </Stack>
                    <Typography align="center" sx={{ fontSize: { xs: 12, sm: 14 }, lineHeight: 1.2, mb: 1.5 }}>
                      “{String(version?.structuredDataJson.verseText ?? '')}” ({String(version?.structuredDataJson.verseReference ?? '')} - NVI)
                    </Typography>
                    <Box component="img" src={assets[0].url} alt="Desenho do trabalho manual" sx={{ display: 'block', width: '100%', maxHeight: 520, objectFit: 'contain', border: '2px solid #111' }} />
                  </Paper>
                )}

                {/* Generated Visual Assets Preview */}
                {assets.length > 0 && stage.type !== LessonStageType.MANUAL_WORK && (
                  <Box sx={{ mt: 4 }}>
                    {![LessonStageType.LESSON_VISUALS, LessonStageType.VERSE_VISUALS].includes(stage.type) && <Typography variant="h6" fontWeight={800} gutterBottom>
                      {stage.type === LessonStageType.VERSE_VISUALS
                        ? 'Visuais para memorizar o versículo'
                        : stage.type === LessonStageType.VERSE_FIXATION
                        ? 'Peças da dinâmica de fixação'
                        : stage.type === LessonStageType.LESSON_VISUALS
                        ? 'Cenas visuais da história'
                        : stage.type === LessonStageType.STANDARD_GAME
                        ? 'Visuais de apoio da brincadeira'
                        : 'Ilustrações das atividades'}
                    </Typography>}

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2.5,
                        mt: 2,
                      }}
                    >
                      {assets.map((asset, index) => (
                        <Card
                          key={asset.id ?? index}
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            component="img"
                            src={asset.url}
                            alt={asset.altText ?? asset.purpose ?? `Visual ${index + 1}`}
                            sx={{
                              display: 'block',
                              width: '100%',
                              aspectRatio: '3 / 2',
                              objectFit: 'contain',
                              bgcolor: 'grey.50',
                            }}
                          />
                          {![LessonStageType.LESSON_VISUALS, LessonStageType.VERSE_VISUALS].includes(stage.type) && <CardContent sx={{ p: 2 }}>
                            <Typography fontWeight={700}>
                              {asset.purpose ?? `Visual ${index + 1}`}
                            </Typography>
                            {asset.displayText && (
                              <Typography sx={{ mt: 0.75, fontWeight: 600 }} color="primary.main" variant="body2">
                                {asset.displayText}
                              </Typography>
                            )}
                            {asset.altText && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {asset.altText}
                              </Typography>
                            )}
                          </CardContent>}
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
      <Dialog open={Boolean(previewUrl) || Boolean(previewError)} onClose={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setPreviewError(null); }} fullWidth maxWidth="lg" fullScreen={false} PaperProps={{ sx: { height: { xs: '92dvh', md: '90vh' }, m: { xs: 1, md: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Preview final — {stage ? LABELS[stage.type] : 'Item'}</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 0.5, md: 1.5 }, display: 'flex', flexDirection: 'column' }}>
          {previewError ? <Alert severity="error">{previewError}</Alert> : previewUrl ? <Box component="iframe" title="Preview do PDF do item" src={previewUrl} sx={{ border: 0, width: '100%', flex: 1, minHeight: { xs: 520, md: 650 }, bgcolor: 'grey.100' }} /> : null}
        </DialogContent>
        <DialogActions><Button onClick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setPreviewError(null); }}>Fechar</Button>{previewUrl && <Button component="a" href={previewUrl} download={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`} startIcon={<Download />}>Baixar preview</Button>}</DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleteMutation.isPending && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Excluir Lição?</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            Tem certeza que deseja excluir a lição <strong>{lesson.theme}</strong> (Semana {lesson.weekNumber})?
          </DialogContentText>
          <DialogContentText color="error.main" sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}>
            ⚠️ Esta ação é irreversível. Todas as 8 etapas, versões geradas, comentários e arquivos de imagem associados serão permanentemente removidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              await deleteMutation.mutateAsync(id);
              navigate('/adm/estudio/licoes');
            }}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir tudo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
