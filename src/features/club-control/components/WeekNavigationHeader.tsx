import React from 'react';
import {
  Paper,
  Typography,
  Chip,
  Stack,
  Box,
  IconButton,
  Button,
  Tooltip,
  useTheme,
} from '@mui/material';
import { CalendarToday, NavigateBefore, NavigateNext, Refresh, Info } from '@mui/icons-material';
import dayjs from 'dayjs';

interface WeekNavigationHeaderProps {
  academicWeek: number | null;
  academicYear: number | null;
  calendarWeek: { year: number; week: number };
  weekStart: dayjs.Dayjs;
  weekEnd: dayjs.Dayjs;
  isCurrentWeek: boolean;
  isWithinPeriod?: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToCurrent: () => void;
  onRefresh: () => void;
}

export const WeekNavigationHeader: React.FC<WeekNavigationHeaderProps> = ({
  academicWeek,
  academicYear,
  calendarWeek,
  weekStart,
  weekEnd,
  isCurrentWeek,
  isWithinPeriod,
  onPrevWeek,
  onNextWeek,
  onGoToCurrent,
  onRefresh,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: 3,
        border: `2px solid ${theme.palette.primary.main}30`,
        bgcolor: theme.palette.primary.main + '08',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <CalendarToday
            sx={{ fontSize: { xs: 24, sm: 32 }, color: theme.palette.primary.main, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {academicWeek !== null && academicYear !== null ? (
              <>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                    flexWrap: 'wrap',
                    fontSize: { xs: '1.1rem', sm: '1.5rem' },
                  }}
                >
                  <Box component="span">
                    Semana {academicWeek} do Ano Letivo {academicYear}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {isCurrentWeek && (
                      <Chip
                        label="ATUAL"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                    {isWithinPeriod && (
                      <Chip
                        label="Dentro do Período"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                    {isWithinPeriod === false && (
                      <Chip
                        label="Fora do Período"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {weekStart.format('DD [de] MMMM')} até {weekEnd.format('DD [de] MMMM [de] YYYY')}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Info sx={{ fontSize: 12 }} />
                  Semana {calendarWeek.week} do ano calendário {calendarWeek.year}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    fontSize: { xs: '1.1rem', sm: '1.5rem' },
                  }}
                >
                  <Box component="span">
                    {academicWeek !== null && academicYear !== null ? (
                      <>
                        Semana {academicWeek} do Ano Letivo {academicYear}
                      </>
                    ) : (
                      <>
                        Semana {calendarWeek.week} de {calendarWeek.year}
                      </>
                    )}
                  </Box>
                  {isCurrentWeek && (
                    <Chip label="ATUAL" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {weekStart.format('DD [de] MMMM')} até {weekEnd.format('DD [de] MMMM [de] YYYY')}
                </Typography>
                {academicWeek !== null && academicYear !== null && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Info sx={{ fontSize: 12 }} />
                    Semana {calendarWeek.week} do ano calendário {calendarWeek.year}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
          }}
        >
          <Tooltip title="Semana anterior">
            <IconButton onClick={onPrevWeek} size="medium" sx={{ bgcolor: 'white' }}>
              <NavigateBefore />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            onClick={onGoToCurrent}
            sx={{ px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Ir para Atual
          </Button>
          <Tooltip title="Próxima semana">
            <IconButton onClick={onNextWeek} size="medium" sx={{ bgcolor: 'white' }}>
              <NavigateNext />
            </IconButton>
          </Tooltip>
          <Tooltip title="Atualizar dados">
            <IconButton onClick={onRefresh} color="primary" size="medium" sx={{ bgcolor: 'white' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};
