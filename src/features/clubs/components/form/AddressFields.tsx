import React from 'react';
import { Grid, TextField } from '@mui/material';
import { AddressResponseDto } from '../../types';

type Props = {
  value: Partial<AddressResponseDto>;
  onChange: (addr: Partial<AddressResponseDto>) => void;
};

export default function AddressFields({ value = {}, onChange }: Props) {
  const v = value || {};
  const set = (key: keyof AddressResponseDto, val: string) => onChange({ ...v, [key]: val });

  return (
    <>
      <Grid item xs={12} md={8}>
        <TextField
          label="Rua"
          fullWidth
          value={v.street ?? ''}
          onChange={(e) => set('street', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Número"
          fullWidth
          value={v.number ?? ''}
          onChange={(e) => set('number', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Bairro"
          fullWidth
          value={v.district ?? ''}
          onChange={(e) => set('district', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Complemento"
          fullWidth
          placeholder="Bloco, apto, referência…"
          value={v.complement ?? ''}
          onChange={(e) => set('complement', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Cidade"
          fullWidth
          value={v.city ?? ''}
          onChange={(e) => set('city', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={2}>
        <TextField
          label="Estado"
          fullWidth
          inputProps={{ maxLength: 2 }}
          placeholder="UF"
          value={v.state ?? ''}
          onChange={(e) => set('state', e.target.value.toUpperCase())}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="CEP"
          fullWidth
          placeholder="00000-000"
          value={v.postalCode ?? ''}
          onChange={(e) => set('postalCode', e.target.value)}
        />
      </Grid>
    </>
  );
}
