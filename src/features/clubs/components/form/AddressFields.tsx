import React from "react";
import { Grid, TextField } from "@mui/material";
import { AddressResponseDto } from "../../types";

type Props = {
  value: Partial<AddressResponseDto>;
  onChange: (addr: Partial<AddressResponseDto>) => void;
};

export default function AddressFields({ value, onChange }: Props) {
  return (
    <>
      <Grid item xs={12} md={6}>
        <TextField
          label="Rua" fullWidth
          value={value.street ?? ""}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          label="Número" fullWidth
          value={value.number ?? ""}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          label="Bairro" fullWidth
          value={value.district ?? ""}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="Cidade" fullWidth
          value={value.city ?? ""}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="Estado" fullWidth
          value={value.state ?? ""}
          onChange={(e) => onChange({ ...value, state: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="CEP" fullWidth
          value={value.postalCode ?? ""}
          onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
        />
      </Grid>
    </>
  );
}
