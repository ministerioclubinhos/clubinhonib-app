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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  FormControlLabel,
  Checkbox,
  TablePagination,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  Delete,
  Add,
  EventBusy,
  Warning,
  Event,
  Build,
  Help,
  BeachAccess,
  Info,
  Repeat,
} from '@mui/icons-material';
import { useCreateException, useWeekdayExceptions, useDeleteException } from '../hooks';
import dayjs from 'dayjs';

const EXCEPTION_TYPES = [
  { value: 'holiday', label: 'Feriado', icon: <EventBusy />, color: '#ff9800' },
  { value: 'event', label: 'Evento', icon: <Event />, color: '#2196f3' },
  { value: 'vacation', label: 'Férias', icon: <BeachAccess />, color: '#4caf50' }, // NOVO
  { value: 'maintenance', label: 'Manutenção', icon: <Build />, color: '#9c27b0' },
  { value: 'other', label: 'Outro', icon: <Help />, color: '#607d8b' },
];

// ⚠️ Backend status
const BACKEND_ENABLED = import.meta.env.VITE_CLUB_CONTROL_ENABLED === 'true';

export const ExceptionManagement: React.FC = () => {
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
    exceptionDate: '',
    reason: '',
    type: 'holiday' as 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other',
    isRecurrent: true, // NOVO campo
    notes: '',
  });
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    exceptionId: string;
    description: string;
  }>({
    open: false,
    exceptionId: '',
    description: '',
  });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: exceptionsData, isLoading } = useWeekdayExceptions({ page, limit });
  const exceptions = exceptionsData?.items || [];
  const createException = useCreateException();
  const deleteException = useDeleteException();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createException.mutateAsync({
        exceptionDate: formData.exceptionDate,
        reason: formData.reason,
        type: formData.type,
        isRecurrent: formData.isRecurrent,
        notes: formData.notes || undefined,
      });

      const dateFormatted = dayjs(formData.exceptionDate).format('DD/MM/YYYY');
      const weekday = dayjs(formData.exceptionDate).format('dddd');
      
      setFormData({
        exceptionDate: '',
        reason: '',
        type: 'holiday',
        isRecurrent: true,
        notes: '',
      });

      setSnackbar({
        open: true,
        message: `Exceção cadastrada com sucesso! A data ${dateFormatted} (${weekday}) não terá funcionamento para TODOS os clubes deste dia.`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao cadastrar exceção: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteException.mutateAsync(deleteDialog.exceptionId);
      setDeleteDialog({ open: false, exceptionId: '', description: '' });
      setSnackbar({
        open: true,
        message: 'Exceção excluída com sucesso! A data voltará a ser considerada como dia normal de funcionamento.',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao excluir exceção: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTypeConfig = (type: string) => {
    return EXCEPTION_TYPES.find((t) => t.value === type) || EXCEPTION_TYPES[4];
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
          border: `2px solid ${theme.palette.warning.main}30`,
          bgcolor: theme.palette.warning.main + '08',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: theme.palette.warning.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventBusy sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              🚫 Exceções GLOBAIS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Datas em que TODOS os clubes não funcionarão
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
          • Uma exceção por data afeta <strong>TODOS os clubes</strong> daquele dia da semana
        </Typography>
        <Typography variant="caption" display="block">
          • Ex: Feriado em 15/11 (quarta) → todos os clubes de quarta não funcionam
        </Typography>
        <Typography variant="caption" display="block">
          • Exceções <strong>não afetam</strong> estatísticas de regularidade
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
              border: `2px solid ${theme.palette.warning.main}40`,
              bgcolor: theme.palette.warning.main + '05',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: theme.palette.warning.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Add sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Nova Exceção Global
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Válida para todos os clubes
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data da Exceção"
                    value={formData.exceptionDate}
                    onChange={(e) => setFormData({ ...formData, exceptionDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                    helperText="Data em que NENHUM clube funcionará"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other',
                      })
                    }
                    required
                  >
                    {EXCEPTION_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Motivo"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    placeholder="Ex: Feriado - Proclamação da República"
                    helperText="Descreva o motivo da exceção"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isRecurrent}
                        onChange={(e) => setFormData({ ...formData, isRecurrent: e.target.checked })}
                        icon={<Repeat />}
                        checkedIcon={<Repeat />}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          Exceção Recorrente
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Repetir esta data todo ano (ex: feriados nacionais)
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Informações adicionais (opcional)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Add />}
                    disabled={createException.isPending}
                    color="warning"
                  >
                    {createException.isPending ? 'Cadastrando...' : 'Cadastrar Exceção Global'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
              <Typography variant="caption">
                <strong>Atenção:</strong> Esta exceção será aplicada para TODOS os clubes que funcionam no dia da semana selecionado.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Lista de Exceções */}
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
                bgcolor: theme.palette.warning.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                📋 Exceções Cadastradas
              </Typography>
              {exceptionsData && exceptionsData.total > 0 && (
                <Chip
                  label={`${exceptionsData.total} exceção${exceptionsData.total > 1 ? 'ões' : ''}`}
                  sx={{ bgcolor: 'white', color: theme.palette.warning.main, fontWeight: 'bold' }}
                />
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !exceptions || exceptions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Nenhuma exceção cadastrada
                  </Typography>
                  <Typography variant="caption">
                    Cadastre datas em que NENHUM clube funcionará.
                  </Typography>
                </Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell><strong>Tipo</strong></TableCell>
                        <TableCell><strong>Motivo</strong></TableCell>
                        <TableCell align="center"><strong>Ações</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exceptions
                        .sort((a, b) => new Date(b.exceptionDate).getTime() - new Date(a.exceptionDate).getTime())
                        .map((exception) => {
                          const typeConfig = getTypeConfig(exception.type);
                          const isPast = dayjs(exception.exceptionDate).isBefore(dayjs(), 'day');
                          const weekday = dayjs(exception.exceptionDate).format('dddd');
                          
                          return (
                            <TableRow key={exception.id} hover sx={{ opacity: isPast ? 0.6 : 1 }}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {dayjs(exception.exceptionDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {weekday}
                                </Typography>
                                {isPast && (
                                  <Chip label="Passado" size="small" sx={{ mt: 0.5 }} variant="outlined" />
                                )}
                                {exception.isRecurrent && (
                                  <Chip
                                    icon={<Repeat />}
                                    label="Recorrente"
                                    size="small"
                                    color="info"
                                    sx={{ mt: 0.5, ml: isPast ? 0.5 : 0 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={typeConfig.icon}
                                  label={typeConfig.label}
                                  size="small"
                                  sx={{ bgcolor: typeConfig.color + '20', color: typeConfig.color }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{exception.reason}</Typography>
                                {exception.notes && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {exception.notes}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      exceptionId: exception.id,
                                      description: `${dayjs(exception.exceptionDate).format('DD/MM/YYYY')} - ${exception.reason}`,
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
              {exceptionsData && exceptionsData.total > 0 && (
                <TablePagination
                  component="div"
                  count={exceptionsData.total}
                  page={page - 1}
                  onPageChange={(event, newPage) => setPage(newPage + 1)}
                  rowsPerPage={limit}
                  onRowsPerPageChange={(event) => {
                    setLimit(parseInt(event.target.value, 10));
                    setPage(1);
                  }}
                  rowsPerPageOptions={[25, 50, 100]}
                  labelRowsPerPage="Exceções por página:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                  sx={{ borderTop: 1, borderColor: 'divider' }}
                />
              )}
            </Box>
          </Paper>

          {/* Quick Add: Feriados Nacionais 2024/2025 */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mt: 2,
              borderRadius: 3,
              border: `2px dashed ${theme.palette.info.main}40`,
              bgcolor: theme.palette.info.main + '05',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💡 Dica: Feriados Nacionais Comuns
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Clique para preencher automaticamente o formulário
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { date: '2024-12-25', label: 'Natal', recurrent: true },
                { date: '2025-01-01', label: 'Ano Novo', recurrent: true },
                { date: '2025-04-21', label: 'Tiradentes', recurrent: true },
                { date: '2025-05-01', label: 'Trabalho', recurrent: true },
                { date: '2025-09-07', label: 'Independência', recurrent: true },
                { date: '2025-10-12', label: 'N. Sra. Aparecida', recurrent: true },
                { date: '2025-11-02', label: 'Finados', recurrent: true },
                { date: '2025-11-15', label: 'Proclamação', recurrent: true },
                { date: '2025-11-20', label: 'Consciência Negra', recurrent: true },
              ].map((holiday) => (
                <Chip
                  key={holiday.date}
                  label={`${holiday.label} (${dayjs(holiday.date).format('DD/MM')})`}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFormData({
                      exceptionDate: holiday.date,
                      reason: `Feriado - ${holiday.label}`,
                      type: 'holiday',
                      isRecurrent: holiday.recurrent,
                      notes: '',
                    });
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, exceptionId: '', description: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Warning sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja excluir a exceção <strong>{deleteDialog.description}</strong>?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }} icon={<Info />}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ℹ️ O que acontece após a exclusão:
            </Typography>
            <Typography variant="caption" display="block">
              A data voltará a ser considerada como <strong>dia normal de funcionamento</strong> para 
              <strong> TODOS os clubes</strong> que funcionam neste dia da semana. 
              As pagelas desta data voltarão a ser cobradas normalmente.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, exceptionId: '', description: '' })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteException.isPending}
            startIcon={deleteException.isPending ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleteException.isPending ? 'Excluindo...' : 'Excluir Exceção'}
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
