import React, { useMemo, useState, useCallback } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  ListSubheader,
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import type { TeacherOption } from "../../types";

type Props = {
  value: string[];
  options: TeacherOption[];
  onChange: (ids: string[]) => void;
  name?: string;
  /** O clubinho sendo editado; nulo na criação. */
  currentClubId?: string | null;
};

function normalize(s?: string | null) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function TeachersSelect({
  value,
  options,
  onChange,
  name = "Selecionar professores",
  currentClubId = null,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const safeValue = useMemo(
    () =>
      Array.from(
        new Set(
          (value ?? []).filter(
            (v): v is string => typeof v === "string" && v.trim() !== ""
          )
        )
      ),
    [value]
  );

  /**
   * Todo mundo aparece. Antes, quem já tinha turma sumia da lista, e não havia
   * como descobrir por que aquele professor não estava lá — nem trazê-lo, que
   * é uma operação legítima e que a API aceita.
   */
  const baseVisible = options ?? [];

  const q = normalize(query);
  const visibleOptions = useMemo(() => {
    if (!q) return baseVisible;
    return baseVisible.filter((opt) => {
      const n = normalize(opt.name);
      const id = normalize(opt.teacherProfileId);
      return n.includes(q) || id.includes(q);
    });
  }, [baseVisible, q]);

  const selectedSet = useMemo(() => new Set(safeValue), [safeValue]);

  /** De onde o professor viria, quando vem de outro clubinho. */
  const movingFrom = useCallback(
    (opt: TeacherOption): number | null =>
      opt.clubId && opt.clubId !== currentClubId ? opt.clubNumber : null,
    [currentClubId]
  );

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const raw = (event.target.value ?? []) as Array<string | null | undefined>;
      const cleaned = Array.from(
        new Set(
          raw.filter(
            (v): v is string => typeof v === "string" && v.trim() !== ""
          )
        )
      );
      onChange(cleaned);
    },
    [onChange]
  );

  const selectVisible = useCallback(() => {
    const next = new Set(safeValue);
    for (const o of visibleOptions) {
      next.add(o.teacherProfileId);
    }
    onChange(Array.from(next));
  }, [safeValue, visibleOptions, onChange]);

  const clearVisible = useCallback(() => {
    const toRemove = new Set(visibleOptions.map((o) => o.teacherProfileId));
    const next = safeValue.filter((id) => !toRemove.has(id));
    onChange(next);
  }, [safeValue, visibleOptions, onChange]);

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const renderSelected = useCallback(
    (selected: string[]) => {
      if (isXs) {
        const total = selected.length;
        if (total === 0) return "Nenhum professor";
        if (total <= 2) {
          const names = selected
            .map(
              (id) => options.find((t) => t.teacherProfileId === id)?.name ?? id
            )
            .join(", ");
          return names;
        }
        return `${total} selecionados`;
      }
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {selected.map((id) => {
            const name =
              options.find((t) => t.teacherProfileId === id)?.name ?? id;
            return (
              <Chip key={id} size="small" label={name} sx={{ maxWidth: 180 }} title={name} />
            );
          })}
        </Box>
      );
    },
    [isXs, options]
  );

  // Mesma conta do seletor de coordenador: largura útil menos a margem.
  const menuWidth = isXs ? "calc(100vw - 32px)" : 560;
  const menuMaxHeight = isXs ? "75dvh" : 480;

  const actionsDirection = isXs ? "column" : "row";
  const actionsButtonProps = isXs ? { fullWidth: true, size: "medium" as const } : { size: "small" as const };

  return (
    <FormControl data-testid="clubs-form-teachers-select" fullWidth>
      <InputLabel>{name}</InputLabel>
      <Select
        multiple
        label={name}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={safeValue}
        onChange={handleChange}
        renderValue={(selected) => renderSelected(selected as string[])}
        MenuProps={{
          PaperProps: { sx: { width: menuWidth, maxHeight: menuMaxHeight } },
          MenuListProps: { dense: true },
        }}
      >
        <ListSubheader
          disableSticky
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1,
          }}
          onKeyDown={stopPropagation}
          onClick={stopPropagation}
        >
          <Box sx={{ px: 2, pb: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Buscar por nome ou ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={stopPropagation}
              slotProps={{ htmlInput: { "aria-label": "Buscar professor" } }}
            />
          </Box>

          <Stack
            direction={isXs ? "column" : "row"}
            spacing={1}
            alignItems={isXs ? "flex-start" : "center"}
            justifyContent="space-between"
            sx={{ px: 1.5, pb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ px: isXs ? 0.5 : 0 }}>
              {visibleOptions.length} resultado(s)
            </Typography>

            <Stack
              direction={actionsDirection}
              spacing={1}
              alignItems="stretch"
              sx={{ width: isXs ? "100%" : "auto" }}
            >
              <Button {...actionsButtonProps} onClick={selectVisible}>
                Selecionar visíveis
              </Button>
              <Button {...actionsButtonProps} color="secondary" onClick={clearVisible}>
                Limpar visíveis
              </Button>
              <Button {...actionsButtonProps} variant="outlined" onClick={() => setOpen(false)}>
                OK
              </Button>
            </Stack>
          </Stack>
        </ListSubheader>

        {visibleOptions.length === 0 && (
          <MenuItem disabled dense>
            <ListItemText
              primary="Nenhum resultado para a busca."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </MenuItem>
        )}

        {/*
          Nenhuma opção fica desabilitada: o coordenador monta a equipe do
          clubinho dele com qualquer professor. O que a linha avisa é a
          consequência — vincular move o professor, tirando-o do clubinho onde
          ele está hoje.
        */}
        {visibleOptions.map((t) => {
          const isSelected = selectedSet.has(t.teacherProfileId);
          return (
            <MenuItem key={t.teacherProfileId} value={t.teacherProfileId} dense>
              <Checkbox checked={isSelected} />
              <ListItemText
                primaryTypographyProps={{ noWrap: true }}
                primary={t.name}
                secondary={
                  movingFrom(t) !== null && !isSelected
                    ? `No Clubinho ${movingFrom(t)} — será movido`
                    : undefined
                }
                secondaryTypographyProps={{ color: "text.secondary" }}
              />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
