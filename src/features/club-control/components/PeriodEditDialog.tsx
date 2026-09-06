import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

import { SimpleDatePicker } from '@/components/common/inputs';

import type { AcademicPeriod } from '../types';

/** Campos editáveis de um período letivo. */
export type PeriodFormValues = {
  startDate: string;
  endDate: string;
  description: string;
};

type Props = {
  open: boolean;
  /** `null` enquanto nenhum período foi escolhido para edição. */
  period: AcademicPeriod | null;
  values: PeriodFormValues;
  loading: boolean;
  onChange: (values: PeriodFormValues) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
};

/**
 * O formulário de edição de um período letivo.
 *
 * Saiu de `PeriodManagement`, que reunia a listagem, os dois diálogos e o
 * aviso num arquivo de 790 linhas. A checagem das datas mora em `utils.ts` e
 * tem teste próprio.
 */
export default function PeriodEditDialog({
  open,
  period,
  values,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
      <Dialog data-testid="club-control-period-edit-dialog"
        open={open}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Edit sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          Editar Período Letivo
        </DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            {period && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Editando período do ano <strong>{period.year}</strong>
                </Typography>
              </Alert>
            )}
            <Grid2 container spacing={2} sx={{ mt: 1 }}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <SimpleDatePicker
                  value={values.startDate}
                  onChange={(value) => onChange({ ...values, startDate: value })}
                  label="Data de Início"
                  required
                  margin="none"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <SimpleDatePicker
                  value={values.endDate}
                  onChange={(value) => onChange({ ...values, endDate: value })}
                  label="Data de Término"
                  required
                  margin="none"
                />
              </Grid2>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={values.description}
                  onChange={(e) => onChange({ ...values, description: e.target.value })}
                  placeholder="Ex: Ano Letivo 2024 - Atualizado"
                />
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={onCancel}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Edit />}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
}
