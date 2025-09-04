// src/features/pagela-teacher/ChildrenBrowserPage.tsx
import * as React from "react";
import {
  Box, Alert, Grid, Paper, TextField, InputAdornment,
  Typography, CircularProgress, Button, Fab, IconButton, Tooltip,
  useMediaQuery, useTheme
} from "@mui/material";
import { Search, PersonAdd, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useChildrenBrowser } from "./hooks";
import ChildCard from "./components/ChildCard";
import { CreateChildForm, EditChildForm, ChildResponseDto } from "../children/types";
import { useChildMutations } from "../children/hooks";
import ChildFormDialog from "../children/components/ChildFormDialog";
import { apiFetchChild } from "../children/api";

export default function ChildrenBrowserPage() {
  const nav = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const { items, loading, error, setError, refetch } = useChildrenBrowser();

  // filtro front
  const [query, setQuery] = React.useState("");

  const filteredItems = React.useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => {
      const name = c.name?.toLowerCase() ?? "";
      const gname = c.guardianName?.toLowerCase() ?? "";
      const gphone = c.guardianPhone?.toLowerCase() ?? "";
      return name.includes(s) || gname.includes(s) || gphone.includes(s);
    });
  }, [items, query]);

  // criar
  const [creating, setCreating] = React.useState<CreateChildForm | null>(null);

  // editar
  const [editing, setEditing] = React.useState<EditChildForm | null>(null);

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createChild,
    updateChild,
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
    } catch {}
  };

  // abrir edição (busca os dados completos do backend)
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
    } catch {}
  };

  React.useEffect(() => {
    document.title = "Lançar Pagela • Selecionar Criança";
  }, []);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 8, md: 4 }, // padding-top responsivo (removemos o mt)
        minHeight: "100vh",
        bgcolor: "#f6f7f9"
      }}
    >
      {/* Título + ação (com arrow só no mobile) */}
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
          {/* Arrow apenas no mobile */}
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

      {/* FAB no mobile */}
      <Fab
        color="primary"
        aria-label="Adicionar criança"
        onClick={openCreate}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: { xs: "flex", md: "none" },
          zIndex: 10,
        }}
      >
        <PersonAdd />
      </Fab>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: "#143a2b" }}>
          Selecionar Criança
        </Typography>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
        />
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
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {filteredItems.map((child) => (
            <Grid key={child.id} item xs={12} sm={6} md={4} lg={3} xl={2.4 as any}>
              <ChildCard
                child={child}
                onClick={(c) => nav(`/area-das-criancas/${c.id}`, { state: { child: c } })}
                onEdit={(c) => openEdit(c.id)} // habilita edição
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de criação */}
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

      {/* Dialog de edição */}
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
    </Box>
  );
}
