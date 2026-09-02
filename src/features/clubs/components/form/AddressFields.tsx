import React from "react";
import { Grid2, TextField } from "@mui/material";

import type { ClubAddressInput } from "../../types";

type Props = {
  value: ClubAddressInput;
  onChange: (address: ClubAddressInput) => void;
};

/** Campos do endereço do clubinho, no mesmo formato que a API aceita. */
export default function AddressFields({ value, onChange }: Props) {
  const set = (key: keyof ClubAddressInput, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <TextField
          label="Rua"
          fullWidth
          value={value.street ?? ""}
          onChange={(e) => set("street", e.target.value)}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <TextField
          label="Número"
          fullWidth
          value={value.number ?? ""}
          onChange={(e) => set("number", e.target.value)}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          label="Bairro"
          fullWidth
          value={value.district ?? ""}
          onChange={(e) => set("district", e.target.value)}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          label="Complemento"
          fullWidth
          placeholder="Bloco, apto, referência…"
          value={value.complement ?? ""}
          onChange={(e) => set("complement", e.target.value)}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          label="Cidade"
          fullWidth
          value={value.city ?? ""}
          onChange={(e) => set("city", e.target.value)}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 2 }}>
        <TextField
          label="Estado"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 2 } }}
          placeholder="UF"
          value={value.state ?? ""}
          onChange={(e) => set("state", e.target.value.toUpperCase())}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <TextField
          label="CEP"
          fullWidth
          placeholder="00000-000"
          value={value.postalCode ?? ""}
          onChange={(e) => set("postalCode", e.target.value)}
        />
      </Grid2>
    </>
  );
}
