import { canDeleteLesson } from '@/features/ai-lessons/workflow';
import { getErrorMessage } from '@/utils/apiError';
import { downloadLessonPdf, lessonPdfError } from '@/features/ai-lessons/pdf';
import { LessonCategory, LessonStatus } from '@/features/ai-lessons/types';
import {
  LESSON_LIST_PAGE_SIZE,
  LESSON_SEARCH_DEBOUNCE_MS,
  PRODUCTION_COMPLETED_STATUSES,
  getStudioStageOrder,
} from '@/features/ai-lessons/constants';
import {
  formatLessonBadgeLabel,
  parseLessonCategory,
  parseLessonSortOption,
  parseLessonStatus,
} from '@/features/ai-lessons/utils';
import {
  LESSON_CATEGORY_FILTER_OPTIONS,
  PRODUCTION_STATUS_OPTIONS as STATUS_OPTIONS,
  PRODUCTION_SORT_OPTIONS as SORT_OPTIONS,
  PRODUCTION_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS,
  PRODUCTION_STATUSPRESENTATION as statusPresentation,
} from '@/features/ai-lessons/listConstants';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AiIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  PictureAsPdfOutlined as PdfIcon,
  Settings as SettingsIcon,
  EventNoteOutlined as WeekIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { ListingCard, ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingBadge, ListingFilter, ListingMeta } from '@/components/common/listing';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import { useDeleteLessonDraft, useLessonDrafts } from '@/hooks/api/useAiLessons';
import { LessonAiGenerateModal } from '@/components/ai-lessons/LessonAiGenerateModal';
import { aiLessonsService, GetLessonDraftsParams, Lesson } from '@/services/aiLessonsService';

