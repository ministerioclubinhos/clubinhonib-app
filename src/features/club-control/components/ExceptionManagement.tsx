import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid2,
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
  useTheme,
  FormControlLabel,
  Checkbox,
  TablePagination,
  Snackbar,
  Alert as MuiAlert,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import { SimpleDatePicker } from '@/components/common/inputs';
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
import { getClubControlErrorMessage } from '../errorMessage';
import ExceptionDeleteDialog from './ExceptionDeleteDialog';
import { SUGGESTED_HOLIDAYS } from '../constants';

const EXCEPTION_TYPES = [
  { value: 'holiday', label: 'Feriado', icon: <EventBusy />, color: '#ff9800' },
  { value: 'event', label: 'Evento', icon: <Event />, color: '#2196f3' },
  { value: 'vacation', label: 'Férias', icon: <BeachAccess />, color: '#4caf50' },
  { value: 'maintenance', label: 'Manutenção', icon: <Build />, color: '#9c27b0' },
  { value: 'other', label: 'Outro', icon: <Help />, color: '#607d8b' },
];

export const ExceptionManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = React.useState({
    exceptionDate: '',
    reason: '',
    type: 'holiday' as 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other',
    isRecurrent: false,
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

  const { data: exceptionsData, isLoading, isError, refetch } = useWeekdayExceptions({ page, limit });
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
        isRecurrent: false,
        notes: '',
      });

      setSnackbar({
        open: true,
        message: `Exceção cadastrada com sucesso! A data ${dateFormatted} (${weekday}) não terá funcionamento para TODOS os clubinhos deste dia.`,
        severity: 'success',
      });
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: getClubControlErrorMessage(error, 'Não foi possível cadastrar a exceção.'),
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
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: getClubControlErrorMessage(error, 'Não foi possível excluir a exceção.'),
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
    <Box data-testid="club-control-exception-management">

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: `2px solid ${theme.palette.warning.main}30`,
          bgcolor: theme.palette.warning.main + '08',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 2,
              bgcolor: theme.palette.warning.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <EventBusy sx={{ fontSize: { xs: 24, sm: 32 }, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
              🚫 Exceções GLOBAIS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Datas em que TODOS os clubinhos não funcionarão
            </Typography>
          </Box>
        </Box>
      </Paper>

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
          • Uma exceção por data afeta <strong>TODOS os clubinhos</strong> daquele dia da semana
        </Typography>
        <Typography variant="caption" display="block">
          • Ex: Feriado em 15/11 (quarta) → todos os clubinhos de quarta não funcionam
        </Typography>
        <Typography variant="caption" display="block">
          • Exceções <strong>não afetam</strong> estatísticas de regularidade
        </Typography>
      </Alert>

      <Grid2 container spacing={{ xs: 2, sm: 3 }}>

        <Grid2 size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `2px solid ${theme.palette.warning.main}40`,
              bgcolor: theme.palette.warning.main + '05',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: 2,
                  bgcolor: theme.palette.warning.main,
                  display: 'flex',
                  flexShrink: 0,
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
                  Válida para todos os clubinhos
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid2 container spacing={2}>
                <Grid2 size={12}>
                  <SimpleDatePicker
                    value={formData.exceptionDate}
                    onChange={(value) => setFormData({ ...formData, exceptionDate: value })}
                    label="Data da Exceção"
                    required
                    margin="none"
                    helperText="Data em que NENHUM clube funcionará"
                  />
                </Grid2>

                <Grid2 size={12}>
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
                </Grid2>

                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Motivo"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    placeholder="Ex: Feriado - Proclamação da República"
                    helperText="Descreva o motivo da exceção"
                  />
                </Grid2>

                <Grid2 size={12}>
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
                          Repetir esta data todo ano (ex: feriados nacionais).
                          Deixe desmarcado para uma data única
                        </Typography>
                      </Box>
                    }
                  />
                </Grid2>

                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Informações adicionais (opcional)"
                  />
                </Grid2>

                <Grid2 size={12}>
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
                </Grid2>
              </Grid2>
            </form>

            <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
              <Typography variant="caption">
                <strong>Atenção:</strong> Esta exceção será aplicada para TODOS os clubinhos que funcionam no dia da semana selecionado.
              </Typography>
            </Alert>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 7 }}>
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
              ) : isError ? (
                <Alert
                  severity="error"
                  action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
                >
                  Não foi possível carregar as exceções.
                </Alert>
              ) : !exceptions || exceptions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Nenhuma exceção cadastrada
                  </Typography>
                  <Typography variant="caption">
                    Cadastre datas em que NENHUM clube funcionará.
                  </Typography>
                </Alert>
              ) : isMobile ? (

                <Stack spacing={2}>
                  {exceptions
                    .sort((a, b) => new Date(b.exceptionDate).getTime() - new Date(a.exceptionDate).getTime())
                    .map((exception) => {
                      const typeConfig = getTypeConfig(exception.type);
                      const isPast = dayjs(exception.exceptionDate).isBefore(dayjs(), 'day');
                      const weekday = dayjs(exception.exceptionDate).format('dddd');

                      return (
                        <Card key={exception.id} elevation={2} sx={{ borderRadius: 2, opacity: isPast ? 0.7 : 1 }}>
                          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <Stack spacing={1.5}>

                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    {dayjs(exception.exceptionDate).format('DD/MM/YYYY')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    {weekday}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {isPast && (
                                    <Chip label="Passado" size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                                  )}
                                  {exception.isRecurrent && (
                                    <Chip
                                      icon={<Repeat />}
                                      label="Recorrente"
                                      size="small"
                                      color="info"
                                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    />
                                  )}
                                </Box>
                              </Box>

                              <Divider />

                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  Tipo
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip
                                    icon={typeConfig.icon}
                                    label={typeConfig.label}
                                    size="small"
                                    sx={{ bgcolor: typeConfig.color + '20', color: typeConfig.color, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  />
                                </Box>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  Motivo
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {exception.reason}
                                </Typography>
                                {exception.notes && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                    {exception.notes}
                                  </Typography>
                                )}
                              </Box>

                              <Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Delete />}
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      exceptionId: exception.id,
                                      description: `${dayjs(exception.exceptionDate).format('DD/MM/YYYY')} - ${exception.reason}`,
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
                                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                  {dayjs(exception.exceptionDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{exception.reason}</Typography>
                                {exception.notes && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
                                 aria-label="Excluir">
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

              {exceptionsData && exceptionsData.total > 0 && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 1, sm: 0 } }}>
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
              {SUGGESTED_HOLIDAYS.map((holiday) => (
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
        </Grid2>
      </Grid2>

      <ExceptionDeleteDialog
        open={deleteDialog.open}
        description={deleteDialog.description}
        loading={deleteException.isPending}
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteDialog({ open: false, exceptionId: '', description: '' })
        }
      />

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
