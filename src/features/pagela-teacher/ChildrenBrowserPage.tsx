import * as React from "react";
import {
  Box, Alert, Grid, Paper, TextField, InputAdornment,
  Typography, CircularProgress, Button, Fab, IconButton, Tooltip,
  useMediaQuery, useTheme, Pagination, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Search, PersonAdd, ArrowBack, FilterAltOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";

import { useChildrenBrowser } from "./hooks";
import ChildCard from "./components/ChildCard";
import { CreateChildForm, EditChildForm, ChildResponseDto } from "../children/types";
import { useChildMutations } from "../children/hooks";
import ChildFormDialog from "../children/components/ChildFormDialog";
import { apiFetchChild } from "../children/api";
import ToggleActiveConfirmDialog from "@/components/common/modal/ToggleActiveConfirmDialog";
import { ChildSimpleResponseDto } from "../children/types";
import { extractErrorMessage } from "@/utils/apiError";

export default function ChildrenBrowserPage() {
  const nav = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pageSize = isMobile ? 5 : 10;

  const user = useSelector((state: RootState) => (state.auth as any).user);
  const isAdmin = user?.role === UserRole.ADMIN;

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

  const [creating, setCreating] = React.useState<CreateChildForm | null>(null);
  const [editing, setEditing] = React.useState<EditChildForm | null>(null);
  const [confirmToggleActive, setConfirmToggleActive] = React.useState<ChildSimpleResponseDto | null>(null);

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createChild,
    updateChild,
    toggleActive,
  } = useChildMutations(async () => {
    await refetch();
  });

  const openCreate = () =>
    setCreating({
      name: "",
      gender: "M",
      guardianName: "",
      guardianPhone: "",
      birthDate: "",
      joinedAt: null,
      clubId: null,
      address: { street: "", district: "", city: "", state: "", postalCode: "" } as any,
    });

  const submitCreate = async () => {
    if (!creating) return;
    const payload = { ...creating };
    if (!payload.joinedAt) payload.joinedAt = null;
    if (!payload.clubId) payload.clubId = null as any;

    try {
      await createChild(payload, 1, 12);
      setCreating(null);
      setDialogError("");
    } catch { }
  };

  const openEdit = async (childId: string) => {
    try {
      const full: ChildResponseDto = await apiFetchChild(childId);
      setEditing({
        id: full.id,
        name: full.name ?? "",
        gender: (full.gender as any) ?? "M",
        guardianName: full.guardianName ?? "",
        guardianPhone: full.guardianPhone ?? "",
        birthDate: full.birthDate ?? "",
        joinedAt: (full as any).joinedAt ?? null,
        clubId: (full as any)?.club?.id ?? null,
        address: full.address
          ? {
            street: full.address.street ?? "",
            number: (full.address as any).number ?? "",
            district: full.address.district ?? "",
            city: full.address.city ?? "",
            state: full.address.state ?? "",
            postalCode: full.address.postalCode ?? "",
            complement: (full.address as any).complement ?? "",
          }
          : { street: "", number: "", district: "", city: "", state: "", postalCode: "", complement: "" } as any,
      });
      setDialogError("");
    } catch (e: any) {
      setDialogError(e?.response?.data?.message || e?.message || "Não foi possível abrir a criança para edição");
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    try {
      await updateChild(id, rest, 1, 12);
      setEditing(null);
      setDialogError("");
    } catch { }
  };

  React.useEffect(() => {
    document.title = "Lançar Pagela • Selecionar Criança";
  }, []);

  return (
    <Box
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
      ) : (
        <>
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
            {items.map((child) => (
              <Grid key={child.id} item xs={12} sm={6} md={4} lg={3} xl={2.4 as any}>
                <ChildCard
                  child={child}
                  onClick={(c) => nav(`/area-das-criancas/${c.id}`, { state: { child: c } })}
                  onEdit={(c) => openEdit(c.id)}
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
        onChange={(v) => setCreating(v as CreateChildForm)}
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
        onChange={(v) => setEditing(v as EditChildForm)}
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onSubmit={submitEdit}
        error={dialogError}
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
            await toggleActive(fullChild.id, 1, 20, undefined, undefined);
            await refetch();
            setConfirmToggleActive(null);
          } catch (err: unknown) {
            setDialogError(extractErrorMessage(err, "Erro ao alterar status da criança"));
          }
        }}
        loading={dialogLoading}
      />
    </Box >
  );
}