export const AiLessonsListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LESSON_LIST_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LessonStatus | ''>('');
  const [category, setCategory] = useState<LessonCategory | ''>('');
  const [sortOption, setSortOption] = useState('updatedAt:DESC');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, LESSON_SEARCH_DEBOUNCE_MS);

  const queryParams = useMemo<GetLessonDraftsParams>(() => {
    const { sort, order } = parseLessonSortOption(sortOption);
    return {
      status: status || undefined,
      category: category || undefined,
      search: debouncedSearch.trim() || undefined,
      page,
      limit: pageSize,
      sort,
      order,
    };
  }, [status, category, debouncedSearch, page, pageSize, sortOption]);

  const { data, isLoading, isError, refetch } = useLessonDrafts(queryParams);
  const deleteMutation = useDeleteLessonDraft();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleExportPdf = async (id: string, themeName: string) => {
    if (downloadingId) return;
    setDownloadingId(id);
    setErrorMsg('');
    try {
      const blob = await aiLessonsService.exportPdf(id);
      downloadLessonPdf(blob, `Licao_${themeName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
      setErrorMsg(await lessonPdfError(error));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      // The request skips the global toast: the reason is shown inside the dialog.
      setDeleteError(getErrorMessage(error, 'Não foi possível excluir a lição.'));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(parseLessonStatus(value));
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setPage(1);
  };

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setCategory('');
    setSortOption('updatedAt:DESC');
    setPage(1);
  }, []);

  const listingFilters: ListingFilter[] = [
    {
      id: 'status',
      label: 'Status',
      value: status,
      options: STATUS_OPTIONS,
      onChange: handleStatusChange,
    },
    {
      id: 'category',
      label: 'Tipo de material',
      value: category,
      options: LESSON_CATEGORY_FILTER_OPTIONS,
      onChange: (value) => {
        setCategory(parseLessonCategory(String(value)));
        setPage(1);
      },
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: sortOption,
      options: SORT_OPTIONS,
      onChange: handleSortChange,
    },
  ];

  const createButton = (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        onClick={() => navigate('/adm/estudio/orientacoes')}
        sx={{ minHeight: 44, borderRadius: 2.5, fontWeight: 600, textTransform: 'none' }}
      >
        Orientações
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setModalOpen(true)}
        sx={{ minHeight: 44, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
      >
        Nova lição
      </Button>
    </Stack>
  );

  return (
    <Box
      data-testid="ai-lessons-list-page"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: '100%',
      }}
    >
      <ListingLayout
        data-testid="ai-lessons-listing-layout"
        title="Produção de Lições Bíblicas"
        summary={`${total} ${total === 1 ? 'lição cadastrada' : 'lições encontradas'} no estúdio`}
        toolbar={
          <ListingToolbar
            searchValue={search}
            searchPlaceholder="Buscar por tema, referência bíblica..."
            onSearchChange={handleSearchChange}
            filters={listingFilters}
            onRefresh={refetch}
            action={createButton}
            onClearFilters={handleClearFilters}
          />
        }
        loading={isLoading}
        error={errorMsg || (isError ? 'Erro ao carregar lições.' : undefined)}
        onDismissError={() => setErrorMsg('')}
        itemCount={items.length}
        emptyTitle="Nenhuma lição encontrada"
        emptySubtitle="Ajuste a busca ou o filtro de status para encontrar as produções do estúdio."
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          },
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        overlays={
          <>
            <LessonAiGenerateModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={(id) => {
                refetch();
                navigate(`/adm/estudio/licoes/${id}`);
              }}
            />

            <Dialog
              data-testid="ai-lessons-delete-dialog"
              open={Boolean(deleteTarget)}
              onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
              maxWidth="xs"
              fullWidth
              slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
            >
              <DialogTitle sx={{ fontWeight: 800 }}>Excluir Lição?</DialogTitle>
              <DialogContent>
                <DialogContentText color="text.secondary">
                  Tem certeza que deseja excluir a lição <strong>{deleteTarget?.theme}</strong>{' '}
                  ({deleteTarget ? formatLessonBadgeLabel(deleteTarget) : ''})?
                </DialogContentText>
                <DialogContentText
                  color="error.main"
                  sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Esta ação é irreversível. Todas as {deleteTarget?.stages?.length ?? ''} etapas,
                  versões geradas, comentários e arquivos de imagem associados serão
                  permanentemente removidos.
                </DialogContentText>
                {deleteError && (
                  <Alert data-testid="ai-lessons-delete-error" severity="error" sx={{ mt: 2 }}>
                    {deleteError}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteMutation.isPending}
                  sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="contained"
                  color="error"
                  disabled={deleteMutation.isPending}
                  startIcon={
                    deleteMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteIcon />
                    )
                  }
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir tudo'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        }
      >
        {items.map((item: Lesson) => {
          const completed = item.stages.filter((stage) =>
            PRODUCTION_COMPLETED_STATUSES.includes(stage.status)
          ).length;
          const totalStages = item.stages.length || getStudioStageOrder(item.category).length;
          const progressPercent = Math.round((completed / totalStages) * 100);
          const presentation = statusPresentation[item.status];

          const badges: ListingBadge[] = [{ label: presentation.label, color: presentation.color }];
          if (item.category === LessonCategory.SPECIAL) {
            badges.push({ label: 'Material Especial', color: 'secondary' });
          }

          const meta: ListingMeta[] = [
            {
              icon: <WeekIcon sx={{ fontSize: 16 }} />,
              label: formatLessonBadgeLabel(item),
            },
          ];

          return (
            <Grid2 key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ListingCard
                data-testid={`ai-lesson-card-${item.id}`}
                avatar={<AiIcon fontSize="small" />}
                title={item.theme}
                subtitle={item.biblicalReference}
                accent={presentation.color}
                badges={badges}
                meta={meta}
                onClick={() => navigate(`/adm/estudio/licoes/${item.id}`)}
                footer={
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="caption" color="text.secondary" noWrap>
                        Atualizada em {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="primary.main">
                        {completed}/{totalStages} etapas
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': { borderRadius: 3 },
                      }}
                    />
                  </Box>
                }
                actions={
                  <>
                    <Tooltip title="Baixar PDF Oficial">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          data-testid={`ai-lesson-download-${item.id}`}
                          disabled={Boolean(downloadingId)}
                          sx={{ minWidth: 44, minHeight: 44 }}
                          aria-label={`Baixar PDF de ${item.theme}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleExportPdf(item.id, item.theme);
                          }}
                        >
                          <>
                            {downloadingId === item.id ? (
                              <CircularProgress
                                data-testid="ai-lesson-download-loading"
                                size={20}
                                aria-label="Baixando PDF"
                              />
                            ) : (
                              <PdfIcon fontSize="small" />
                            )}
                          </>
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Abrir Produção">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label={`Abrir produção ${item.theme}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/adm/estudio/licoes/${item.id}`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {canDeleteLesson(item) && (
                      <Tooltip title="Excluir Lição">
                        <IconButton
                          data-testid={`ai-lessons-delete-action-${item.id}`}
                          size="small"
                          color="error"
                          aria-label={`Excluir lição ${item.theme}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteError(null);
                            setDeleteTarget(item);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                }
              />
            </Grid2>
          );
        })}
      </ListingLayout>
    </Box>
  );
};
