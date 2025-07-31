// src/features/pagela-teacher/components/PagelaList.tsx
import * as React from "react";
import {
  Grid,
  Pagination,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PagelaCard from "./PagelaCard";
import type { Pagela } from "../types";

type Tri = "any" | "yes" | "no";

const matchTri = (value: boolean, tri: Tri) =>
  tri === "any" ? true : tri === "yes" ? value : !value;

export default function PagelaList({
  rows,
  total,
  page,
  limit,
  setPage,
  onEdit,
  onDelete,
}: {
  rows: Pagela[];
  total: number;
  page: number;
  limit: number;
  setPage: (p: number) => void;
  onEdit: (r: Pagela) => void;
  onDelete: (r: Pagela) => void;
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // --- filtros de front ---
  const [yearQ, setYearQ] = React.useState<number | "any">("any");
  const [weekQ, setWeekQ] = React.useState<number | "">("");
  const [fPresent, setFPresent] = React.useState<Tri>("any");
  const [fMed, setFMed] = React.useState<Tri>("any");
  const [fVerse, setFVerse] = React.useState<Tri>("any");

  // anos únicos presentes nesta lista (dinâmico)
  const years = React.useMemo(() => {
    const s = new Set<number>();
    rows.forEach((r) => s.add(r.year));
    return Array.from(s).sort((a, b) => b - a);
  }, [rows]);

  const hasAny =
    yearQ !== "any" || weekQ !== "" || fPresent !== "any" || fMed !== "any" || fVerse !== "any";

  const filteredRows = React.useMemo(() => {
    return rows.filter((r) => {
      const yearOk = yearQ === "any" || r.year === yearQ;
      const weekOk = weekQ === "" || r.week === Number(weekQ);
      const presentOk = matchTri(!!r.present, fPresent);
      const medOk = matchTri(!!r.didMeditation, fMed);
      const verseOk = matchTri(!!r.recitedVerse, fVerse);
      return yearOk && weekOk && presentOk && medOk && verseOk;
    });
  }, [rows, yearQ, weekQ, fPresent, fMed, fVerse]);

  // paginação do servidor (inalterada)
  const pages = Math.max(1, Math.ceil(total / limit));

  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem registros para a busca.
      </Typography>
    );
    }

  return (
    <Stack spacing={1.75}>
      {/* Barra de filtros — responsiva e compacta */}
      <Box
        sx={{
          display: "grid",
          gap: 1,
          pt: 1, // espaço pro label flutuante não ser cortado
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(5, minmax(140px, 1fr))", // Ano + Semana + 3 selects
          },
          alignItems: "center",
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        {/* Ano (select dinâmico) */}
        <FormControl
          size="small"
          margin="dense"
          fullWidth
          sx={{ minWidth: 0, width: "100%" }}
        >
          <InputLabel>Ano</InputLabel>
          <Select
            label="Ano"
            value={yearQ}
            onChange={(e) => setYearQ(e.target.value as number | "any")}
          >
            <MenuItem value="any">
              <AllInclusiveIcon fontSize="small" style={{ marginRight: 8 }} />
              Todos
            </MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                <CalendarMonthIcon fontSize="small" style={{ marginRight: 8 }} />
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Semana (número) */}
        <TextField
          label="Semana"
          margin="dense"
          size="small"
          type="number"
          value={weekQ}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setWeekQ("");
            const n = Number(v);
            setWeekQ(Number.isFinite(n) ? Math.max(1, Math.min(53, n)) : "");
          }}
          inputProps={{ min: 1, max: 53, inputMode: "numeric", pattern: "[0-9]*" }}
          sx={{ width: { xs: "100%", sm: "100%" } }}
        />

        {/* Presença */}
        <FormControl
          size="small"
          margin="dense"
          fullWidth
          sx={{ minWidth: 0, width: "100%" }}
        >
          <InputLabel>Presença</InputLabel>
          <Select
            label="Presença"
            value={fPresent}
            onChange={(e) => setFPresent(e.target.value as Tri)}
          >
            <MenuItem value="any">
              <AllInclusiveIcon fontSize="small" style={{ marginRight: 8 }} />
              Qualquer
            </MenuItem>
            <MenuItem value="yes">
              <CheckCircleIcon fontSize="small" style={{ marginRight: 8 }} />
              Sim
            </MenuItem>
            <MenuItem value="no">
              <HighlightOffIcon fontSize="small" style={{ marginRight: 8 }} />
              Não
            </MenuItem>
          </Select>
        </FormControl>

        {/* Meditação */}
        <FormControl
          size="small"
          margin="dense"
          fullWidth
          sx={{ minWidth: 0, width: "100%" }}
        >
          <InputLabel>Meditação</InputLabel>
          <Select
            label="Meditação"
            value={fMed}
            onChange={(e) => setFMed(e.target.value as Tri)}
          >
            <MenuItem value="any">
              <AllInclusiveIcon fontSize="small" style={{ marginRight: 8 }} />
              Qualquer
            </MenuItem>
            <MenuItem value="yes">
              <CheckCircleIcon fontSize="small" style={{ marginRight: 8 }} />
              Sim
            </MenuItem>
            <MenuItem value="no">
              <HighlightOffIcon fontSize="small" style={{ marginRight: 8 }} />
              Não
            </MenuItem>
          </Select>
        </FormControl>

        {/* Versículo */}
        <FormControl
          size="small"
          margin="dense"
          fullWidth
          sx={{ minWidth: 0, width: "100%" }}
        >
          <InputLabel>Versículo</InputLabel>
          <Select
            label="Versículo"
            value={fVerse}
            onChange={(e) => setFVerse(e.target.value as Tri)}
          >
            <MenuItem value="any">
              <AllInclusiveIcon fontSize="small" style={{ marginRight: 8 }} />
              Qualquer
            </MenuItem>
            <MenuItem value="yes">
              <CheckCircleIcon fontSize="small" style={{ marginRight: 8 }} />
              Sim
            </MenuItem>
            <MenuItem value="no">
              <HighlightOffIcon fontSize="small" style={{ marginRight: 8 }} />
              Não
            </MenuItem>
          </Select>
        </FormControl>

        {/* Botão limpar — linha própria no xs, à direita no sm+ */}
        <Box
          sx={{
            gridColumn: { xs: "1 / -1", sm: "auto" },
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {hasAny && (
            <Button
              onClick={() => {
                setYearQ("any");
                setWeekQ("");
                setFPresent("any");
                setFMed("any");
                setFVerse("any");
              }}
              size="small"
              variant="text"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Limpar filtros
            </Button>
          )}
        </Box>
      </Box>

      {/* Lista */}
      <Grid container spacing={{ xs: 1, sm: 1.25, md: 1.5 }}>
        {filteredRows.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4} lg={4}>
            <PagelaCard row={r} onEdit={onEdit} onDelete={onDelete} />
          </Grid>
        ))}
        {filteredRows.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Nenhum item corresponde aos filtros aplicados nesta página.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Paginação do servidor */}
      <Stack direction="row" justifyContent="center">
        <Pagination
          count={pages}
          page={page}
          onChange={(_, p) => setPage(p)}
          size={isXs ? "small" : "medium"}
          color="primary"
        />
      </Stack>
    </Stack>
  );
}
