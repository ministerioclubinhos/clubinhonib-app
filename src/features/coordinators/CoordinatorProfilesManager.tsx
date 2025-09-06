import React from "react";
import {
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import type { SortingState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import CoordinatorToolbar from "./components/CoordinatorToolbar";
import CoordinatorTable from "./components/CoordinatorTable";
import CoordinatorCards from "./components/CoordinatorCards";
import CoordinatorViewDialog from "./components/CoordinatorViewDialog";
import CoordinatorLinkDialog from "./components/CoordinatorLinkDialog";
import {
  useCoordinatorMutations,
  useCoordinatorProfiles,
  useClubsIndex,
} from "./hooks";
import type { CoordinatorFilters, CoordinatorProfile } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export default function CoordinatorProfilesManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [filters, setFilters] = React.useState<CoordinatorFilters>({
    searchString: "",
    active: "all",
    hasClubs: "all",
    clubNumber: "",
  });

  const { rows, total, loading, error, setError, fetchPage, refreshOne } =
    useCoordinatorProfiles(pageIndex, pageSize, sorting, filters);

  const doRefresh = React.useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const {
    byNumber,
    loading: clubsLoading,
    error: clubsError,
    refresh: refreshClubs,
  } = useClubsIndex();

  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const showSnack = React.useCallback(
    (message: string, severity: typeof snack.severity = "success") => {
      setSnack({ open: true, message, severity });
    },
    []
  );

  const closeSnack = (_?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const [viewing, setViewing] = React.useState<CoordinatorProfile | null>(null);
  const [linking, setLinking] = React.useState<CoordinatorProfile | null>(null);
  const [linkNumber, setLinkNumber] = React.useState<string>("");
  const [unlinkNumber, setUnlinkNumber] = React.useState<string>("");

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    assignClub,
    unassignClub,
  } = useCoordinatorMutations(fetchPage, refreshOne);

  const closeLinkDialog = React.useCallback(() => {
    setLinking(null);
    setDialogError("");
    setLinkNumber("");
    setUnlinkNumber("");
  }, [setDialogError]);

  const onLinkConfirm = async () => {
    if (!linking?.id || !linkNumber) return;
    const num = Number(linkNumber);
    const club = byNumber.get(num);
    if (!num || !club) {
      setDialogError("Clubinho não encontrado pelo número informado.");
      return;
    }
    try {
      const msg = await assignClub(linking.id, club.id);
      showSnack(msg || "Club atribuído ao coordenador com sucesso", "success");
      closeLinkDialog(); 
    } catch {
      showSnack("Falha ao vincular clubinho", "error");
    }
  };

  const onUnlinkConfirm = async () => {
    if (!linking?.id || !unlinkNumber) return;
    const num = Number(unlinkNumber);
    const club = byNumber.get(num);
    if (!num || !club) {
      setDialogError("Clubinho não encontrado pelo número informado.");
      return;
    }
    try {
      const msg = await unassignClub(linking.id, club.id);
      showSnack(msg || "Club removido do coordenador com sucesso", "success");
      closeLinkDialog();
    } catch {
      showSnack("Falha ao desvincular clubinho", "error");
    }
  };

  React.useEffect(() => {
    doRefresh();
  }, [doRefresh]);
  React.useEffect(() => {
    refreshClubs();
  }, [refreshClubs]);

  return (
    <Box sx={{
      px: { xs: 2, sm: 2, md: 4 },
      py: { xs: 0, md: 4 },
      minHeight: "100vh", bgcolor: "#f9fafb"
    }}>
      <BackHeader title="Gerenciar Coordenadores" />
      <CoordinatorToolbar
        filters={filters}
        onChange={(updater) => {
          setFilters(updater);
          setPageIndex(0);
        }}
        onRefresh={doRefresh}
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
        <CoordinatorCards
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting}
          setSorting={setSorting}
          onView={(c) => setViewing(c)}
          onLink={(c) => setLinking(c)}
        />
      ) : (
        <CoordinatorTable
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting}
          setSorting={setSorting}
          onView={(c) => setViewing(c)}
          onLink={(c) => setLinking(c)}
        />
      )}

      <CoordinatorViewDialog
        open={!!viewing}
        coordinator={viewing}
        onClose={() => setViewing(null)}
      />

      <CoordinatorLinkDialog
        open={!!linking}
        coordinator={linking}
        linkNumber={linkNumber}
        unlinkNumber={unlinkNumber}
        onChangeLink={setLinkNumber}
        onChangeUnlink={setUnlinkNumber}
        onLink={onLinkConfirm}
        onUnlink={onUnlinkConfirm}
        loading={dialogLoading}
        error={dialogError}
        onClose={closeLinkDialog}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snack.severity}
          onClose={closeSnack}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
