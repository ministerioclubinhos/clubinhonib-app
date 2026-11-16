import * as React from "react";
import {
  Badge, Box, Alert, Collapse, Grid, Paper, TextField, InputAdornment,
  Typography, CircularProgress, Button, IconButton,
  useMediaQuery, useTheme, Pagination, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Search, PersonAdd, ArrowBack, FilterAltOff, FilterList } from "@mui/icons-material";
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
import { ToggleActiveSubject } from "@/components/common/modal/types";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { useAuthRole } from "@/utils/useAuthRole";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  CHILDREN_BROWSER_PAGE_TITLE,
  CHILDREN_BROWSER_TEXTS,
  CHILDREN_PAGE_SIZE,
} from "./constants";

export default function ChildrenBrowserPage() {
  // Professor e coordenador não excluem criança: desativar é a operação deles.
  const { isAdmin } = useAuthRole();

  const nav = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  // `noSsr` dá a resposta certa já na primeira renderização: sem ele a tela
  // buscava a página do computador e, logo em seguida, a do celular.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const pageSize = isMobile ? CHILDREN_PAGE_SIZE.mobile : CHILDREN_PAGE_SIZE.desktop;
  const [showFilters, setShowFilters] = React.useState(false);

  const {
    searchString,
    setSearchString,
    isActiveFilter,
    setIsActiveFilter,
    acceptedChristFilter,
    setAcceptedChristFilter,
    clearFilters,
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

  // O aviso global do cliente HTTP já mostra a falha de excluir, ativar e
  // desativar. O erro guardado aqui é o do formulário, e é limpo ao abrir um
  // novo para a mensagem de uma ação anterior não reaparecer nele.
  const openCreate = () => {
    setDialogError("");
    setCreating(emptyChildForm());
  };

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
      // O aviso global já mostrou a falha; o formulário não chega a abrir.
      void err;
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

  useDocumentTitle(CHILDREN_BROWSER_PAGE_TITLE);

  // Quantos filtros estão valendo, incluindo a busca digitada.
  const activeFilters =
    (searchString ? 1 : 0) +
    (isActiveFilter !== undefined ? 1 : 0) +
    (acceptedChristFilter !== undefined ? 1 : 0);

  return (
    <Box data-testid="pagela-teacher-children-browser-page"
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 },
        // Folga para o botão flutuante não cobrir a paginação no celular.
        pb: { xs: 12, md: 4 },
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          {isMobile && (
            <IconButton
              onClick={() => nav(-1)}
              aria-label="Voltar para a página anterior"
              sx={{
                width: 44,
                height: 44,
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <ArrowBack />
            </IconButton>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              variant="h5"
              fontWeight={900}
              noWrap
              sx={{ color: "#143a2b", fontSize: { xs: "1.1rem", md: "1.75rem" } }}
            >
              {CHILDREN_BROWSER_TEXTS.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              {CHILDREN_BROWSER_TEXTS.hint}
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={openCreate}
          startIcon={<PersonAdd />}
          variant="contained"
          aria-label={CHILDREN_BROWSER_TEXTS.addChild}
          data-testid="children-browser-add-button"
          sx={{ minHeight: 44, fontWeight: 800, flexShrink: 0 }}
        >
          {isMobile ? CHILDREN_BROWSER_TEXTS.addChildShort : CHILDREN_BROWSER_TEXTS.addChild}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1.5, color: "#143a2b" }}>
          Selecionar criança {totalItems > 0 && `(${totalItems})`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            mb: { xs: showFilters ? 1.5 : 0, md: 2 },
          }}
        >
          <TextField
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            size="small"
            fullWidth
            placeholder={CHILDREN_BROWSER_TEXTS.search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          {isMobile && (
            <IconButton
              onClick={() => setShowFilters((v) => !v)}
              aria-label={CHILDREN_BROWSER_TEXTS.filters}
              aria-expanded={showFilters}
              data-testid="children-browser-filters-toggle"
              sx={{ width: 44, height: 44, border: "1px solid", borderColor: "divider" }}
            >
              <Badge color="primary" badgeContent={activeFilters} invisible={!activeFilters}>
                <FilterList />
              </Badge>
            </IconButton>
          )}
        </Box>

        <Collapse in={!isMobile || showFilters}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 180 } }}>
              <InputLabel id="children-status-label">Status</InputLabel>
              <Select
                labelId="children-status-label"
                value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"}
                onChange={(e) => {
                  const val = e.target.value;
                  setIsActiveFilter(val === "all" ? undefined : val === "active");
                }}
                label="Status"
              >
                <MenuItem value="all" sx={{ minHeight: 44 }}>Todas</MenuItem>
                <MenuItem value="active" sx={{ minHeight: 44 }}>Ativas</MenuItem>
                <MenuItem value="inactive" sx={{ minHeight: 44 }}>Desativadas</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 200 } }}>
              <InputLabel id="children-decision-label">Decisão</InputLabel>
              <Select
                labelId="children-decision-label"
                value={acceptedChristFilter === undefined ? "all" : acceptedChristFilter ? "accepted" : "not_accepted"}
                onChange={(e) => {
                  const val = e.target.value;
                  setAcceptedChristFilter(val === "all" ? undefined : val === "accepted");
                }}
                label="Decisão"
              >
                <MenuItem value="all" sx={{ minHeight: 44 }}>Todas</MenuItem>
                <MenuItem value="accepted" sx={{ minHeight: 44 }}>Aceitaram Cristo</MenuItem>
                <MenuItem value="not_accepted" sx={{ minHeight: 44 }}>Não Aceitaram</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={clearFilters}
              disabled={activeFilters === 0}
              startIcon={<FilterAltOff />}
              variant="outlined"
              data-testid="children-browser-clear-filters"
              sx={{ minHeight: 44, minWidth: { xs: "100%", md: "auto" } }}
            >
              {CHILDREN_BROWSER_TEXTS.clearFilters}
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading && !items.length ? (
        <Box textAlign="center" my={6} data-testid="children-browser-loading">
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper
          elevation={0}
          data-testid="children-browser-empty"
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
            {CHILDREN_BROWSER_TEXTS.empty}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {CHILDREN_BROWSER_TEXTS.emptyHint}
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
                  onDelete={isAdmin ? (c) => setConfirmDelete(c) : undefined}
                  onRefresh={refetch}
                  onToggleActive={(c) => {
                    setConfirmToggleActive(c);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, md: 4 } }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => handlePageChange(newPage)}
                color="primary"
                size={isMobile ? "small" : "medium"}
                siblingCount={isMobile ? 0 : 1}
                showFirstButton={!isMobile}
                showLastButton={!isMobile}
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
            subject={ToggleActiveSubject.Child}
        open={!!confirmToggleActive}
        title={confirmToggleActive?.name || ""}
        isActive={confirmToggleActive?.isActive ?? false}
        onClose={() => {
          setConfirmToggleActive(null);
          setDialogError("");
        }}
        onConfirm={async () => {
          if (!confirmToggleActive) return;

          // A rota inverte a situação no servidor: um segundo toque enquanto
          // a primeira chamada anda desfaria a troca.
          if (dialogLoading) return;
          const wasActive = confirmToggleActive.isActive;
          const ok = await toggleActive(confirmToggleActive.id);
          if (ok) {
            enqueueSnackbar(
              wasActive
                ? "Criança desativada com sucesso"
                : "Criança ativada com sucesso",
              { variant: "info" }
            );
            setConfirmToggleActive(null);
            setDialogError("");
          }
        }}
        loading={dialogLoading}
      />
    </Box>
  );
}
