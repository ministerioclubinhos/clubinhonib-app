import React from 'react';
import { PAGE_WIDTH } from './constants';
import { Box, Container, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { CalendarMonth, EventBusy } from '@mui/icons-material';
import { QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ExceptionManagement, PeriodManagement } from './components';
import { queryClient } from '../../config/queryClient';
import {
  ACADEMIC_CALENDAR_DEFAULT_TAB,
  ACADEMIC_CALENDAR_TAB_PARAM,
  ACADEMIC_CALENDAR_TEXTS,
  AcademicCalendarTab,
} from './constants';
import { parseAcademicCalendarTab } from './utils';

/**
 * Calendário do clubinho: o período letivo do ano e os dias em que não há
 * clubinho (feriado, recesso…). É o que o controle de pagelas usa para saber
 * quando uma pagela é esperada — por isso mora numa tela própria, e o controle
 * fica só com a conferência das pagelas.
 */
const AcademicCalendarContent: React.FC = () => {
  const theme = useTheme();
  const [params, setParams] = useSearchParams();
  const tab = parseAcademicCalendarTab(params.get(ACADEMIC_CALENDAR_TAB_PARAM));

  const changeTab = (_event: React.SyntheticEvent, next: AcademicCalendarTab) => {
    const nextParams = new URLSearchParams(params);
    if (next === ACADEMIC_CALENDAR_DEFAULT_TAB) nextParams.delete(ACADEMIC_CALENDAR_TAB_PARAM);
    else nextParams.set(ACADEMIC_CALENDAR_TAB_PARAM, next);
    setParams(nextParams, { replace: true });
  };

  return (
    <Container
      data-testid="academic-calendar-page"
      maxWidth={false}
      sx={{ py: { xs: 2, sm: 4 }, px: 0, width: PAGE_WIDTH }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          mb: { xs: 1.5, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
          border: `1px solid ${theme.palette.primary.main}40`,
        }}
      >
        <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' } }}>
          {ACADEMIC_CALENDAR_TEXTS.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {ACADEMIC_CALENDAR_TEXTS.intro}
        </Typography>

        <Tabs
          value={tab}
          onChange={changeTab}
          variant="fullWidth"
          data-testid="academic-calendar-tabs"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            mt: 1.5,
            minHeight: 48,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 48, px: 1 },
          }}
        >
          <Tab
            value={AcademicCalendarTab.Periods}
            data-testid="academic-calendar-tab-periodo"
            icon={<CalendarMonth />}
            iconPosition="start"
            label={ACADEMIC_CALENDAR_TEXTS.periodsTab}
          />
          <Tab
            value={AcademicCalendarTab.Exceptions}
            data-testid="academic-calendar-tab-excecoes"
            icon={<EventBusy />}
            iconPosition="start"
            label={ACADEMIC_CALENDAR_TEXTS.exceptionsTab}
          />
        </Tabs>
      </Paper>

      <Box role="tabpanel">
        {tab === AcademicCalendarTab.Periods ? <PeriodManagement /> : <ExceptionManagement />}
      </Box>
    </Container>
  );
};

const AcademicCalendarPage: React.FC = () => (
  <QueryClientProvider data-testid="club-control-academic-calendar-page" client={queryClient}>
    <AcademicCalendarContent />
  </QueryClientProvider>
);

export default AcademicCalendarPage;
