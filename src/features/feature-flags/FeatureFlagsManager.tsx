import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {
  Button,
  Chip,
  Grid2,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';

import FeatureFlagFormDialog from './components/FeatureFlagFormDialog';
import FeatureFlagListCard from './components/FeatureFlagListCard';
import {
  FEATURE_FLAGS_PAGE_SIZE_OPTIONS,
  FEATURE_FLAG_AUDIENCE_FILTER_OPTIONS,
  FEATURE_FLAG_SORT_OPTIONS,
  FEATURE_FLAG_STATUS_OPTIONS,
} from './constants';
import { useFeatureFlagsContext } from './FeatureFlagsProvider';
import { useFeatureFlagMutations, useFeatureFlagsList } from './hooks';
import type { FeatureFlagFormValues, FeatureFlagResponse } from './types';
import { parseSortOption } from './utils';

/**
 * Painel de feature flags.
 *
 * Cada flag declara quem a enxerga — de "para todos" a qualquer combinação dos
 * três perfis —, e é essa escolha que a aplicação consulta em
 * `/feature-flags/map` para decidir o que mostrar a quem.
 */
export default function FeatureFlagsManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    items,
    total,
    stats,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    loading,
    error,
    setError,
    refresh,
  } = useFeatureFlagsList();

  // Mexer numa flag muda o que o resto da aplicação enxerga; recarregar o
  // mapa compartilhado evita que o menu e as rotas fiquem para trás até
  // alguém atualizar a página.
  const { refresh: refreshAppFlags } = useFeatureFlagsContext();

  const refreshAll = useCallback(async () => {
    refresh();
    await refreshAppFlags();
  }, [refresh, refreshAppFlags]);

  const {
    saving,
    actionError,
    setActionError,
    actionMessage,
    setActionMessage,
    save,
    toggle,
    remove,
    syncCatalog,
  } = useFeatureFlagMutations(refreshAll);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FeatureFlagResponse | null>(null);
  const [toDelete, setToDelete] = useState<FeatureFlagResponse | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((flag: FeatureFlagResponse) => {
    setEditing(flag);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (values: FeatureFlagFormValues) => save(values, editing?.key),
    [save, editing],
  );

  const handleDelete = useCallback(async () => {
    if (!toDelete) return;
    await remove(toDelete.key);
    setToDelete(null);
  }, [toDelete, remove]);

  const handleCopyKey = useCallback(
    (flag: FeatureFlagResponse) => {
      void navigator.clipboard
        .writeText(flag.key)
        .then(() => setActionMessage(`Chave "${flag.key}" copiada.`))
        .catch(() => setActionError('Não foi possível copiar a chave.'));
    },
    [setActionMessage, setActionError],
  );

  const dismissError = useCallback(() => {
    setError('');
    setActionError('');
  }, [setError, setActionError]);

  const listingFilters: ListingFilter[] = [
    {
      id: 'status',
      label: 'Situação',
      value: filters.status,
      options: [...FEATURE_FLAG_STATUS_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, status: value })),
    },
    {
      id: 'audience',
      label: 'Público',
      value: filters.audience,
      options: [...FEATURE_FLAG_AUDIENCE_FILTER_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, audience: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...FEATURE_FLAG_SORT_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, ...parseSortOption(value) })),
    },
  ];

  /*
   * No celular a ação principal ocupa a linha inteira e a conferência do
   * catálogo — operação rara de manutenção — fica embaixo, discreta. Duas
   * barras de 44px lado a lado não cabem numa tela de 320px sem truncar o
   * rótulo.
   */
  const actions = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ width: '100%' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openCreate}
        fullWidth
        sx={{
          minHeight: 44,
          textTransform: 'none',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          order: { xs: 0, md: 1 },
        }}
      >
        Nova flag
      </Button>

      <Tooltip title="Cria as flags de fábrica que faltam e apaga as aposentadas">
        <Button
          variant={isMobile ? 'text' : 'outlined'}
          size={isMobile ? 'small' : 'medium'}
          startIcon={<AutoFixHighIcon />}
          onClick={() => void syncCatalog()}
          disabled={saving}
          fullWidth
          sx={{
            minHeight: { xs: 36, md: 44 },
            textTransform: 'none',
            whiteSpace: 'nowrap',
            order: { xs: 1, md: 0 },
          }}
        >
          Conferir catálogo
        </Button>
      </Tooltip>
    </Stack>
  );

  /*
   * O resumo do acervo em cinco selos ocupa três linhas num celular, e empurra
   * a lista para fora da primeira tela. No celular fica a contagem essencial;
   * o recorte por público entra a partir do tablet.
   */
  const summary = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip size="small" label={`${stats.total} no total`} />
      <Chip size="small" color="success" label={`${stats.enabled} ligadas`} />
      <Chip size="small" label={`${stats.disabled} desligadas`} />
      <Chip
        size="small"
        variant="outlined"
        label={`${stats.byAudience.EVERYONE} para todos`}
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
      />
      <Chip
        size="small"
        variant="outlined"
        label={`${stats.byAudience.ADMIN} só admin`}
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
      />
    </Stack>
  );

  return (
    <ListingLayout
      title="Feature flags"
      summary={summary}
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por chave, nome ou descrição..."
          onSearchChange={setSearch}
          filters={listingFilters}
          onRefresh={refresh}
          action={actions}
        />
      }
      loading={loading}
      error={error || actionError}
      onDismissError={dismissError}
      itemCount={items.length}
      emptyTitle="Nenhuma feature flag encontrada"
      emptySubtitle="Ajuste a busca e os filtros, crie uma flag nova ou carregue as de fábrica."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={FEATURE_FLAGS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <FeatureFlagFormDialog
            open={formOpen}
            flag={editing}
            saving={saving}
            error={actionError}
            onDismissError={() => setActionError('')}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />

          <DeleteConfirmDialog
            open={Boolean(toDelete)}
            title={toDelete?.name}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
          />

          <Snackbar
            open={Boolean(actionMessage)}
            autoHideDuration={4000}
            onClose={() => setActionMessage('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setActionMessage('')}
            >
              {actionMessage}
            </Alert>
          </Snackbar>
        </>
      }
    >
      {items.map((flag) => (
        <Grid2 key={flag.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <FeatureFlagListCard
            flag={flag}
            disabled={saving}
            onToggle={(target) => void toggle(target.key)}
            onEdit={openEdit}
            onCopyKey={handleCopyKey}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
