import React, { useCallback, useMemo, useState } from 'react';
import {
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

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'IN_PROGRESS', label: 'Em produção' },
  { value: 'PACKAGE_READY', label: 'Pacote completo' },
  { value: 'IN_REVIEW', label: 'Em aprovação' },
  { value: 'CHANGES_REQUESTED', label: 'Ajustes solicitados' },
  { value: 'READY_FOR_PUBLICATION', label: 'Pronto p/ publicar' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'ARCHIVED', label: 'Arquivado' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt:DESC', label: 'Mais recentes primeiro' },
  { value: 'updatedAt:ASC', label: 'Mais antigas primeiro' },
  { value: 'weekNumber:ASC', label: 'Número da semana (1-52)' },
  { value: 'theme:ASC', label: 'Tema (A-Z)' },
];

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

const statusPresentation: Record<string, { label: string; color: ListingBadge['color'] }> = {
  DRAFT: { label: 'RASCUNHO', color: 'warning' },
  IN_PROGRESS: { label: 'EM PRODUÇÃO', color: 'info' },
  PACKAGE_READY: { label: 'PACOTE COMPLETO', color: 'info' },
  IN_REVIEW: { label: 'EM APROVAÇÃO', color: 'warning' },
  CHANGES_REQUESTED: { label: 'AJUSTES SOLICITADOS', color: 'error' },
  READY_FOR_PUBLICATION: { label: 'PRONTO PARA PUBLICAR', color: 'success' },
  PUBLISHED: { label: 'PUBLICADO', color: 'success' },
  ARCHIVED: { label: 'ARQUIVADO', color: 'default' },
};

function parseSortOption(value: string) {
  const [sort, order] = value.split(':');
  return { sort: sort || 'updatedAt', order: order || 'DESC' };
}

export const AiLessonsListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortOption, setSortOption] = useState('updatedAt:DESC');
  const [errorMsg, setErrorMsg] = useState('');

  const debouncedSearch = useDebouncedValue(search, 400);

  const queryParams = useMemo<GetLessonDraftsParams>(() => {
    const { sort, order } = parseSortOption(sortOption);
    return {
      status: status || undefined,
      search: debouncedSearch.trim() || undefined,
      page,
      limit: pageSize,
      sort,
      order,
    };
  }, [status, debouncedSearch, page, pageSize, sortOption]);

  const { data, isLoading, isError, refetch } = useLessonDrafts(queryParams);
  const deleteMutation = useDeleteLessonDraft();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleExportPdf = async (id: string, themeName: string) => {
    try {
      const blob = await aiLessonsService.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Licao_${themeName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao baixar PDF:', e);
      setErrorMsg('Não foi possível exportar o PDF desta lição.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      console.error('Erro ao excluir lição:', e);
      setErrorMsg('Não foi possível excluir a lição.');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setPage(1);
  };

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
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
                  (Semana {deleteTarget?.weekNumber})?
                </DialogContentText>
                <DialogContentText
                  color="error.main"
                  sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}
                >
                  ⚠️ Esta ação é irreversível. Todas as 8 etapas, versões geradas, comentários e
                  arquivos de imagem associados serão permanentemente removidos.
                </DialogContentText>
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
            ['PRODUCER_APPROVED', 'IN_REVIEW', 'APPROVED'].includes(stage.status)
          ).length;
          const totalStages = item.stages.length || 7;
          const progressPercent = Math.round((completed / totalStages) * 100);
          const presentation = statusPresentation[item.status] ?? statusPresentation.DRAFT;

          const badges: ListingBadge[] = [{ label: presentation.label, color: presentation.color }];

          const meta: ListingMeta[] = [
            {
              icon: <WeekIcon sx={{ fontSize: 16 }} />,
              label: `Semana ${item.weekNumber || 1}`,
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
                          aria-label={`Baixar PDF de ${item.theme}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleExportPdf(item.id, item.theme);
                          }}
                        >
                          <PdfIcon fontSize="small" />
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

                    <Tooltip title="Excluir Lição">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Excluir lição ${item.theme}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(item);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
