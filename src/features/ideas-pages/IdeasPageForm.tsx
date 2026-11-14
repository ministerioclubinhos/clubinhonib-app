import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ExpandLess,
  ExpandMore,
  Search,
  CheckCircleOutline,
  LightbulbOutlined,
  OpenInNew,
  Save,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { useGuardedExit } from '@/hooks';
import IdeasSectionEditor from './components/IdeasSectionEditor';
import IdeasSectionOutline from './components/IdeasSectionOutline';
import {
  IDEAS_AUTO_COLLAPSE_THRESHOLD,
  IDEAS_PAGE_ROUTES,
  IDEAS_SECTION_ANCHOR_PREFIX,
  IDEAS_SECTION_SEARCH_THRESHOLD,
  IDEAS_TITLE_MAX_LENGTH,
} from './constants';
import { useIdeasPageById, useIdeasPageForm, useUnsavedChangesGuard } from './hooks';
import type { MediaType } from '@/store/slices/types';
import type { IdeasMediaFocusRequest, IdeasPageFormProps, IdeasSectionDraft } from './types';
import {
  countMedia,
  createIdeasSectionDraft,
  pendingIdeasMedia,
  sectionKeyOf,
  sectionMatchesQuery,
} from './utils';

export default function IdeasPageForm({ fromTemplatePage = false }: IdeasPageFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    page: loadedPage,
    loading,
    error: loadError,
    retry,
  } = useIdeasPageById(fromTemplatePage ? undefined : id);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, MediaType[]>>({});
  const [focusRequest, setFocusRequest] = useState<IdeasMediaFocusRequest>();
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState('');
  const {
    values,
    setValue,
    sections,
    setSections,
    errors,
    sectionApiErrors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useIdeasPageForm({ isCreation: fromTemplatePage, page: loadedPage });
  const pendingMedia = pendingIdeasMedia(sections, sectionDrafts);
  const hasMediaDraft = pendingMedia.length > 0;
  useUnsavedChangesGuard(isDirty || hasMediaDraft || saving);
  const exit = useGuardedExit(isDirty || hasMediaDraft || saving, IDEAS_PAGE_ROUTES.MANAGE);
  // Página grande abre recolhida: o administrador escolhe qual seção editar.
  useEffect(() => {
    const saved = loadedPage?.sections ?? [];
    setCollapsed(
      new Set(saved.length > IDEAS_AUTO_COLLAPSE_THRESHOLD ? saved.map((item) => item.id) : [])
    );
  }, [loadedPage]);
  const setSectionExpanded = useCallback((key: string, expanded: boolean) => {
    setCollapsed((previous) => {
      if (previous.has(key) === !expanded) return previous;
      const next = new Set(previous);
      if (expanded) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => setCollapsed(new Set(sections.map(sectionKeyOf)));
  const goToSection = (key: string) => {
    setSectionExpanded(key, true);
    setQuery('');
    requestAnimationFrame(() =>
      document
        .getElementById(`${IDEAS_SECTION_ANCHOR_PREFIX}${key}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };
  const addSection = () => {
    const draft = createIdeasSectionDraft();
    setSections([...sections, draft]);
    setQuery('');
    goToSection(sectionKeyOf(draft));
  };
  const showSearch = sections.length >= IDEAS_SECTION_SEARCH_THRESHOLD;
  const pendingKeys = new Set(pendingMedia.map((pending) => pending.sectionKey));
  const outlineItems = sections.map((section, index) => ({
    key: sectionKeyOf(section),
    index,
    title: section.title,
    public: section.public,
    mediaCount: section.medias.length,
    hasError:
      Boolean(sectionApiErrors[index]?.length) ||
      (errors.sectionTitles &&
        (!section.title.trim() || section.title.length > IDEAS_TITLE_MAX_LENGTH)),
    hasDraft: pendingKeys.has(sectionKeyOf(section)),
  }));
  const visibleCount = sections.filter((section, index) =>
    sectionMatchesQuery(section, index, query)
  ).length;
  const totalMedia = countMedia(sections);
  const publicSections = sections.filter((section) => section.public).length;
  const trackDraft = useCallback((key: string, mediaTypes: MediaType[]) => {
    setSectionDrafts((previous) =>
      previous[key] === mediaTypes ? previous : { ...previous, [key]: mediaTypes }
    );
  }, []);
  const updateSection = (index: number, section: IdeasSectionDraft) =>
    setSections(sections.map((item, i) => (i === index ? section : item)));

  if (loading)
    return (
      <Stack
        data-testid="ideas-pages-ideas-page-form"
        spacing={2}
        aria-busy="true"
        aria-label="Carregando página de ideias"
      >
        <Skeleton data-testid="ideas-page-loading" variant="rounded" height={100} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );

  if (!fromTemplatePage && !loadedPage)
    return (
      <Paper
        data-testid="ideas-pages-ideas-page-form"
        variant="outlined"
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Alert data-testid="ideas-page-load-error" severity="error">
          <AlertTitle>Não foi possível abrir a página</AlertTitle>
          {loadError || 'Selecione uma página na lista para começar a editar.'}
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="button" onClick={retry} sx={{ minHeight: 44 }}>
            Tentar novamente
          </Button>
          <Button
            type="button"
            onClick={() => navigate(IDEAS_PAGE_ROUTES.MANAGE)}
            sx={{ minHeight: 44 }}
          >
            Ver páginas
          </Button>
        </Stack>
      </Paper>
    );

  return (
    <Box data-testid="ideas-pages-ideas-page-form" component="section" sx={{ minWidth: 0, pb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <LightbulbOutlined />
          </Box>
          <Box>
            <Typography component="h1" variant="h5" fontWeight={800}>
              {fromTemplatePage ? 'Criar página de ideias' : 'Editar página de ideias'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Organize ideias e materiais para inspirar os professores.
            </Typography>
          </Box>
        </Stack>
        {loadedPage?.route?.path && (
          <Button
            type="button"
            component="a"
            href={`/${loadedPage.route.path}`}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNew />}
            variant="outlined"
            sx={{ minHeight: 44, flexShrink: 0 }}
          >
            Ver página salva
          </Button>
        )}
      </Stack>

      <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 280px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Informações da página
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Apresentação que aparece antes das ideias e dos materiais.
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Título da página"
                  required
                  fullWidth
                  value={values.title}
                  onChange={(event) => setValue('title', event.target.value)}
                  error={errors.title}
                  inputProps={{ maxLength: IDEAS_TITLE_MAX_LENGTH }}
                  helperText={
                    errors.title
                      ? 'Informe um título com até 255 caracteres.'
                      : `${values.title.length}/${IDEAS_TITLE_MAX_LENGTH}`
                  }
                />
                <TextField
                  label="Subtítulo"
                  fullWidth
                  value={values.subtitle ?? ''}
                  onChange={(event) => setValue('subtitle', event.target.value)}
                  inputProps={{ maxLength: IDEAS_TITLE_MAX_LENGTH }}
                  error={errors.subtitle}
                  helperText={
                    errors.subtitle
                      ? 'Use até 255 caracteres no subtítulo.'
                      : 'Opcional. Uma frase curta para complementar o título.'
                  }
                />
                <TextField
                  label="Descrição"
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  value={values.description}
                  onChange={(event) => setValue('description', event.target.value)}
                  error={errors.description}
                  helperText={
                    errors.description
                      ? 'Preencha a descrição da página.'
                      : 'Conte o que os professores vão encontrar aqui.'
                  }
                />
              </Stack>
            </Paper>

            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography component="h2" variant="h6" fontWeight={700}>
                    Seções da página{' '}
                    <Typography component="span" color="text.secondary">
                      ({sections.length})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uma ideia por seção, com seus textos e materiais.
                  </Typography>
                </Box>
                <Button
                  data-testid="ideas-page-add-section"
                  type="button"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addSection}
                  sx={{ minHeight: 44, flexShrink: 0 }}
                >
                  Nova seção
                </Button>
              </Stack>
              {sections.length > 1 && (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  {showSearch && (
                    <TextField
                      size="small"
                      placeholder="Buscar seção pelo título ou número"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      inputProps={{
                        'aria-label': 'Buscar seção',
                        'data-testid': 'ideas-section-search',
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1 }}
                    />
                  )}
                  <Stack direction="row" spacing={1} sx={{ ml: { sm: 'auto' } }}>
                    <Button
                      data-testid="ideas-sections-expand-all"
                      type="button"
                      size="small"
                      startIcon={<ExpandMore />}
                      onClick={expandAll}
                      sx={{ minHeight: 44 }}
                    >
                      Expandir todas
                    </Button>
                    <Button
                      data-testid="ideas-sections-collapse-all"
                      type="button"
                      size="small"
                      startIcon={<ExpandLess />}
                      onClick={collapseAll}
                      sx={{ minHeight: 44 }}
                    >
                      Recolher todas
                    </Button>
                  </Stack>
                </Stack>
              )}
              {query.trim() && (
                <Typography
                  data-testid="ideas-section-search-result"
                  role="status"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  {visibleCount
                    ? `${visibleCount} de ${sections.length} seções`
                    : 'Nenhuma seção encontrada para essa busca.'}
                </Typography>
              )}
              {!sections.length ? (
                <Paper
                  data-testid="ideas-page-empty"
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    borderColor: errors.sections ? 'error.main' : 'divider',
                  }}
                >
                  <LightbulbOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography fontWeight={700}>Sua primeira ideia começa aqui</Typography>
                  <Typography
                    color={errors.sections ? 'error' : 'text.secondary'}
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    Adicione ao menos uma seção para organizar os materiais.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {sections.map((section, index) => (
                    <Box
                      key={sectionKeyOf(section)}
                      id={`${IDEAS_SECTION_ANCHOR_PREFIX}${sectionKeyOf(section)}`}
                      hidden={!sectionMatchesQuery(section, index, query)}
                      sx={{ scrollMarginTop: 16 }}
                    >
                      <IdeasSectionEditor
                        section={section}
                        index={index}
                        onChange={(next) => updateSection(index, next)}
                        onRemove={() => setSections(sections.filter((_, i) => i !== index))}
                        titleError={
                          errors.sectionTitles &&
                          (!section.title.trim() || section.title.length > IDEAS_TITLE_MAX_LENGTH)
                        }
                        apiErrors={sectionApiErrors[index]}
                        expanded={!collapsed.has(sectionKeyOf(section))}
                        onExpandedChange={(open) => setSectionExpanded(sectionKeyOf(section), open)}
                        focusRequest={
                          focusRequest?.sectionKey === (section.id ?? section.clientId)
                            ? focusRequest
                            : undefined
                        }
                        onDraftChange={(_hasDraft, mediaTypes) =>
                          trackDraft(section.id ?? section.clientId ?? '', mediaTypes)
                        }
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          <Paper
            data-testid="ideas-page-summary"
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, position: { lg: 'sticky' }, top: 24 }}
          >
            <Typography component="h2" variant="subtitle1" fontWeight={700}>
              Resumo da página
            </Typography>
            <Stack spacing={1.5} sx={{ my: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Seções</Typography>
                <Typography fontWeight={700}>{sections.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Materiais</Typography>
                <Typography fontWeight={700}>{totalMedia}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Seções públicas</Typography>
                <Typography fontWeight={700}>{publicSections}</Typography>
              </Stack>
            </Stack>
            {sections.length > 1 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography component="h3" variant="subtitle2" sx={{ mb: 0.5 }}>
                  Ir para a seção
                </Typography>
                <IdeasSectionOutline items={outlineItems} onSelect={goToSection} />
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={values.public ?? false}
                  onChange={(event) => setValue('public', event.target.checked)}
                />
              }
              label={values.public ? 'Página publicada' : 'Página em rascunho'}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A visibilidade de cada seção é definida no próprio editor.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Antes de salvar</Typography>
              <Typography variant="body2" color="text.secondary">
                Confira os títulos, conclua os materiais em edição e revise a visibilidade das
                seções.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                As alterações entram em vigor ao salvar a página.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Paper
        data-testid="ideas-page-save-bar"
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: 3,
          p: 2,
          pb: 'max(16px, env(safe-area-inset-bottom))',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Stack spacing={1.5}>
          {hasMediaDraft && (
            <Alert data-testid="ideas-page-media-draft-warning" severity="warning">
              <AlertTitle>Conclua os materiais em edição</AlertTitle>
              Adicione, salve ou descarte cada rascunho antes de salvar a página.
              <Stack sx={{ mt: 1, maxHeight: 160, overflowY: 'auto' }}>
                {pendingMedia.map((pending) => (
                  <Button
                    key={`${pending.sectionKey}-${pending.mediaType}`}
                    data-testid="ideas-page-resume-media"
                    type="button"
                    color="inherit"
                    onClick={() =>
                      setFocusRequest((previous) => ({
                        sectionKey: pending.sectionKey,
                        mediaType: pending.mediaType,
                        sequence: (previous?.sequence ?? 0) + 1,
                      }))
                    }
                    sx={{
                      minHeight: 44,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    Continuar: {pending.sectionLabel} · {pending.mediaLabel}
                  </Button>
                ))}
              </Stack>
            </Alert>
          )}
          {feedback && (
            <Alert
              data-testid="ideas-page-feedback"
              severity={feedback.severity}
              onClose={dismissFeedback}
            >
              {feedback.message}
            </Alert>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
          >
            <Chip
              size="small"
              icon={<CheckCircleOutline />}
              label={
                saving
                  ? 'Salvando alterações…'
                  : isDirty || hasMediaDraft
                    ? 'Alterações não salvas'
                    : 'Nenhuma alteração pendente'
              }
              color={isDirty || hasMediaDraft ? 'warning' : 'default'}
              variant="outlined"
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
            />
            <Stack direction="row" spacing={1}>
              {!fromTemplatePage && (
                <Button
                  type="button"
                  onClick={exit.requestExit}
                  disabled={saving}
                  startIcon={<ArrowBack />}
                  sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' } }}
                  aria-label="Voltar para a lista"
                >
                  Voltar para a lista
                </Button>
              )}
              <Button
                data-testid="ideas-page-save"
                type="button"
                variant="contained"
                disabled={saving || hasMediaDraft}
                onClick={() => void save()}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Salvando...' : 'Salvar Página'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <UnsavedChangesDialog
        open={exit.confirming}
        onStay={exit.cancelExit}
        onLeave={exit.confirmExit}
      />
    </Box>
  );
}
