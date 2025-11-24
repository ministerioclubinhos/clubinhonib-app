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
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import { Delete, Add, CalendarMonth, CheckCircle, Info, Warning, Edit } from '@mui/icons-material';
import { useCreatePeriod, useAcademicPeriods, useDeletePeriod, useUpdatePeriod } from '../hooks';
import { AcademicPeriod } from '../api';
import dayjs from 'dayjs';

export const PeriodManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const [editDialog, setEditDialog] = React.useState<{
    open: boolean;
    period: AcademicPeriod | null;
  }>({
    open: false,
    period: null,
  });
  const [editFormData, setEditFormData] = React.useState({
    startDate: '',
    endDate: '',
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
  const updatePeriod = useUpdatePeriod();
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

  const handleOpenEdit = (period: AcademicPeriod) => {
    setEditFormData({
      startDate: period.startDate,
      endDate: period.endDate,
      description: period.description || '',
    });
    setEditDialog({ open: true, period });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, period: null });
    setEditFormData({
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.period) return;

    try {
      await updatePeriod.mutateAsync({
        periodId: editDialog.period.id,
        data: {
          startDate: editFormData.startDate,
          endDate: editFormData.endDate,
          description: editFormData.description,
        },
      });

      handleCloseEdit();
      setSnackbar({
        open: true,
        message: 'Período atualizado com sucesso!',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao atualizar período: ${error.response?.data?.message || error.message}`,
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

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Formulário de Cadastro */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `2px solid ${theme.palette.success.main}40`,
              bgcolor: theme.palette.success.main + '05',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: 2,
                  bgcolor: theme.palette.success.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Add sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Novo Período Letivo
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Válido para todos os clubes
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
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

            <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, overflowX: 'auto' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !periods || periods.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Nenhum período cadastrado
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Cadastre o primeiro período letivo usando o formulário ao lado.
                  </Typography>
                </Alert>
              ) : isMobile ? (
                /* Versão Mobile: Cards */
                <Stack spacing={2}>
                  {periods
                    .sort((a, b) => b.year - a.year)
                    .map((period) => {
                      const isCurrent = period.year === new Date().getFullYear();
                      
                      return (
                        <Card key={period.id} elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <Stack spacing={1.5}>
                              {/* Header */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                    {period.year}
                                  </Typography>
                                  {isCurrent && (
                                    <Chip label="ATUAL" size="small" color="primary" sx={{ fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                                  )}
                                </Box>
                                {period.isActive ? (
                                  <Chip
                                    icon={<CheckCircle />}
                                    label="Ativo"
                                    size="small"
                                    color="success"
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  />
                                ) : (
                                  <Chip label="Inativo" size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                                )}
                              </Box>

                              <Divider />

                              {/* Período */}
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  Período
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {dayjs(period.startDate).format('DD/MM/YYYY')} até {dayjs(period.endDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  ({dayjs(period.endDate).diff(dayjs(period.startDate), 'day')} dias)
                                </Typography>
                              </Box>

                              {/* Descrição */}
                              {period.description && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    Descrição
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    {period.description}
                                  </Typography>
                                </Box>
                              )}

                              {/* Ações */}
                              <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<Edit />}
                                  onClick={() => handleOpenEdit(period)}
                                  fullWidth
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Delete />}
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      periodId: period.id,
                                      description: `${period.year} (${period.description})`,
                                    })
                                  }
                                  fullWidth
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  Excluir
                                </Button>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Stack>
              ) : (
                /* Versão Desktop: Tabela */
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 80 }}><strong>Ano</strong></TableCell>
                        <TableCell sx={{ minWidth: 150 }}><strong>Período</strong></TableCell>
                        <TableCell sx={{ minWidth: 150 }}><strong>Descrição</strong></TableCell>
                        <TableCell sx={{ minWidth: 100 }}><strong>Status</strong></TableCell>
                        <TableCell align="center" sx={{ minWidth: 100 }}><strong>Ações</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {periods
                        .sort((a, b) => b.year - a.year)
                        .map((period) => {
                          const isCurrent = period.year === new Date().getFullYear();
                          
                          return (
                            <TableRow key={period.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    {period.year}
                                  </Typography>
                                  {isCurrent && (
                                    <Chip label="ATUAL" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {dayjs(period.startDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  até
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {dayjs(period.endDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  ({dayjs(period.endDate).diff(dayjs(period.startDate), 'day')} dias)
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{period.description || '-'}</Typography>
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
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenEdit(period)}
                                    title="Editar período"
                                  >
                                    <Edit />
                                  </IconButton>
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
                                    title="Excluir período"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ⭐ Paginação v1.1.0 - Funciona em ambos (mobile e desktop) */}
              {periodsData && periodsData.total > 0 && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 1, sm: 0 } }}>
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
                    sx={{
                      '& .MuiTablePagination-toolbar': {
                        flexWrap: 'wrap',
                        gap: 1,
                        px: { xs: 0, sm: 2 },
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de Edição */}
      <Dialog 
        open={editDialog.open} 
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Edit sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          Editar Período Letivo
        </DialogTitle>
        <form onSubmit={handleSubmitEdit}>
          <DialogContent>
            {editDialog.period && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Editando período do ano <strong>{editDialog.period.year}</strong>
                </Typography>
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Início"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Término"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Ex: Ano Letivo 2024 - Atualizado"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleCloseEdit}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              color="primary" 
              variant="contained" 
              disabled={updatePeriod.isPending}
              startIcon={updatePeriod.isPending ? <CircularProgress size={16} /> : <Edit />}
            >
              {updatePeriod.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Exclusão */}
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
