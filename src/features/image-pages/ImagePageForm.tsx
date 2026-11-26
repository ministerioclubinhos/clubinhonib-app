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
  CheckCircleOutline,
  ExpandLess,
  ExpandMore,
  PhotoLibraryOutlined,
  OpenInNew,
  Save,
  Search,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import SectionOutline from '@/components/common/section-outline/SectionOutline';
import { useGuardedExit } from '@/hooks';
import type { MediaItem } from '@/store/slices/types';

import AddImagesDialog from './components/AddImagesDialog';
import ImageSectionEditor from './components/ImageSectionEditor';
import {
  IMAGE_PAGE_ROUTES,
  IMAGE_SECTION_ANCHOR_PREFIX,
  IMAGE_SECTION_SEARCH_THRESHOLD,
  IMAGE_TITLE_MAX_LENGTH,
} from './constants';
import { useImagePageById, useImagePageForm, useUnsavedChangesGuard } from './hooks';
import type { ImagePageFormProps, ImageSectionDraft } from './types';
import { countMedia, createImageSectionDraft, sectionKeyOf, sectionMatchesQuery } from './utils';

/** Formulário usado para criar e para editar uma galeria de fotos. */
export default function ImagePageForm({ fromTemplatePage = false }: ImagePageFormProps) {
  const navigate = useNavigate();

  // A galeria vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    page: loadedPage,
    loading: loadingPage,
    error: loadError,
    retry,
  } = useImagePageById(fromTemplatePage ? undefined : id);

  const [sectionForImages, setSectionForImages] = useState<number | null>(null);
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
  } = useImagePageForm({ isCreation: fromTemplatePage, page: loadedPage });

  useUnsavedChangesGuard(isDirty || saving);
  // Sair pelo botão da própria tela passa pela mesma confirmação do menu.
  const exit = useGuardedExit(isDirty || saving, IMAGE_PAGE_ROUTES.MANAGE);

  // Ao editar uma galeria salva, todas as seções abrem recolhidas: o
  // administrador escolhe qual abrir. Na criação não há nada a recolher.
  useEffect(() => {
    const saved = loadedPage?.sections ?? [];
    setCollapsed(new Set(saved.map((item) => item.id)));
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

  const goToSection = (key: string) => {
    setSectionExpanded(key, true);
    setQuery('');
    requestAnimationFrame(() =>
      document
        .getElementById(`${IMAGE_SECTION_ANCHOR_PREFIX}${key}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const addSection = () => {
    const draft = createImageSectionDraft();
    setSections([...sections, draft]);
    goToSection(sectionKeyOf(draft));
  };

  const updateSection = (index: number, section: ImageSectionDraft) =>
    setSections(sections.map((item, i) => (i === index ? section : item)));

  const addImagesToSection = (images: MediaItem[]) => {
    if (sectionForImages === null) return;
    setSections(
      sections.map((section, index) =>
        index === sectionForImages
          ? { ...section, mediaItems: [...section.mediaItems, ...images] }
          : section
      )
    );
    setSectionForImages(null);
  };

  const totalImages = countMedia(sections);
  const publicSections = sections.filter((section) => section.public).length;
  const showSearch = sections.length >= IMAGE_SECTION_SEARCH_THRESHOLD;
  const captionTooLong = (section: ImageSectionDraft) =>
    errors.captions && section.caption.length > IMAGE_TITLE_MAX_LENGTH;
  const outlineItems = sections.map((section, index) => ({
    key: sectionKeyOf(section),
    index,
    title: section.caption,
    public: section.public,
    hasError: Boolean(sectionApiErrors[index]?.length) || captionTooLong(section),
    hasDraft: false,
  }));
  const visibleCount = sections.filter((section, index) =>
    sectionMatchesQuery(section, index, query)
  ).length;

  if (loadingPage) {
    return (
      <Stack
        data-testid="image-pages-image-page-form"
        spacing={2}
        aria-busy="true"
        aria-label="Carregando galeria"
      >
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (!fromTemplatePage && !loadedPage) {
    return (
      <Paper
        data-testid="image-pages-image-page-form"
        variant="outlined"
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Alert data-testid="image-page-load-error" severity="error">
          <AlertTitle>Galeria não encontrada</AlertTitle>
          {loadError || 'Abra a galeria que você quer editar pela lista.'}
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="button" onClick={retry} sx={{ minHeight: 44 }}>
            Tentar novamente
          </Button>
          <Button
            type="button"
            onClick={() => navigate(IMAGE_PAGE_ROUTES.MANAGE)}
            sx={{ minHeight: 44 }}
          >
            Ver galerias
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box data-testid="image-pages-image-page-form" component="section" sx={{ minWidth: 0, pb: 2 }}>
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
            <PhotoLibraryOutlined />
          </Box>
          <Box>
            <Typography component="h1" variant="h5" fontWeight={800}>
              {fromTemplatePage ? 'Criar galeria de fotos' : 'Editar galeria de fotos'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Organize as fotos em seções para os visitantes.
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
            Ver galeria salva
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
                Aparecem no topo da galeria que os visitantes abrem.
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Título da galeria"
                  required
                  fullWidth
                  value={values.title}
                  onChange={(event) => setValue('title', event.target.value)}
                  error={errors.title}
                  inputProps={{ maxLength: IMAGE_TITLE_MAX_LENGTH }}
                  helperText={
                    errors.title
                      ? 'Informe um título com até 255 caracteres.'
                      : `${values.title.length}/${IMAGE_TITLE_MAX_LENGTH}`
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
                      ? 'Preencha a descrição da galeria.'
                      : 'Um resumo curto do que a galeria reúne'
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
                    Seções da galeria{' '}
                    <Typography component="span" color="text.secondary">
                      ({sections.length})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cada seção agrupa um conjunto de fotos.
                  </Typography>
                </Box>
                <Button
                  data-testid="image-page-add-section"
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
                      placeholder="Buscar seção pela legenda ou número"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      inputProps={{
                        'aria-label': 'Buscar seção',
                        'data-testid': 'image-section-search',
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
                      data-testid="image-sections-expand-all"
                      type="button"
                      size="small"
                      startIcon={<ExpandMore />}
                      onClick={() => setCollapsed(new Set())}
                      sx={{ minHeight: 44 }}
                    >
                      Expandir todas
                    </Button>
                    <Button
                      data-testid="image-sections-collapse-all"
                      type="button"
                      size="small"
                      startIcon={<ExpandLess />}
                      onClick={() => setCollapsed(new Set(sections.map(sectionKeyOf)))}
                      sx={{ minHeight: 44 }}
                    >
                      Recolher todas
                    </Button>
                  </Stack>
                </Stack>
              )}
              {query.trim() && (
                <Typography
                  data-testid="image-section-search-result"
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

              {sections.length === 0 ? (
                <Paper
                  data-testid="image-page-empty"
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    borderColor: errors.sections ? 'error.main' : 'divider',
                  }}
                >
                  <PhotoLibraryOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography fontWeight={700}>Nenhuma seção criada ainda</Typography>
                  <Typography
                    color={errors.sections ? 'error' : 'text.secondary'}
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    Adicione ao menos uma seção para organizar as fotos.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {sections.map((section, index) => {
                    const key = sectionKeyOf(section);
                    return (
                      <Box
                        key={key}
                        id={`${IMAGE_SECTION_ANCHOR_PREFIX}${key}`}
                        hidden={!sectionMatchesQuery(section, index, query)}
                        sx={{ scrollMarginTop: 16 }}
                      >
                        <ImageSectionEditor
                          section={section}
                          index={index}
                          onChange={(next) => updateSection(index, next)}
                          onRemove={() => setSections(sections.filter((_, i) => i !== index))}
                          onAddImages={() => setSectionForImages(index)}
                          expanded={!collapsed.has(key)}
                          onExpandedChange={(open) => setSectionExpanded(key, open)}
                          captionError={captionTooLong(section)}
                          apiErrors={sectionApiErrors[index]}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Stack>

          <Paper
            data-testid="image-page-summary"
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, position: { lg: 'sticky' }, top: 24 }}
          >
            <Typography component="h2" variant="subtitle1" fontWeight={700}>
              Resumo da galeria
            </Typography>
            <Stack spacing={1.5} sx={{ my: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Seções</Typography>
                <Typography fontWeight={700}>{sections.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Imagens</Typography>
                <Typography fontWeight={700}>{totalImages}</Typography>
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
                <SectionOutline items={outlineItems} onSelect={goToSection} />
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={values.public}
                  onChange={(event) => setValue('public', event.target.checked)}
                />
              }
              label={
                values.public ? 'Página pública' : 'Página visível apenas para quem está logado'
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A visibilidade de cada seção é definida no próprio editor.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              As alterações entram em vigor ao salvar a galeria.
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Paper
        data-testid="image-page-save-bar"
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
          {feedback && (
            <Alert
              data-testid="image-page-feedback"
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
                  : isDirty
                    ? 'Alterações não salvas'
                    : 'Nenhuma alteração pendente'
              }
              color={isDirty ? 'warning' : 'default'}
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
                >
                  Voltar para a lista
                </Button>
              )}
              <Button
                data-testid="image-page-save"
                type="button"
                variant="contained"
                disabled={saving}
                onClick={() => void save()}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Salvando...' : 'Salvar Galeria'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <AddImagesDialog
        open={sectionForImages !== null}
        onClose={() => setSectionForImages(null)}
        onConfirm={addImagesToSection}
      />

      <UnsavedChangesDialog
        open={exit.confirming}
        onStay={exit.cancelExit}
        onLeave={exit.confirmExit}
      />
    </Box>
  );
}
