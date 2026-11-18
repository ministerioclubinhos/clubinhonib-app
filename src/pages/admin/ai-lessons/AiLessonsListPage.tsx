import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid2, Stack } from '@mui/material';
import { Add as AddIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { StudioActiveGenerations } from '@/features/ai-lessons/components/generation/StudioActiveGenerations';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';
import { LessonAiGenerateModal } from '@/components/ai-lessons/LessonAiGenerateModal';
import { LessonDeleteDialog } from '@/features/ai-lessons/components/production-list/LessonDeleteDialog';
import { ProductionLessonCard } from '@/features/ai-lessons/components/production-list/ProductionLessonCard';
import { LESSON_LIST_PAGE_SIZE, LESSON_SEARCH_DEBOUNCE_MS } from '@/features/ai-lessons/constants';
import { STUDIO_HUB_ROUTES } from '@/features/ai-lessons/hub.constants';
import {
  LESSON_CATEGORY_FILTER_OPTIONS,
  PRODUCTION_PAGE_SIZE_OPTIONS as PAGE_SIZE_OPTIONS,
  PRODUCTION_SORT_OPTIONS as SORT_OPTIONS,
  PRODUCTION_STATUS_OPTIONS as STATUS_OPTIONS,
} from '@/features/ai-lessons/listConstants';
import { downloadLessonPdf, lessonPdfError } from '@/features/ai-lessons/pdf';
import {
  PRODUCTION_LIST_DEFAULT_SORT,
  PRODUCTION_LIST_TEXTS,
} from '@/features/ai-lessons/production-list.constants';
import {
  productionCardItems,
  productionListStatuses,
  readProductionListState,
  writeProductionListState,
  type ProductionListState,
} from '@/features/ai-lessons/production-list.utils';
import { STUDIO_ROUTES } from '@/features/ai-lessons/presentation.constants';
import {
  parseLessonCategory,
  parseLessonSortOption,
  parseLessonStatus,
} from '@/features/ai-lessons/utils';
import { useDeleteLessonDraft, useLessonDrafts } from '@/hooks/api/useAiLessons';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import { aiLessonsService, Lesson } from '@/services/aiLessonsService';
import { getErrorMessage } from '@/utils/apiError';

/**
 * Produção de lições (`/adm/estudio/licoes`).
 *
 * Filtros, busca e página moram na URL: voltar de uma lição devolve a lista
 * como estava. Sem filtro de status, as arquivadas ficam de fora.
 */
export const AiLessonsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => readProductionListState(searchParams), [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(LESSON_LIST_PAGE_SIZE);
  const [search, setSearch] = useState(state.search);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const patch = useCallback(
    (changes: Partial<ProductionListState>) =>
      setSearchParams(
        (current) =>
          writeProductionListState(current, { ...readProductionListState(current), ...changes }),
        { replace: true }
      ),
    [setSearchParams]
  );

  // A busca digitada chega à URL já com o atraso, e volta para a página 1.
  const debouncedSearch = useDebouncedValue(search, LESSON_SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    if (debouncedSearch.trim() !== state.search) patch({ search: debouncedSearch, page: 1 });
    // `state.search` só é lido para comparar; reagir a ele desfaria a digitação.
  }, [debouncedSearch, patch]);

  const { sort, order } = parseLessonSortOption(state.sort);
  const { data, isLoading, isError, refetch } = useLessonDrafts({
    statuses: productionListStatuses(state.status),
    category: state.category || undefined,
    search: state.search || undefined,
    page: state.page,
    limit: pageSize,
    sort,
    order,
  });
  const deleteMutation = useDeleteLessonDraft();

  const total = data?.total ?? 0;
  const cards = useMemo(() => productionCardItems(data?.items ?? []), [data?.items]);

  const handleExportPdf = async (lesson: Lesson) => {
    if (downloadingId) return;
    setDownloadingId(lesson.id);
    setErrorMsg('');
    try {
      const blob = await aiLessonsService.exportPdf(lesson.id);
      downloadLessonPdf(blob, `Licao_${lesson.theme.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
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
      void refetch();
    } catch (error) {
      // A chamada não usa o aviso global: o motivo aparece dentro do diálogo.
      setDeleteError(getErrorMessage(error, 'Não foi possível excluir a lição.'));
    }
  };

  const listingFilters: ListingFilter[] = [
    {
      id: 'status',
      label: 'Status',
      value: state.status,
      options: STATUS_OPTIONS,
      onChange: (value) => patch({ status: parseLessonStatus(String(value)), page: 1 }),
    },
    {
      id: 'category',
      label: 'Tipo de material',
      value: state.category,
      options: LESSON_CATEGORY_FILTER_OPTIONS,
      onChange: (value) => patch({ category: parseLessonCategory(String(value)), page: 1 }),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: state.sort,
      options: SORT_OPTIONS,
      onChange: (value) => patch({ sort: String(value), page: 1 }),
    },
  ];

  const clearFilters = () => {
    setSearch('');
    patch({ status: '', category: '', sort: PRODUCTION_LIST_DEFAULT_SORT, search: '', page: 1 });
  };

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
      <StudioActiveGenerations />
      <ListingLayout
        data-testid="ai-lessons-listing-layout"
        title={PRODUCTION_LIST_TEXTS.title}
        summary={`${total} ${total === 1 ? 'lição' : 'lições'} ${
          state.status ? 'neste status' : 'no estúdio (arquivadas à parte)'
        }`}
        toolbar={
          <Stack gap={1.5}>
            {/* As ações ficam fora da barra de filtros: junto delas a busca ficava com 100 px. */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate(STUDIO_HUB_ROUTES.guidelines)}
                sx={{ minHeight: 44, borderRadius: 2.5, fontWeight: 600, textTransform: 'none' }}
              >
                Orientações
              </Button>
              <Button
                data-testid="ai-lessons-new-lesson"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                sx={{ minHeight: 44, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
              >
                Nova lição
              </Button>
            </Stack>
            <ListingToolbar
              searchValue={search}
              searchPlaceholder="Buscar por tema ou referência bíblica..."
              onSearchChange={setSearch}
              filters={listingFilters}
              onRefresh={() => void refetch()}
              onClearFilters={clearFilters}
            />
          </Stack>
        }
        loading={isLoading}
        error={errorMsg || (isError ? 'Erro ao carregar lições.' : undefined)}
        onDismissError={() => setErrorMsg('')}
        itemCount={cards.length}
        emptyTitle={PRODUCTION_LIST_TEXTS.emptyTitle}
        emptySubtitle={PRODUCTION_LIST_TEXTS.emptySubtitle}
        pagination={{
          page: state.page,
          pageSize,
          total,
          onPageChange: (page) => patch({ page }),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            patch({ page: 1 });
          },
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        overlays={
          <>
            <LessonAiGenerateModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={(id) => {
                void refetch();
                navigate(`${STUDIO_ROUTES.production}/${id}`);
              }}
            />
            <LessonDeleteDialog
              lesson={deleteTarget}
              pending={deleteMutation.isPending}
              error={deleteError}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={() => void handleDeleteConfirm()}
            />
          </>
        }
      >
        {cards.map((item) => (
          <Grid2 key={item.lesson.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ProductionLessonCard
              item={item}
              downloadingId={downloadingId}
              onOpen={(href) => navigate(href)}
              onDownload={() => void handleExportPdf(item.lesson)}
              onDelete={() => {
                setDeleteError(null);
                setDeleteTarget(item.lesson);
              }}
            />
          </Grid2>
        ))}
      </ListingLayout>
    </Box>
  );
};
