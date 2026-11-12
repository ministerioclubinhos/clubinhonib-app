import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid2, LinearProgress, Stack, Typography } from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  AutoAwesome as AiIcon,
  CheckCircle as ApprovedIcon,
  FactCheck as ReviewIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ListingCard, ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';
import {
  LESSON_LIST_PAGE_SIZE,
  LESSON_PAGE_SIZE_OPTIONS,
  LESSON_SEARCH_DEBOUNCE_MS,
} from '@/features/ai-lessons/constants';
import { STUDIO_LIST_STATUS_PARAM } from '@/features/ai-lessons/hub.constants';
import { hubRelativeTime, parseListStatus } from '@/features/ai-lessons/hub.utils';
import {
  LESSON_CATEGORY_FILTER_OPTIONS,
  REVIEW_STATUSPRESENTATION as statusPresentation,
} from '@/features/ai-lessons/listConstants';
import { STUDIO_ROUTES } from '@/features/ai-lessons/presentation.constants';
import {
  REVIEW_EMPTY_TEXTS,
  REVIEW_QUEUE_VIEWS,
  REVIEW_TEXTS,
} from '@/features/ai-lessons/review.constants';
import {
  reviewCardAction,
  reviewLessonSummary,
  reviewProgressText,
  reviewQueueCounts,
  reviewViewFromStatus,
  reviewViewStatuses,
} from '@/features/ai-lessons/review.utils';
import {
  LessonCategory,
  LessonSortField,
  LessonSortOrder,
  LessonStatus,
  ReviewQueueView,
} from '@/features/ai-lessons/types';
import { formatLessonBadgeLabel, parseLessonCategory } from '@/features/ai-lessons/utils';
import { useLessonDashboard, useLessonDrafts } from '@/hooks/api/useAiLessons';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import type { Lesson } from '@/services/aiLessonsService';

/**
 * Fila de revisão (`/adm/estudio/revisao`).
 *
 * A fila é dividida em recortes — o que espera o revisor, o que está pronto
 * para publicar, o que voltou à produção e o que já saiu —, cada um com a sua
 * contagem. Antes tudo vinha junto, e as publicadas escondiam o que precisava
 * de decisão.
 */
export const AiLessonsReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LESSON_LIST_PAGE_SIZE);
  const [search, setSearch] = useState('');
  // O painel do estúdio abre a fila já no recorte certo: `?status=READY_FOR_PUBLICATION`.
  const [view, setView] = useState<ReviewQueueView>(() =>
    reviewViewFromStatus(parseListStatus(searchParams.get(STUDIO_LIST_STATUS_PARAM)))
  );
  const [category, setCategory] = useState<LessonCategory | ''>('');

  const debouncedSearch = useDebouncedValue(search, LESSON_SEARCH_DEBOUNCE_MS);

  const { data, isLoading, isError, refetch } = useLessonDrafts({
    statuses: [...reviewViewStatuses(view)],
    category: category || undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize,
    sort: LessonSortField.UPDATED_AT,
    order: LessonSortOrder.DESC,
  });
  const dashboard = useLessonDashboard();
  const counts = useMemo(() => reviewQueueCounts(dashboard.data?.byStatus), [dashboard.data]);

  const items = data?.items ?? [];
  const totalCount = data?.total ?? items.length;

  const listingFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: 'category',
        label: 'Tipo de material',
        value: category,
        options: LESSON_CATEGORY_FILTER_OPTIONS,
        onChange: (val) => {
          setCategory(parseLessonCategory(String(val)));
          setPage(1);
        },
      },
    ],
    [category]
  );

  const refresh = () => {
    void refetch();
    void dashboard.refetch();
  };

  return (
    <Box
      data-testid="ai-lessons-review-list"
      sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 1.5, md: 3 } }}
    >
      <ListingLayout
        title={REVIEW_TEXTS.listTitle}
        summary={REVIEW_TEXTS.listSummary}
        toolbar={
          <Stack gap={1.5}>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              role="tablist"
              aria-label="Recortes da fila de revisão"
              data-testid="ai-lessons-review-views"
            >
              {REVIEW_QUEUE_VIEWS.map((item) => {
                const selected = item.view === view;
                const count = counts[item.view];
                const highlight = Boolean(item.urgent) && count > 0;
                return (
                  <Chip
                    key={item.view}
                    role="tab"
                    aria-selected={selected}
                    data-testid={`ai-lessons-review-view-${item.view}`}
                    label={dashboard.data ? `${item.label} · ${count}` : item.label}
                    color={selected ? 'primary' : highlight ? 'warning' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => {
                      setView(item.view);
                      setPage(1);
                    }}
                    sx={{ fontWeight: 700, minHeight: 36, borderRadius: 2 }}
                  />
                );
              })}
            </Stack>
            <ListingToolbar
              searchValue={search}
              searchPlaceholder="Buscar por tema ou referência bíblica..."
              onSearchChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              filters={listingFilters}
              onRefresh={refresh}
              action={
                <Button
                  variant="outlined"
                  startIcon={<AiIcon />}
                  onClick={() => navigate(STUDIO_ROUTES.production)}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
                >
                  Ir para a produção
                </Button>
              }
            />
          </Stack>
        }
        loading={isLoading}
        error={isError ? 'Não foi possível carregar a fila de revisão. Tente novamente.' : undefined}
        itemCount={items.length}
        emptyTitle={REVIEW_EMPTY_TEXTS[view].title}
        emptySubtitle={REVIEW_EMPTY_TEXTS[view].subtitle}
        pagination={{
          page,
          pageSize,
          total: totalCount,
          onPageChange: setPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1);
          },
        }}
        pageSizeOptions={LESSON_PAGE_SIZE_OPTIONS}
      >
        {items.map((item: Lesson) => {
          const summary = reviewLessonSummary(item);
          const statusInfo = statusPresentation[item.status];
          const action = reviewCardAction(item);
          const published = item.status === LessonStatus.PUBLISHED;

          return (
            <Grid2 key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ListingCard
                data-testid={`ai-lesson-review-card-${item.id}`}
                avatar={<ReviewIcon fontSize="small" />}
                title={item.theme}
                subtitle={item.biblicalReference}
                accent={statusInfo.color}
                badges={[
                  { label: statusInfo.label, color: statusInfo.color },
                  { label: formatLessonBadgeLabel(item), color: 'default' },
                ]}
                meta={[{ label: `Mexida ${hubRelativeTime(item.updatedAt)}` }]}
                footer={
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      data-testid={`ai-lesson-review-card-progress-${item.id}`}
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {reviewProgressText(summary)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={summary.percent}
                      color={summary.percent === 100 ? 'success' : 'primary'}
                      aria-label={`${summary.percent}% dos itens aprovados`}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                }
                actions={
                  <Button
                    fullWidth
                    variant={action.variant}
                    color={action.color}
                    endIcon={published ? <ApprovedIcon /> : <ArrowIcon />}
                    onClick={() => navigate(`${STUDIO_ROUTES.review}/${item.id}`)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
                  >
                    {action.label}
                  </Button>
                }
              />
            </Grid2>
          );
        })}
      </ListingLayout>
    </Box>
  );
};
