import React from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import TeacherToolbar from "./components/TeacherToolbar";
import TeacherTable from "./components/TeacherTable";
import TeacherCards from "./components/TeacherCards";
import TeacherViewDialog from "./components/TeacherViewDialog";
import TeacherEditDialog from "./components/TeacherEditDialog";

import { useClubsIndex, useTeacherMutations, useTeacherProfiles } from "./hooks";
import { TeacherProfile } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export type TeacherFilters = {
  q?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
};

export default function TeacherProfilesManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState([{ id: "updatedAt", desc: true }]);

  const [filters, setFilters] = React.useState<TeacherFilters>({
    q: "",
    active: undefined,
    hasClub: undefined,
    clubNumber: undefined,
  });

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

  const {
    byNumber,
    loading: clubsLoading,
    error: clubsError,
    refresh: refreshClubs,
  } = useClubsIndex();

  const { dialogLoading, dialogError, setDialogError, setClub, clearClub } =
    useTeacherMutations(fetchPage, refreshOne);

  const [viewing, setViewing] = React.useState<TeacherProfile | null>(null);
  const [editing, setEditing] = React.useState<TeacherProfile | null>(null);

  const onSetClub = React.useCallback(
    async (teacher: TeacherProfile | null, clubNumberInput: number) => {
      if (!teacher || !clubNumberInput) return;
      const club = byNumber.get(clubNumberInput);
      if (!club) {
        setDialogError("Clubinho não encontrado pelo número informado.");
        return;
      }
      try {
        await setClub(teacher.id, club.id);
        // fechar modal e atualizar listas
        setEditing(null);
        setDialogError("");
        await Promise.all([fetchPage(), refreshClubs()]);
      } catch {
        // mantém o modal aberto e exibe o erro já setado por setClub()
      }
    },
    [byNumber, setClub, fetchPage, refreshClubs, setDialogError]
  );

  const onClearClub = React.useCallback(
    async (teacherId: string) => {
      try {
        await clearClub(teacherId);
        // fechar modal (se era o mesmo teacher) e atualizar listas
        setEditing((e) => (e?.id === teacherId ? null : e));
        setDialogError("");
        await Promise.all([fetchPage(), refreshClubs()]);
      } catch {
        // mantém o modal aberto e exibe o erro já setado por clearClub()
      }
    },
    [clearClub, fetchPage, refreshClubs, setDialogError]
  );

  const handleFiltersChange = React.useCallback(
    (updater: (prev: TeacherFilters) => TeacherFilters) => {
      setFilters((prev) => updater(prev));
      setPageIndex(0);
    },
    []
  );

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
        px: { xs: 2, md: 0 },
        py: { xs: 0, md: 0 },
        minHeight: "100vh",
        bgcolor: "#f9fafb"
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

      <TeacherViewDialog
        open={!!viewing}
        teacher={viewing}
        onClose={() => setViewing(null)}
      />

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
