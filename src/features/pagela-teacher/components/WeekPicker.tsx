// src/features/pagela-teacher/components/WeekPicker.tsx
import React from "react";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import { clampWeek } from "../utils";

type Props = {
  year: number;
  week: number;
  onChange: (next: { year: number; week: number }) => void;
  currentYear?: number;
  currentWeek?: number;
};

export default function WeekPicker({ year, week, onChange, currentYear, currentWeek }: Props) {
  const setWeek = (w: number) => onChange({ year, week: clampWeek(w) });
  const dec = () => onChange(week > 1 ? { year, week: week - 1 } : { year: year - 1, week: 53 });
  const inc = () => onChange(week < 53 ? { year, week: week + 1 } : { year: year + 1, week: 1 });
  const goToday = () => onChange({ year: currentYear ?? year, week: currentWeek ?? week });

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Tooltip title="Semana anterior">
        <IconButton size="small" onClick={dec}>
          <ChevronLeft />
        </IconButton>
      </Tooltip>

      <TextField
        label="Ano"
        size="small"
        type="number"
        value={year}
        onChange={(e) => onChange({ year: Number(e.target.value || year), week })}
        sx={{ width: 110 }}
      />

      <TextField
        label="Semana"
        size="small"
        type="number"
        value={week}
        onChange={(e) => setWeek(Number(e.target.value || week))}
        sx={{ width: 110 }}
        inputProps={{ min: 1, max: 53 }}
      />

      <Tooltip title="Semana atual">
        <IconButton size="small" onClick={goToday}>
            <Today />
        </IconButton>
      </Tooltip>

      <Tooltip title="Próxima semana">
        <IconButton size="small" onClick={inc}>
          <ChevronRight />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
