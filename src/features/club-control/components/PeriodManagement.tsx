import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  TablePagination,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { Delete, Add, CalendarMonth, CheckCircle, Info, Warning } from '@mui/icons-material';
import { useCreatePeriod, useAcademicPeriods, useDeletePeriod } from '../hooks';
import dayjs from 'dayjs';

// ⚠️ Backend status
const BACKEND_ENABLED = import.meta.env.VITE_CLUB_CONTROL_ENABLED === 'true';

export const PeriodManagement: React.FC = () => {
  const theme = useTheme();

  // Se backend não está habilitado, mostrar mensagem
  if (!BACKEND_ENABLED) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `2px solid ${theme.palette.info.main}` }}>
        <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
          <Typography variant="body2">
            🚧 <strong>Módulo aguardando backend.</strong> Configure <code>VITE_CLUB_CONTROL_ENABLED=true</code> no <code>.env</code> para ativar.
          </Typography>
        </Alert>
      </Paper>
    );
  }
  const [formData, setFormData] = React.useState({
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    description: '',
  });
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    periodId: string;
    description: string;
  }>({
    open: false,
    periodId: '',
    description: '',
  });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: periodsData, isLoading } = useAcademicPeriods(page, limit);
  const periods = periodsData?.items || [];
  const createPeriod = useCreatePeriod();
  const deletePeriod = useDeletePeriod();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPeriod.mutateAsync({
        year: formData.year,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
      });

      setFormData({
        year: new Date().getFullYear() + 1,
        startDate: '',
        endDate: '',
        description: '',
      });

      setSnackbar({
        open: true,
        message: `Período letivo ${formData.year} cadastrado com sucesso! Este período vale para TODOS os clubes.`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao cadastrar período: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePeriod.mutateAsync(deleteDialog.periodId);
      setDeleteDialog({ open: false, periodId: '', description: '' });
      setSnackbar({
        open: true,
        message: 'Período excluído com sucesso!',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao excluir período: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header Otimizado */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: `2px solid ${theme.palette.primary.main}30`,
          bgcolor: theme.palette.primary.main + '08',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarMonth sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              📅 Período Letivo GLOBAL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Um único período por ano válido para TODOS os clubes
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Alerta Informativo */}
      <Alert
        severity="info"
        icon={<Info />}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: `2px solid ${theme.palette.info.main}40`,
        }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          ⚠️ ESTRUTURA GLOBAL
        </Typography>
        <Typography variant="caption" display="block">
          • Um período por ano vale para <strong>TODOS os clubes</strong>
        </Typography>
        <Typography variant="caption" display="block">
          • A primeira semana do período é a "Semana 1" do ano letivo
        </Typography>
        <Typography variant="caption" display="block">
          • Fora do período letivo não há monitoramento de pagelas
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${theme.palette.success.main}40`,
              bgcolor: theme.palette.success.main + '05',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: theme.palette.success.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Add sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Novo Período Letivo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Válido para todos os clubes
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Ano Letivo"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                    inputProps={{ min: 2020, max: 2100 }}
                    helperText="Ex: 2024, 2025..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Início"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                    helperText="Primeiro dia do ano letivo"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data de Término"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                    helperText="Último dia do ano letivo"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Ano Letivo 2024"
                    helperText="Descrição do período"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Add />}
                    disabled={createPeriod.isPending}
                  >
                    {createPeriod.isPending ? 'Cadastrando...' : 'Cadastrar Período Global'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>Atenção:</strong> Este período será aplicado para TODOS os clubes do sistema.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Lista de Períodos */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `2px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                📋 Períodos Cadastrados
              </Typography>
              {periodsData && periodsData.total > 0 && (
                <Chip
                  label={`${periodsData.total} período${periodsData.total > 1 ? 's' : ''}`}
                  sx={{ bgcolor: 'white', color: theme.palette.primary.main, fontWeight: 'bold' }}
                />
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !periods || periods.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Nenhum período cadastrado
                  </Typography>
                  <Typography variant="caption">
                    Cadastre o primeiro período letivo usando o formulário ao lado.
                  </Typography>
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Ano</strong></TableCell>
                        <TableCell><strong>Período</strong></TableCell>
                        <TableCell><strong>Descrição</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Ações</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {periods
                        .sort((a, b) => b.year - a.year) // Mais recente primeiro
                        .map((period) => {
                          const isCurrent = period.year === new Date().getFullYear();
                          
                          return (
                            <TableRow key={period.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" fontWeight="bold" color="primary">
                                    {period.year}
                                  </Typography>
                                  {isCurrent && (
                                    <Chip label="ATUAL" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {dayjs(period.startDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  até
                                </Typography>
                                <Typography variant="body2">
                                  {dayjs(period.endDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  ({dayjs(period.endDate).diff(dayjs(period.startDate), 'day')} dias)
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{period.description || '-'}</Typography>
                              </TableCell>
                              <TableCell>
                                {period.isActive ? (
                                  <Chip
                                    icon={<CheckCircle />}
                                    label="Ativo"
                                    size="small"
                                    color="success"
                                  />
                                ) : (
                                  <Chip label="Inativo" size="small" variant="outlined" />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      periodId: period.id,
                                      description: `${period.year} (${period.description})`,
                                    })
                                  }
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ⭐ Paginação v1.1.0 */}
              {periodsData && periodsData.total > 0 && (
                <TablePagination
                  component="div"
                  count={periodsData.total}
                  page={page - 1}
                  onPageChange={(event, newPage) => setPage(newPage + 1)}
                  rowsPerPage={limit}
                  onRowsPerPageChange={(event) => {
                    setLimit(parseInt(event.target.value, 10));
                    setPage(1);
                  }}
                  rowsPerPageOptions={[10, 20, 50]}
                  labelRowsPerPage="Períodos por página:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                  sx={{ borderTop: 1, borderColor: 'divider' }}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, periodId: '', description: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Warning sx={{ color: theme.palette.error.main, fontSize: 28 }} />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja excluir o período <strong>{deleteDialog.description}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ⚠️ Atenção: Esta ação não pode ser desfeita!
            </Typography>
            <Typography variant="caption" display="block">
              A exclusão deste período afetará <strong>TODOS os clubes</strong> do sistema. 
              As semanas relacionadas a este período não serão mais monitoradas.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, periodId: '', description: '' })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={deletePeriod.isPending}
            startIcon={deletePeriod.isPending ? <CircularProgress size={16} /> : <Delete />}
          >
            {deletePeriod.isPending ? 'Excluindo...' : 'Excluir Período'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};
