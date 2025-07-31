// src/modules/teachers/TeacherProfilesManager.tsx
import React from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import TeacherToolbar from "./components/TeacherToolbar";
import TeacherTable from "./components/TeacherTable";
import TeacherCards from "./components/TeacherCards";
import TeacherViewDialog from "./components/TeacherViewDialog";
import TeacherEditDialog from "./components/TeacherEditDialog";

import { useClubsIndex, useTeacherMutations, useTeacherProfiles } from "./hooks";
import { TeacherProfile } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

// mesmo shape usado pelo TeacherToolbar
export type TeacherFilters = {
  q?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
};

export default function TeacherProfilesManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // paginação/ordenação (server-side)
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState([{ id: "updatedAt", desc: true }]);

  // filtros (server-side) — no mesmo padrão do ClubsToolbar
  const [filters, setFilters] = React.useState<TeacherFilters>({
    q: "",
    active: undefined,
    hasClub: undefined,
    clubNumber: undefined,
  });

  // lista (server-side) usando filtros
  const { rows, total, loading, error, setError, fetchPage, refreshOne } =
    useTeacherProfiles(pageIndex, pageSize, sorting as any, {
      q: filters.q || undefined,
      searchString: undefined,
      active: filters.active,
      hasClub: filters.hasClub,
      clubNumber: filters.clubNumber,
    });

  const doRefresh = React.useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  // índice de clubs (para digitar número e mapear para UUID)
  const {
    byNumber,
    loading: clubsLoading,
    error: clubsError,
    refresh: refreshClubs,
  } = useClubsIndex();

  // mutations (assign/unassign) por teacherId + clubId
  const { dialogLoading, dialogError, setDialogError, setClub, clearClub } =
    useTeacherMutations(fetchPage, refreshOne);

  // dialogs
  const [viewing, setViewing] = React.useState<TeacherProfile | null>(null);
  const [editing, setEditing] = React.useState<TeacherProfile | null>(null);

  // ações
  const onSetClub = async (
    teacher: TeacherProfile | null,
    clubNumberInput: number
  ) => {
    if (!teacher || !clubNumberInput) return;
    const club = byNumber.get(clubNumberInput);
    if (!club) {
      setDialogError("Clube não encontrado pelo número informado.");
      return;
    }
    await setClub(teacher.id, club.id);
  };

  const onClearClub = async (teacherId: string) => {
    await clearClub(teacherId);
    if (editing?.id === teacherId)
      setEditing((e) => (e ? { ...e, club: null } : e));
  };

  // ao alterar filtros via toolbar, zerar página e deixar hook refazer o fetch
  const handleFiltersChange = React.useCallback(
    (updater: (prev: TeacherFilters) => TeacherFilters) => {
      setFilters((prev) => {
        const next = updater(prev);
        return next;
      });
      setPageIndex(0);
    },
    []
  );

  // corrige página quando total muda (ex.: filtro resulta em 0 itens)
  React.useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
    if (pageIndex > lastPage) setPageIndex(lastPage);
  }, [total, pageSize, pageIndex]);

  React.useEffect(() => {
    refreshClubs();
  }, [refreshClubs]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        minHeight: "100vh",
        bgcolor: "#f9fafb",
      }}
    >
      <BackHeader title="Gerenciador de Professores" />

      <TeacherToolbar
        filters={filters}
        onChange={handleFiltersChange}
        onRefreshClick={doRefresh}
        isXs={isXs}
      />

      {(loading && !rows.length) || clubsLoading ? (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      ) : null}

      {(error || clubsError) && !(loading || clubsLoading) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setError("");
            setDialogError("");
          }}
        >
          {error || clubsError}
        </Alert>
      )}

      {isXs ? (
        <TeacherCards
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting as any}
          setSorting={setSorting as any}
          onView={(t) => setViewing(t)}
          onEditLinks={(t) => setEditing(t)}
          onClearClub={(teacherId) => onClearClub(teacherId)}
        />
      ) : (
        <TeacherTable
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting as any}
          setSorting={setSorting as any}
          onView={(t) => setViewing(t)}
          onEditLinks={(t) => setEditing(t)}
          onClearClub={(teacherId) => onClearClub(teacherId)}
        />
      )}

      {/* View */}
      <TeacherViewDialog
        open={!!viewing}
        teacher={viewing}
        onClose={() => setViewing(null)}
      />

      {/* Edit vinculação de Clube */}
      <TeacherEditDialog
        open={!!editing}
        teacher={editing}
        loading={dialogLoading}
        error={dialogError}
        onSetClub={(num) => onSetClub(editing, num)}
        onClearClub={() => editing && onClearClub(editing.id)}
        onClose={() => {
          setEditing(null);
          setDialogError("");
        }}
      />
    </Box>
  );
}
