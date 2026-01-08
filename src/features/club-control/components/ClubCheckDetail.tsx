import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { PersonOff, CheckCircle, Warning, Error as ErrorIcon, Info } from '@mui/icons-material';
import { ClubCheckResult } from '../api';
import dayjs from 'dayjs';

interface ClubCheckDetailProps {
  open: boolean;
  onClose: () => void;
  clubCheck: ClubCheckResult | null;
  isLoading?: boolean;
}

export const ClubCheckDetail: React.FC<ClubCheckDetailProps> = ({
  open,
  onClose,
  clubCheck,
  isLoading = false,
}) => {
  if (!clubCheck && !isLoading) {
    return null;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ok':
        return {
          icon: <CheckCircle />,
          color: 'success' as const,
          bgcolor: '#4caf5020',
          label: '✅ Completo',
        };
      case 'partial':
        return {
          icon: <Warning />,
          color: 'warning' as const,
          bgcolor: '#ff980020',
          label: '⚠️ Parcial',
        };
      case 'missing':
        return {
          icon: <ErrorIcon />,
          color: 'error' as const,
          bgcolor: '#f4433620',
          label: '🔴 Faltando',
        };
      case 'exception':
        return {
          icon: <Info />,
          color: 'info' as const,
          bgcolor: '#2196f320',
          label: 'ℹ️ Exceção',
        };
      default:
        return {
          icon: <Info />,
          color: 'default' as const,
          bgcolor: '#60606020',
          label: 'Desconhecido',
        };
    }
  };

  const statusConfig = clubCheck ? getStatusConfig(clubCheck.status) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Detalhes do Clube #{clubCheck?.clubNumber}
          </Typography>
          {statusConfig && (
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              color={statusConfig.color}
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : clubCheck ? (
          <Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Informações do Clube
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Dia: ${clubCheck.weekday}`} variant="outlined" />
                <Chip
                  label={`Semana ${clubCheck.week.week}/${clubCheck.week.year}`}
                  variant="outlined"
                />
                <Chip
                  label={dayjs(clubCheck.week.expectedDate).format('DD/MM/YYYY')}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Estatísticas
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#4caf5010', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total de Crianças
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {clubCheck.children.total}
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#2196f310', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Com Pagela
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {clubCheck.children.withPagela}
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ff980020', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sem Pagela
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {clubCheck.children.missing}
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#9c27b010', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Taxa de Completude
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="secondary">
                    {clubCheck.children.total > 0
                      ? Math.round((clubCheck.children.withPagela / clubCheck.children.total) * 100)
                      : 0}%
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {clubCheck.alerts && clubCheck.alerts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Alertas
                </Typography>
                {clubCheck.alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    severity={alert.severity === 'success' ? 'success' : alert.severity}
                    sx={{ mb: 1 }}
                  >
                    {alert.message}
                  </Alert>
                ))}
              </Box>
            )}

            {clubCheck.isException && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Exceção Cadastrada:</strong> {clubCheck.exceptionReason}
                </Typography>
              </Alert>
            )}

            {clubCheck.children.missingList && clubCheck.children.missingList.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Crianças Sem Pagela ({clubCheck.children.missingList.length})
                </Typography>
                <List
                  sx={{
                    maxHeight: 300,
                    overflow: 'auto',
                    bgcolor: '#ff980010',
                    borderRadius: 2,
                    border: '1px solid #ff980050',
                  }}
                >
                  {clubCheck.children.missingList.map((child) => (
                    <ListItem key={child.childId}>
                      <ListItemIcon>
                        <PersonOff color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={child.childName}
                        secondary={`ID: ${child.childId.substring(0, 8)}...`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {clubCheck.status === 'ok' && (
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="body2">
                  🎉 <strong>Parabéns!</strong> Todas as {clubCheck.children.total} crianças tiveram pagela lançada!
                </Typography>
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="error">Erro ao carregar dados do clube.</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Paper = ({ children, ...props }: any) => {
  return <Box {...props}>{children}</Box>;
};

