import React, { useMemo, useState, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
  Button,
  Stack,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CoordinatorOption } from '../../types';

type Props = {
  value?: string | null;
  options: CoordinatorOption[];
  onChange: (val: string | null) => void;
  label?: string;
};

function normalize(s?: string | null) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function CoordinatorSelect({
  value,
  options,
  onChange,
  label = 'Coordenador (opcional)',
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    return options.filter((o) => {
      const n = normalize(o.name);
      const id = normalize(o.coordinatorProfileId);
      return n.includes(q) || id.includes(q);
    });
  }, [options, query]);

  const handleChange = useCallback(
    (e: any) => {
      const v = e.target.value as string;
      onChange(v ? v : null);
    },
    [onChange]
  );

  const clearSelection = () => onChange(null);
  const stop = (e: any) => e.stopPropagation();

  const actionStackProps = isXs
    ? { direction: 'column' as const, sx: { width: '100%' } }
    : { direction: 'row' as const };

  const btnProps = isXs ? { fullWidth: true, size: 'medium' as const } : { size: 'small' as const };

  const menuWidth = isXs ? '98vw' : 480;
  const menuMaxH = isXs ? '70vh' : 420;

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value ?? ''}
        onChange={handleChange}
        renderValue={(selected) => {
          if (!selected) return '—';
          const opt = options.find((o) => o.coordinatorProfileId === selected);
          return opt?.name || selected;
        }}
        MenuProps={{
          PaperProps: { sx: { width: menuWidth, maxHeight: menuMaxH } },
          MenuListProps: { dense: true },
        }}
      >
        <ListSubheader
          disableSticky
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 1,
          }}
          onKeyDown={stop}
          onClick={stop}
        >
          <Box sx={{ px: 2, pb: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Buscar por nome ou ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={stop}
              inputProps={{ 'aria-label': 'Buscar coordenador' }}
            />
          </Box>

          <Stack
            direction={isXs ? 'column' : 'row'}
            spacing={1}
            alignItems={isXs ? 'flex-start' : 'center'}
            justifyContent="space-between"
            sx={{ px: 1.5, pb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {filtered.length} resultado(s)
            </Typography>

            <Stack {...actionStackProps} spacing={1} alignItems="stretch">
              <Button {...btnProps} color="secondary" onClick={clearSelection}>
                Limpar seleção
              </Button>
              <Button {...btnProps} variant="outlined" onClick={() => setOpen(false)}>
                OK
              </Button>
            </Stack>
          </Stack>
        </ListSubheader>

        <MenuItem value="">
          <ListItemText primary="—" />
        </MenuItem>

        {filtered.length === 0 ? (
          <MenuItem disabled>
            <ListItemText
              primary="Nenhum coordenador encontrado."
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </MenuItem>
        ) : (
          filtered.map((c) => (
            <MenuItem key={c.coordinatorProfileId} value={c.coordinatorProfileId}>
              <ListItemText primary={c.name || c.coordinatorProfileId} />
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
}
