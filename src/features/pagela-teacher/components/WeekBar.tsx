// src/features/pagela-teacher/components/WeekBar.tsx
import * as React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import { clampWeek } from "../utils";

type Props = {
  year: number;
  week: number;
  onChange: (next: { year: number; week: number }) => void;
  goCurrent: () => void;
};

export default function WeekBar({ year, week, onChange, goCurrent }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const dec = () =>
    onChange(week > 1 ? { year, week: week - 1 } : { year: year - 1, week: 53 });
  const inc = () =>
    onChange(week < 53 ? { year, week: week + 1 } : { year: year + 1, week: 1 });

  if (isXs) {
    // ===== MOBILE =====
    return (
      <Stack spacing={1}>
        {/* 1ª linha: ANO (100%) */}
        <TextField
          size="small"
          label="Ano"
          type="number"
          value={year}
          onChange={(e) =>
            onChange({ year: Number(e.target.value || year), week })
          }
          fullWidth
          sx={{ maxWidth: 200 }}
        />

        {/* 2ª linha: setas + SEMANA */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Semana anterior">
              <IconButton size="small" onClick={dec}>
                <ChevronLeft />
              </IconButton>
            </Tooltip>
            <Tooltip title="Semana atual">
              <IconButton size="small" onClick={goCurrent}>
                <Today />
              </IconButton>
            </Tooltip>
            <Tooltip title="Próxima semana">
              <IconButton size="small" onClick={inc}>
                <ChevronRight />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            size="small"
            label="Semana"
            type="number"
            value={week}
            onChange={(e) =>
              onChange({
                year,
                week: clampWeek(Number(e.target.value || week)),
              })
            }
            inputProps={{ min: 1, max: 53, inputMode: "numeric", pattern: "[0-9]*" }}
            sx={{ width: 120 }}
          />
        </Box>
      </Stack>
    );
  }

  // ===== DESKTOP =====
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "flex-start",
      }}
    >
      <ButtonGroup variant="outlined" size="small" sx={{ borderRadius: 999, overflow: "hidden" }}>
        <Button onClick={dec} startIcon={<ChevronLeft />}>
          Anterior
        </Button>
        <Tooltip title="Semana atual">
          <Button onClick={goCurrent} startIcon={<Today />}>
            Hoje
          </Button>
        </Tooltip>
        <Button onClick={inc} endIcon={<ChevronRight />}>
          Próxima
        </Button>
      </ButtonGroup>

      <TextField
        size="small"
        label="Ano"
        type="number"
        value={year}
        onChange={(e) =>
          onChange({ year: Number(e.target.value || year), week })
        }
        sx={{ width: 110 }}
      />
      <TextField
        size="small"
        label="Semana"
        type="number"
        value={week}
        onChange={(e) =>
          onChange({
            year,
            week: clampWeek(Number(e.target.value || week)),
          })
        }
        inputProps={{ min: 1, max: 53 }}
        sx={{ width: 120 }}
      />
    </Box>
  );
}
