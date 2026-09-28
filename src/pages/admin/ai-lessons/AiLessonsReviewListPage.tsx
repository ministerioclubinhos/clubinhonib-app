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
import { useNavigate } from 'react-router-dom';

import { ListingCard, ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingBadge, ListingFilter } from '@/components/common/listing';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import { useLessonDrafts } from '@/hooks/api/useAiLessons';
import type { Lesson } from '@/services/aiLessonsService';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status de revisão' },
  { value: 'PACKAGE_READY', label: 'Pacote completo' },
  { value: 'IN_REVIEW', label: 'Em aprovação' },
  { value: 'CHANGES_REQUESTED', label: 'Ajustes solicitados' },
  { value: 'READY_FOR_PUBLICATION', label: 'Pronto p/ publicar' },
  { value: 'PUBLISHED', label: 'Publicado' },
];

const statusPresentation: Record<string, { label: string; color: ListingBadge['color'] }> = {
  DRAFT: { label: 'EM PRODUÇÃO', color: 'info' },
  IN_PROGRESS: { label: 'EM PRODUÇÃO', color: 'info' },
  PACKAGE_READY: { label: 'AGUARDANDO REVISÃO', color: 'warning' },
  IN_REVIEW: { label: 'EM REVISÃO', color: 'warning' },
  CHANGES_REQUESTED: { label: 'AJUSTES SOLICITADOS', color: 'error' },
  READY_FOR_PUBLICATION: { label: 'APROVADO', color: 'success' },
  PUBLISHED: { label: 'PUBLICADO', color: 'success' },
  ARCHIVED: { label: 'ARQUIVADO', color: 'default' },
};

export const AiLessonsReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useLessonDrafts({
    status: status || undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize,
    sort: 'updatedAt',
    order: 'DESC',
  });

  // Filtra apenas lições prontas para revisão (exclui lições em produção/rascunho)
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((lesson: Lesson) => {
      if (lesson.status === 'DRAFT' || lesson.status === 'IN_PROGRESS') {
        return false;
      }
      return [
        'PACKAGE_READY',
        'IN_REVIEW',
        'CHANGES_REQUESTED',
        'READY_FOR_PUBLICATION',
        'PUBLISHED',
      ].includes(lesson.status);
    });
  }, [data]);

  const listingFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: 'status',
        label: 'Status de revisão',
        value: status,
        options: STATUS_OPTIONS,
        onChange: (val) => {
          setStatus(val as string);
          setPage(1);
        },
      },
    ],
    [status]
  );

  const totalCount = data?.total ?? filteredItems.length;

  return (
    <Box sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 2, md: 3 } }}>
      <ListingLayout
        title="Revisão e Aprovação de Lições"
        summary="Área exclusiva para revisão criteriosa de cada item gerado e aprovação final. Ao aprovar todos os itens, a lição é enviada aos Materiais Semanais."
        toolbar={
          <ListingToolbar
            searchValue={search}
            searchPlaceholder="Buscar por tema ou referência bíblica..."
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            filters={listingFilters}
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
      >
        {filteredItems.map((item: Lesson) => {
          const approvedCount = item.stages?.filter((s) => s.status === 'APPROVED').length ?? 0;
          const totalStages = item.stages?.length ?? 8;
          const progress = totalStages > 0 ? (approvedCount / totalStages) * 100 : 0;
          const statusInfo = statusPresentation[item.status] ?? {
            label: item.status,
            color: 'default' as const,
          };

          return (
            <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ListingCard
                avatar={<ReviewIcon fontSize="small" />}
                title={`Semana ${item.weekNumber}: ${item.theme}`}
                subtitle={item.biblicalReference}
                accent={statusInfo.color}
                badges={[
                  {
                    label: statusInfo.label,
                    color: statusInfo.color,
                  },
                ]}
                meta={
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {item.biblicalReference}
                    </Typography>
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
                  </Stack>
                }
                actions={
                  <Button
                    fullWidth
                    variant={
                      item.status === 'READY_FOR_PUBLICATION' || item.status === 'PUBLISHED'
                        ? 'outlined'
                        : 'contained'
                    }
                    color={item.status === 'READY_FOR_PUBLICATION' ? 'success' : 'primary'}
                    endIcon={item.status === 'PUBLISHED' ? <ApprovedIcon /> : <ArrowIcon />}
                    onClick={() => navigate(`/adm/estudio/revisao/${item.id}`)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    {item.status === 'PUBLISHED'
                      ? 'Ver Lição Publicada'
                      : item.status === 'READY_FOR_PUBLICATION'
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
