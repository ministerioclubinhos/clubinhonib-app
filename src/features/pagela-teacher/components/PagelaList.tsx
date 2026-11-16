import * as React from "react";
import {
  Badge,
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import PagelaCard from "./PagelaCard";
import type { Pagela } from "../types";
import type { Tri } from "../hooks";
import {
  PAGELA_EDITOR_TEXTS,
  PAGELA_FILTER_WEEK_DIGITS,
  PAGELA_FILTER_YEAR_DIGITS,
} from "../constants";
import { parseWeekFilter, parseYearFilter } from "../utils";

type FiltersProps = {
  year?: number;
  week?: number;
  presentQ: Tri;
  medQ: Tri;
  verseQ: Tri;
  setYear: (v?: number) => void;
  setWeek: (v?: number) => void;
  setPresentQ: (v: Tri) => void;
  setMedQ: (v: Tri) => void;
  setVerseQ: (v: Tri) => void;
  clearFilters: () => void;
};

const TRI_OPTIONS: ReadonlyArray<{ value: Tri; label: string }> = [
  { value: "any", label: "Qualquer" },
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
];

function TriSelect({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: Tri;
  onChange: (v: Tri) => void;
  testId: string;
}) {
  return (
    <FormControl
      size="small"
      fullWidth
      data-testid={`${testId}-control`}
      sx={{ minWidth: 0 }}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as Tri)}
        data-testid={testId}
      >
        {TRI_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ minHeight: 44 }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function PagelaList({
  rows,
  total,
  page,
  limit,
  setPage,
  filters,
  onEdit,
  onDelete,
  canEdit = true,
}: {
  rows: Pagela[];
  total: number;
  page: number;
  limit: number;
  setPage: (p: number) => void;
  filters: FiltersProps;
  canEdit?: boolean;
  onEdit: (r: Pagela) => void;
  onDelete: (r: Pagela) => Promise<void>;
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const activeCount =
    (filters.year !== undefined ? 1 : 0) +
    (filters.week !== undefined ? 1 : 0) +
    (filters.presentQ !== "any" ? 1 : 0) +
    (filters.medQ !== "any" ? 1 : 0) +
    (filters.verseQ !== "any" ? 1 : 0);

  const [showFilters, setShowFilters] = React.useState(false);
  const [yearText, setYearText] = React.useState(filters.year?.toString() ?? "");
  const [weekText, setWeekText] = React.useState(filters.week?.toString() ?? "");

  // A consulta já tem o próprio atraso: aqui o filtro só vale quando o número
  // está completo, para a lista não recarregar a cada dígito.
  const changeYear = (text: string) => {
    const digits = text.replace(/\D+/g, "").slice(0, PAGELA_FILTER_YEAR_DIGITS);
    setYearText(digits);
    const parsed = parseYearFilter(digits);
    if (parsed !== null && parsed !== filters.year) filters.setYear(parsed);
  };
  const changeWeek = (text: string) => {
    const digits = text.replace(/\D+/g, "").slice(0, PAGELA_FILTER_WEEK_DIGITS);
    setWeekText(digits);
    const parsed = parseWeekFilter(digits);
    if (parsed !== null && parsed !== filters.week) filters.setWeek(parsed);
  };

  const clear = () => {
    filters.clearFilters();
    setYearText("");
    setWeekText("");
  };

  return (
    <Stack data-testid="pagela-teacher-pagela-list" spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          data-testid="pagela-filters-toggle"
          startIcon={
            <Badge color="primary" badgeContent={activeCount}>
              <FilterListIcon />
            </Badge>
          }
          sx={{ minHeight: 44, fontWeight: 800, textTransform: "none" }}
        >
          {PAGELA_EDITOR_TEXTS.filters}
        </Button>
        {activeCount > 0 && (
          <Button
            onClick={clear}
            data-testid="pagela-filters-clear"
            sx={{ minHeight: 44, fontWeight: 700, textTransform: "none" }}
          >
            {PAGELA_EDITOR_TEXTS.clearFilters}
          </Button>
        )}
      </Stack>

      <Collapse in={showFilters} unmountOnExit>
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
          }}
        >
          <TextField
            label="Ano"
            size="small"
            value={yearText}
            onChange={(e) => changeYear(e.target.value)}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 4 } }}
          />
          <TextField
            label="Semana"
            size="small"
            value={weekText}
            onChange={(e) => changeWeek(e.target.value)}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 2 } }}
          />
          <TriSelect
            label="Presença"
            value={filters.presentQ}
            onChange={filters.setPresentQ}
            testId="pagela-filter-present"
          />
          <TriSelect
            label="Meditação"
            value={filters.medQ}
            onChange={filters.setMedQ}
            testId="pagela-filter-meditation"
          />
          <TriSelect
            label="Versículo"
            value={filters.verseQ}
            onChange={filters.setVerseQ}
            testId="pagela-filter-verse"
          />
        </Box>
      </Collapse>

      {rows.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1, md: 1.5 },
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          {rows.map((r) => (
            <PagelaCard key={r.id} row={r} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </Box>
      ) : (
        <Paper
          variant="outlined"
          data-testid="pagela-list-empty"
          sx={{ p: 3, borderRadius: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            {activeCount > 0
              ? PAGELA_EDITOR_TEXTS.emptyFiltered
              : PAGELA_EDITOR_TEXTS.empty}
          </Typography>
        </Paper>
      )}

      {total > limit && (
        <Stack direction="row" justifyContent="center">
          <Pagination
            count={Math.max(1, Math.ceil(total / limit))}
            page={page}
            onChange={(_, p) => setPage(p)}
            size={isXs ? "small" : "medium"}
            siblingCount={isXs ? 0 : 1}
            color="primary"
          />
        </Stack>
      )}
    </Stack>
  );
}
