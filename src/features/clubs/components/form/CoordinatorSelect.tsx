// src/modules/clubs/components/form/CoordinatorSelect.tsx
import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { CoordinatorOption } from "../../types";

type Props = {
  value?: string | null;
  options: CoordinatorOption[];
  onChange: (val: string | null) => void;
  label?: string;
};

export default function CoordinatorSelect({
  value, options, onChange, label = "Coordenador (opcional)",
}: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? String(e.target.value) : null)}
      >
        <MenuItem value="">—</MenuItem>
        {options.map((c) => (
          <MenuItem key={c.coordinatorProfileId} value={c.coordinatorProfileId}>
            {c.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
