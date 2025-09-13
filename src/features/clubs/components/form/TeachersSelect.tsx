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
} from "@mui/material";
import { TeacherOption } from "../../types";

type Props = {
  value: string[];
  options: TeacherOption[]; // { teacherProfileId: string; name: string; vinculado?: boolean }
  onChange: (ids: string[]) => void;
  name?: string;
};

export default function TeachersSelect({
  value,
  options,
  onChange,
  name = "Selecionar professores",
}: Props) {
  const [open, setOpen] = useState(false);

  // Fingerprint captura mudanças relevantes mesmo com o mesmo array/objetos por referência
  const fingerprint = useMemo(
    () => (options ?? [])
      .map(o => `${o.teacherProfileId}:${o.vinculado ? 1 : 0}`)
      .join("|"),
    [options]
  );

  // Mostrar apenas não vinculados, exceto os já selecionados (edição)
  const visibleOptions = useMemo(
    () =>
      (options ?? []).filter(
        (opt) => !opt.vinculado || value.includes(opt.teacherProfileId)
      ),
    // ⚠️ depende do fingerprint em vez de options diretamente
    [fingerprint, value]
  );

  // Mantém o Select imune a null/undefined/""
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

  const handleChange = useCallback(
    (e: any) => {
      const raw = (e.target.value ?? []) as Array<string | null | undefined>;
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

  return (
    <FormControl fullWidth>
      <InputLabel>{name}</InputLabel>
      <Select
        multiple
        label={name}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={safeValue}
        onChange={handleChange}
        renderValue={(selected) =>
          (selected as string[])
            .map(
              (id) => options.find((t) => t.teacherProfileId === id)?.name ?? id
            )
            .join(", ")
        }
        MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
      >
        {visibleOptions.map((t) => {
          const isSelected = safeValue.includes(t.teacherProfileId);
          const disabled = !!t.vinculado && !isSelected;
          return (
            <MenuItem
              key={t.teacherProfileId}
              value={t.teacherProfileId}
              disabled={disabled}
              dense
            >
              <Checkbox checked={isSelected} />
              <ListItemText primary={t.name} />
            </MenuItem>
          );
        })}

        {/* “OK” não-selecionável para fechar o menu */}
        <ListSubheader disableSticky sx={{ m: 0, p: 0 }}>
          <Typography
            variant="caption"
            color="primary"
            onClick={() => setOpen(false)}
            sx={{
              display: "block",
              textAlign: "right",
              px: 2,
              py: 0.5,
              cursor: "pointer",
            }}
          >
            OK
          </Typography>
        </ListSubheader>
      </Select>
    </FormControl>
  );
}
