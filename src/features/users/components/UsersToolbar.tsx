import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  FormGroup,
  Paper,
  Fab,
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { UserFilters } from '../types';
import { UserRole } from '@/store/slices/auth/authSlice';

type Props = {
  filters: UserFilters;
  onChange: (updater: (prev: UserFilters) => UserFilters) => void;
  onCreate: () => void;
  onRefresh: () => void;
  isXs?: boolean;
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.COORDINATOR]: 'Coordenador',
  [UserRole.TEACHER]: 'Professor',
  [UserRole.ADMIN]: 'Administrador',
};

export default function UsersToolbar({ filters, onChange, onCreate, onRefresh, isXs }: Props) {
  const roleOptions = ['all', UserRole.COORDINATOR, UserRole.TEACHER] as const;

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Buscar (nome, e-mail, telefone, papel)"
            value={filters.q}
            onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Papel</InputLabel>
            <Select
              value={filters.role}
              label="Papel"
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  role: e.target.value as (typeof roleOptions)[number],
                }))
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              {roleOptions
                .filter((role) => role !== 'all')
                .map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabels[role]}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 1, md: 3 },
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Tooltip title="Exibe apenas usuários que estão ativos no sistema">
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.onlyActive}
                    onChange={(e) => onChange((p) => ({ ...p, onlyActive: e.target.checked }))}
                  />
                }
                label="Apenas ativos"
              />
            </Tooltip>

            <Tooltip title="Exibe apenas usuários que concluíram o cadastro">
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.onlyCompleted}
                    onChange={(e) => onChange((p) => ({ ...p, onlyCompleted: e.target.checked }))}
                  />
                }
                label="Apenas completos"
              />
            </Tooltip>
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          {isXs ? (
            <>
              <Fab
                color="primary"
                aria-label="Criar usuário"
                onClick={onCreate}
                sx={{
                  position: 'fixed',
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
                  right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
                  zIndex: 9999,
                  boxShadow: 6,
                }}
              >
                <Add />
              </Fab>

              <Fab
                aria-label="Recarregar"
                onClick={onRefresh}
                sx={{
                  position: 'fixed',
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                  right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
                  zIndex: 9999,
                  bgcolor: 'white',
                  boxShadow: 6,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <Refresh />
              </Fab>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefresh} aria-label="Recarregar">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Criar Usuário">
                <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
                  Criar
                </Button>
              </Tooltip>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
