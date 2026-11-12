import {
  LessonCategory,
  LessonStatus,
  LessonSortField,
  LessonSortOrder,
  LessonStageStatus,
} from '@/features/ai-lessons/types';
import {
  LESSON_LIST_PAGE_SIZE,
  LESSON_SEARCH_DEBOUNCE_MS,
  LESSON_PAGE_SIZE_OPTIONS,
  REVIEW_LESSON_STATUSES,
  getStudioStageOrder,
} from '@/features/ai-lessons/constants';
import {
  formatLessonBadgeLabel,
  parseLessonCategory,
  parseLessonStatus,
} from '@/features/ai-lessons/utils';
import {
  LESSON_CATEGORY_FILTER_OPTIONS,
  REVIEW_STATUS_OPTIONS as STATUS_OPTIONS,
  REVIEW_STATUSPRESENTATION as statusPresentation,
} from '@/features/ai-lessons/listConstants';
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid2,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  FactCheck as ReviewIcon,
  CheckCircle as ApprovedIcon,
  ArrowForward as ArrowIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STUDIO_LIST_STATUS_PARAM } from '@/features/ai-lessons/hub.constants';
import { parseListStatus } from '@/features/ai-lessons/hub.utils';

import { ListingCard, ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter, ListingMeta } from '@/components/common/listing';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import { useLessonDrafts } from '@/hooks/api/useAiLessons';
import type { Lesson } from '@/services/aiLessonsService';

export const AiLessonsReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LESSON_LIST_PAGE_SIZE);
  const [search, setSearch] = useState('');
  // O painel do estúdio abre a lista já filtrada: `?status=PUBLISHED`.
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<LessonStatus | ''>(() =>
    parseListStatus(searchParams.get(STUDIO_LIST_STATUS_PARAM))
  );
  const [category, setCategory] = useState<LessonCategory | ''>('');

  const debouncedSearch = useDebouncedValue(search, LESSON_SEARCH_DEBOUNCE_MS);

  const { data, isLoading, isError, refetch } = useLessonDrafts({
    statuses: status ? [status] : REVIEW_LESSON_STATUSES,
    category: category || undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize,
    sort: LessonSortField.UPDATED_AT,
    order: LessonSortOrder.DESC,
  });

  const filteredItems = data?.items ?? [];

  const listingFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: 'status',
        label: 'Status de revisão',
        value: status,
        options: STATUS_OPTIONS,
        onChange: (val) => {
          setStatus(parseLessonStatus(String(val)));
          setPage(1);
        },
      },
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
    [status, category]
  );

  const totalCount = data?.total ?? filteredItems.length;

  return (
    <Box
      data-testid="ai-lessons-review-list"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, md: 3 },
      }}
    >
      <ListingLayout
        title="Revisão e Aprovação de Lições"
        summary="Área exclusiva para revisão criteriosa de cada item gerado e aprovação final. Após aprovar todos os itens, publique o pacote para criar o material semanal. A semana atual é definida separadamente."
        toolbar={
          <ListingToolbar
            searchValue={search}
            searchPlaceholder="Buscar por tema ou referência bíblica..."
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            filters={listingFilters}
            onRefresh={() => void refetch()}
            action={
              <Button
                variant="outlined"
                startIcon={<AiIcon />}
                onClick={() => navigate('/adm/estudio/licoes')}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Ir para Produção de Lições
              </Button>
            }
          />
        }
        loading={isLoading}
        error={
          isError ? 'Não foi possível carregar a fila de revisão. Tente novamente.' : undefined
        }
        itemCount={filteredItems.length}
        emptyTitle="Nenhuma lição pronta para revisão"
        emptySubtitle="As lições geradas na área de Produção de Lições aparecerão aqui assim que seus itens forem concluídos."
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
        {filteredItems.map((item: Lesson) => {
          const approvedCount =
            item.stages?.filter((s) => s.status === LessonStageStatus.APPROVED).length ?? 0;
          const totalStages = item.stages?.length ?? getStudioStageOrder(item.category).length;
          const progress = totalStages > 0 ? (approvedCount / totalStages) * 100 : 0;
          const statusInfo = statusPresentation[item.status];

          const meta: ListingMeta[] = [
            { label: `${approvedCount}/${totalStages} itens aprovados (${Math.round(progress)}%)` },
          ];

          return (
            <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ListingCard
                data-testid={`ai-lesson-review-card-${item.id}`}
                avatar={<ReviewIcon fontSize="small" />}
                title={`${formatLessonBadgeLabel(item)}: ${item.theme}`}
                subtitle={item.biblicalReference}
                accent={statusInfo.color}
                badges={[
                  {
                    label: statusInfo.label,
                    color: statusInfo.color,
                  },
                ]}
                meta={meta}
                footer={
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        Aprovação de itens
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="primary.main">
                        {approvedCount}/{totalStages} aprovados ({Math.round(progress)}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 7,
                        borderRadius: 3.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3.5,
                          bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>
                }
                actions={
                  <Button
                    fullWidth
                    variant={
                      item.status === LessonStatus.READY_FOR_PUBLICATION ||
                      item.status === LessonStatus.PUBLISHED
                        ? 'outlined'
                        : 'contained'
                    }
                    color={
                      item.status === LessonStatus.READY_FOR_PUBLICATION ? 'success' : 'primary'
                    }
                    endIcon={
                      item.status === LessonStatus.PUBLISHED ? <ApprovedIcon /> : <ArrowIcon />
                    }
                    onClick={() => navigate(`/adm/estudio/revisao/${item.id}`)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    {item.status === LessonStatus.PUBLISHED
                      ? 'Ver Lição Publicada'
                      : item.status === LessonStatus.READY_FOR_PUBLICATION
                        ? 'Aprovada — Publicar'
                        : 'Revisar & Aprovar Itens'}
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
