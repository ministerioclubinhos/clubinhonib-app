import * as React from "react";
import {
  Box, Alert, Grid, Paper, TextField, InputAdornment,
  Typography, CircularProgress, Button, Fab, IconButton, Tooltip,
  useMediaQuery, useTheme, Pagination, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Search, PersonAdd, ArrowBack, FilterAltOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useChildrenBrowser } from "./hooks";
import ChildCard from "./components/ChildCard";
import type { ChildFormValues, ChildResponse, ChildListItem } from "../children/types";
import { childToForm, emptyChildForm } from "../children/utils";
import { useChildMutations } from "../children/hooks";
import ChildFormDialog from "../children/components/ChildFormDialog";
import { apiFetchChild } from "../children/api";
import ToggleActiveConfirmDialog from "@/components/common/modal/ToggleActiveConfirmDialog";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { extractErrorMessage } from "@/utils/apiError";

export default function ChildrenBrowserPage() {
  const nav = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pageSize = isMobile ? 5 : 10;

  const {
    searchString,
    setSearchString,
    isActiveFilter,
    setIsActiveFilter,
    acceptedChristFilter,
    setAcceptedChristFilter,
    items,
    loading,
    error,
    setError,
    refetch,
    page,
    totalPages,
    totalItems,
    handlePageChange,
  } = useChildrenBrowser(pageSize);

  const [creating, setCreating] = React.useState<ChildFormValues | null>(null);
  const [editing, setEditing] = React.useState<ChildFormValues | null>(null);
  const [confirmToggleActive, setConfirmToggleActive] = React.useState<ChildListItem | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<ChildListItem | null>(null);

  const {
    actionLoading: dialogLoading,
    actionError: dialogError,
    setActionError: setDialogError,
    createChild,
    updateChild,
    deleteChild,
    toggleActive,
  } = useChildMutations(() => {
    void refetch();
  });

  const openCreate = () => setCreating(emptyChildForm());

  const submitCreate = async () => {
    if (!creating) return;

    const ok = await createChild(creating);
    if (ok) {
      enqueueSnackbar("Criança cadastrada com sucesso!", { variant: "success" });
      setCreating(null);
      setDialogError("");
    }
  };

  const openEdit = async (childId: string) => {
    try {
      const full: ChildResponse = await apiFetchChild(childId);
      setEditing(childToForm(full));
      setDialogError("");
    } catch (err: unknown) {
      setDialogError(
        extractErrorMessage(
          err,
          "Não foi possível abrir a criança para edição",
        ),
      );
    }
  };

  const submitEdit = async () => {
    if (!editing?.id) return;

    const ok = await updateChild(editing.id, editing);
    if (ok) {
      enqueueSnackbar("Criança atualizada com sucesso!", { variant: "success" });
      setEditing(null);
      setDialogError("");
    }
  };

  const submitDelete = async () => {
    if (!confirmDelete) return;
    const ok = await deleteChild(confirmDelete.id);
    if (ok) {
      enqueueSnackbar("Criança excluída com sucesso!", { variant: "success" });
      setConfirmDelete(null);
      setDialogError("");
    }
  };

  React.useEffect(() => {
    document.title = "Lançar Pagela • Selecionar Criança";
  }, []);

  return (
    <Box data-testid="pagela-teacher-children-browser-page"
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 },
        pb: { xs: 2, md: 4 },
        minHeight: "100vh",
        bgcolor: "#f6f7f9"
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          {isXs && (
            <Tooltip title="Voltar">
              <IconButton
                onClick={() => nav(-1)}
                aria-label="Voltar para a página anterior"
                sx={{
                  mr: 0.5,
                  bgcolor: "white",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}

          <Typography
            component="h1"
            variant="h5"
            fontWeight={900}
            sx={{ color: "#143a2b", fontSize: { xs: "1.25rem", md: "1.75rem" } }}
          >
            Área das crianças
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            Toque em uma criança para abrir suas pagelas
          </Typography>
        </Box>

        <Button
          onClick={openCreate}
          startIcon={<PersonAdd />}
          variant="contained"
          sx={{ display: { xs: "none", md: "inline-flex" } }}
        >
          Adicionar criança
        </Button>
      </Box>

      <Fab
        color="primary"
        aria-label="Adicionar criança"
        onClick={openCreate}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: { xs: "flex", md: "none" },
          zIndex: 1300,
        }}
      >
        <PersonAdd />
      </Fab>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h6" fontWeight={900} sx={{ mb: 2, color: "#143a2b" }}>
          Selecionar Criança {totalItems > 0 && `(${totalItems})`}
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 2
        }}>
          <TextField
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            size="small"
            fullWidth
            placeholder="Buscar por nome ou telefone do responsável…"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { md: 1 } }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
              onChange={(e) => {
                const val = e.target.value;
                setIsActiveFilter(val === 'all' ? undefined : val === 'active');
              }}
              label="Status"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="active">Ativas</MenuItem>
              <MenuItem value="inactive">Desativadas</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel>Decisão</InputLabel>
            <Select
              value={acceptedChristFilter === undefined ? 'all' : acceptedChristFilter ? 'accepted' : 'not_accepted'}
              onChange={(e) => {
                const val = e.target.value;
                setAcceptedChristFilter(val === 'all' ? undefined : val === 'accepted');
              }}
              label="Decisão"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="accepted">Aceitaram Cristo</MenuItem>
              <MenuItem value="not_accepted">Não Aceitaram</MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={() => {
              setSearchString("");
              setIsActiveFilter(undefined);
              setAcceptedChristFilter(undefined);
            }}
            disabled={!searchString && isActiveFilter === undefined && acceptedChristFilter === undefined}
            startIcon={<FilterAltOff />}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', md: 'auto' } }}
          >
            Limpar Filtros
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading && !items.length ? (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight={700}>
            Nenhuma criança encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tente alterar os termos da busca ou ajustar os filtros selecionados.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
            {items.map((child) => (
              <Grid key={child.id} item xs={12} sm={6} md={4} lg={3} xl={2.4}>
                <ChildCard
                  child={child}
                  onClick={(c) => nav(`/area-das-criancas/${c.id}`, { state: { child: c } })}
                  onEdit={(c) => openEdit(c.id)}
                  onDelete={(c) => setConfirmDelete(c)}
                  onRefresh={refetch}
                  onToggleActive={(c) => {
                    setConfirmToggleActive(c);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => handlePageChange(newPage)}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      <ChildFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={setCreating}
        onCancel={() => {
          setCreating(null);
          setDialogError("");
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
      />

      <ChildFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={setEditing}
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.name || ""}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError("");
        }}
        onConfirm={submitDelete}
        loading={dialogLoading}
      />

      <ToggleActiveConfirmDialog
        open={!!confirmToggleActive}
        title={confirmToggleActive?.name || ""}
        isActive={confirmToggleActive?.isActive ?? false}
        onClose={() => {
          setConfirmToggleActive(null);
          setDialogError("");
        }}
        onConfirm={async () => {
          if (!confirmToggleActive) return;

          try {
            const fullChild = await apiFetchChild(confirmToggleActive.id);
            const ok = await toggleActive(fullChild.id);
            if (ok) {
              enqueueSnackbar(
                confirmToggleActive.isActive
                  ? "Criança desativada com sucesso"
                  : "Criança ativada com sucesso",
                { variant: "info" }
              );
              setConfirmToggleActive(null);
              setDialogError("");
              await refetch();
            }
          } catch (err: unknown) {
            setDialogError(extractErrorMessage(err, "Erro ao alterar status da criança"));
          }
        }}
        loading={dialogLoading}
      />
    </Box>
  );
}
