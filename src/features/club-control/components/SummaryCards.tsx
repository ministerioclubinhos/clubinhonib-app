import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Cancel,
  HourglassEmpty,
  EventAvailable,
  TrendingUp,
  Groups,
} from '@mui/icons-material';
import { WeekCheckResult } from '../api';

interface SummaryCardsProps {
  summary: WeekCheckResult['summary'];
  overallCompleteness: number;
  childrenWithPagela: number;
  totalChildren: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  overallCompleteness,
  childrenWithPagela,
  totalChildren,
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `2px solid ${theme.palette.success.main}40`,
            bgcolor: theme.palette.success.main + '08',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${theme.palette.success.main}30`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <CheckCircle
                sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.success.main }}
              />
              <Chip
                label={`${((summary.clubsOk / summary.totalClubs) * 100).toFixed(0)}%`}
                size="small"
                sx={{
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            </Stack>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="success.main"
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
            >
              {summary.clubsOk}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Clubes Completos
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.25}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              de {summary.totalClubs} clubes ativos
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {summary.clubsPending !== undefined && summary.clubsPending > 0 && (
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: `2px solid ${theme.palette.info.main}40`,
              bgcolor: theme.palette.info.main + '08',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${theme.palette.info.main}30`,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <HourglassEmpty
                  sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.info.main }}
                />
                <Chip
                  label="PENDENTE"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.info.main,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </Stack>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: theme.palette.info.main,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 0.5,
                }}
              >
                {summary.clubsPending}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Clubes Pendentes
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.25}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                ainda dentro do prazo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `2px solid ${theme.palette.warning.main}40`,
            bgcolor: theme.palette.warning.main + '08',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${theme.palette.warning.main}30`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Warning sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.warning.main }} />
              {summary.clubsPartial > 0 && (
                <Chip
                  label="ATENÇÃO"
                  size="small"
                  color="warning"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              )}
            </Stack>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="warning.main"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
            >
              {summary.clubsPartial}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Clubes Parciais
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.25}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              algumas crianças sem pagela
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `2px solid ${theme.palette.error.main}40`,
            bgcolor: theme.palette.error.main + '08',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${theme.palette.error.main}30`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Cancel sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.error.main }} />
              {summary.clubsMissing > 0 && (
                <Chip
                  label="CRÍTICO"
                  size="small"
                  color="error"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              )}
            </Stack>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="error.main"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
            >
              {summary.clubsMissing}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Clubes Faltando
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.25}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              nenhuma pagela lançada
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {summary.clubsInactive > 0 && (
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: `2px solid ${theme.palette.grey[400]}40`,
              bgcolor: theme.palette.grey[100],
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${theme.palette.grey[300]}`,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <HourglassEmpty
                  sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.grey[600] }}
                />
                <Chip
                  label="INFO"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.grey[400],
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </Stack>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="grey.600"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
              >
                {summary.clubsInactive}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Clubes Inativos
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.25}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                sem dia da semana definido
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      {summary.clubsOutOfPeriod > 0 && (
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: `2px solid ${theme.palette.info.light}40`,
              bgcolor: theme.palette.info.light + '10',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${theme.palette.info.light}30`,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <EventAvailable
                  sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.info.light }}
                />
                <Chip
                  label="FÉRIAS"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.info.light,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </Stack>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: theme.palette.info.light,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  mb: 0.5,
                }}
              >
                {summary.clubsOutOfPeriod}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Fora do Período
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.25}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                semana fora do ano letivo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            border: `2px solid ${theme.palette.primary.main}40`,
            bgcolor: theme.palette.primary.main + '08',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${theme.palette.primary.main}30`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <TrendingUp
                sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }}
              />
              <Groups
                sx={{
                  fontSize: { xs: 18, sm: 20 },
                  color: theme.palette.primary.main,
                  opacity: 0.5,
                }}
              />
            </Stack>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
            >
              {overallCompleteness.toFixed(1)}%
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1 }}
            >
              Completude Geral
            </Typography>
            <LinearProgress
              variant="determinate"
              value={overallCompleteness}
              sx={{
                height: { xs: 6, sm: 8 },
                borderRadius: 4,
                bgcolor: theme.palette.primary.main + '20',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor:
                    overallCompleteness >= 80
                      ? theme.palette.success.main
                      : overallCompleteness >= 50
                        ? theme.palette.warning.main
                        : theme.palette.error.main,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.75}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              {childrenWithPagela} de {totalChildren} crianças
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
