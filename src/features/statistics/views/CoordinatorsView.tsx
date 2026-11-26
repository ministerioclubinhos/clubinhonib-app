import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Tone } from '../constants';
import { attentionTone } from '../utils/alerts';
import { RingList } from '../components/plain/RingList';
import { DataState } from '../components/plain/DataState';
import { Section } from '../components/plain/Section';
import { StatTile, StatTileGrid } from '../components/plain/StatTile';
import { AttentionList } from '../components/plain/AttentionList';
import { useClubAlerts } from './useClubAlerts';
import { ALERT_TEXTS } from '../texts';
import { clubLabel, clubsWithoutCoordinator, weeklyPagelaStatus } from '../utils/alerts';
import type { AttentionItem } from '../types';
import { useCoordinatorsList } from '../hooks';
import { COORDINATORS_TEXTS, STATISTICS_TEXTS } from '../texts';
import type { PeriodShortcut } from '../types';
import {
  averageClubsPerCoordinator,
  buildCoordinatorRows,
  formatDecimal,
  formatPercent,
  rateTone,
} from '../utils/plain';

/** Quantos nomes sem clubinho aparecem antes do "e mais N". */
const WITHOUT_CLUB_SHOWN = 12;

interface CoordinatorsViewProps {
  period: PeriodShortcut;
}

/** Quantos clubinhos cada coordenador cuida e como eles estão indo. */
export const CoordinatorsView: React.FC<CoordinatorsViewProps> = ({ period }) => {
  const coordinators = useCoordinatorsList();
  const alertsData = useClubAlerts({ period });
  const clubs = alertsData.clubs;

  const retry = () => {
    void coordinators.refetch();
    alertsData.refetch();
  };

  const rows = buildCoordinatorRows(coordinators.data?.items ?? [], clubs.data?.clubs ?? []);
  const withClubs = rows.filter((row) => row.clubsCount > 0);
  const withoutClubs = rows.filter((row) => row.clubsCount === 0);
  const average = averageClubsPerCoordinator(rows);

  // Quem coordena clubinho que não lançou a pagela da semana passada.
  const pendingIds = new Set(weeklyPagelaStatus(alertsData.weeks.previousQuery.data).missing.map((club) => club.clubId));
  const pendingCoordinators = (coordinators.data?.items ?? []).filter((coordinator) =>
    coordinator.clubs.some((club) => pendingIds.has(club.id)),
  );
  const noCoordinator = clubsWithoutCoordinator(clubs.data?.clubs ?? []);
  const alerts: AttentionItem[] = [];
  if (pendingCoordinators.length > 0) {
    alerts.push({
      key: 'pending',
      severity: 'error',
      title: ALERT_TEXTS.coordinatorPending(pendingCoordinators.length),
      names: pendingCoordinators.map((coordinator) => coordinator.user.name),
    });
  }
  if (noCoordinator.length > 0) {
    alerts.push({ key: 'no-coordinator', title: ALERT_TEXTS.noCoordinator(noCoordinator.length), names: noCoordinator.map(clubLabel) });
  }
  const clubsOf = new Map((coordinators.data?.items ?? []).map((coordinator) => [coordinator.id, coordinator.clubs]));

  return (
    <DataState
      data-testid="statistics-coordinators-view"
      isLoading={coordinators.isLoading || alertsData.isLoading}
      isError={coordinators.isError || alertsData.isError}
      onRetry={retry}
    >
      <>
        <StatTileGrid>
          <StatTile icon={<BadgeIcon />} tone={Tone.Info} testId="statistics-coordinators-total" title={COORDINATORS_TEXTS.totalTitle} value={rows.length} />
          <StatTile testId="statistics-coordinators-with-clubs" icon={<HomeIcon />} tone={Tone.Success} title={COORDINATORS_TEXTS.withClubsTitle} value={withClubs.length} />
          <StatTile
            testId="statistics-coordinators-without-clubs"
            icon={<LinkOffIcon />}
            tone={withoutClubs.length > 0 ? Tone.Warning : Tone.Success}
            title={COORDINATORS_TEXTS.withoutClubsTitle}
            value={rows.length - withClubs.length}
            hint={COORDINATORS_TEXTS.withoutClubsHint}
          />
          <StatTile
            testId="statistics-coordinators-avg-clubs"
            tone={Tone.Neutral}
            title={COORDINATORS_TEXTS.avgClubsTitle}
            value={formatDecimal(average) ?? STATISTICS_TEXTS.noValue}
            hint={COORDINATORS_TEXTS.avgClubsHint}
          />
        </StatTileGrid>

        <Section testId="statistics-coordinators-attention" title={COORDINATORS_TEXTS.attentionTitle} tone={attentionTone(alerts)}>
          <AttentionList items={alerts} allGoodText={COORDINATORS_TEXTS.attentionNone} />
        </Section>

        <Section testId="statistics-coordinators-list" tone={Tone.Success} title={COORDINATORS_TEXTS.listTitle} help={COORDINATORS_TEXTS.listHelp}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {withClubs.map((row) => (
              <Box key={row.id} data-testid="statistics-coordinators-row" sx={{ display: 'grid', gap: 0.75 }}>
                <RingList
                  items={[
                    {
                      key: row.id,
                      label: row.active ? row.name : `${row.name} (${COORDINATORS_TEXTS.inactive})`,
                      value: row.presence ?? 0,
                      display: formatPercent(row.presence) ?? STATISTICS_TEXTS.noValue,
                      tone: rateTone(row.presence),
                      caption: `${COORDINATORS_TEXTS.clubs(row.clubsCount)} · ${COORDINATORS_TEXTS.children(row.childrenCount)}`,
                    },
                  ]}
                  emptyText={STATISTICS_TEXTS.empty}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {(clubsOf.get(row.id) ?? []).map((club) => (
                    <Chip
                      key={club.id}
                      size="small"
                      variant={pendingIds.has(club.id) ? 'filled' : 'outlined'}
                      color={pendingIds.has(club.id) ? 'error' : 'default'}
                      label={`Clubinho ${club.number}${pendingIds.has(club.id) ? ' · sem pagela' : ''}`}
                    />
                  ))}
                </Box>
              </Box>
            ))}
            {withClubs.length === 0 && <Typography color="text.secondary">{STATISTICS_TEXTS.empty}</Typography>}
          </Box>
        </Section>

        {withoutClubs.length > 0 && (
          <Section
            testId="statistics-coordinators-without" tone={Tone.Warning}
            title={COORDINATORS_TEXTS.withoutTitle}
            help={COORDINATORS_TEXTS.withoutHelp}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {withoutClubs.slice(0, WITHOUT_CLUB_SHOWN).map((row) => (
                <Chip key={row.id} label={row.name} variant="outlined" />
              ))}
              {withoutClubs.length > WITHOUT_CLUB_SHOWN && (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {COORDINATORS_TEXTS.withoutMore(withoutClubs.length - WITHOUT_CLUB_SHOWN)}
                </Typography>
              )}
            </Box>
          </Section>
        )}
      </>
    </DataState>
  );
};
