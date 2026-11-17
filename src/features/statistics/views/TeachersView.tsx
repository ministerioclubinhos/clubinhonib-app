import React from 'react';
import { type BarItem } from '../components/plain/BarList';
import { RingList } from '../components/plain/RingList';
import { DotsList } from '../components/plain/DotsList';
import { DataState } from '../components/plain/DataState';
import { Section, SectionGrid } from '../components/plain/Section';
import { StatTile, StatTileGrid } from '../components/plain/StatTile';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { LIST_FETCH_LIMIT, Tone } from '../constants';
import { attentionTone } from '../utils/alerts';
import { AttentionList } from '../components/plain/AttentionList';
import { useClubs, useOverview, useTeachers } from '../hooks';
import { ALERT_TEXTS } from '../texts';
import { clubLabel, clubsWithoutTeacher, daysSince, formatDaysAgo } from '../utils/alerts';
import type { AttentionItem } from '../types';
import { STATISTICS_TEXTS, TEACHERS_TEXTS } from '../texts';
import type { PeriodShortcut } from '../types';

interface TeachersViewProps {
  period: PeriodShortcut;
}

const TOP_SIZE = 10;

/** Quem está lançando as pagelas e em quais clubinhos. */
export const TeachersView: React.FC<TeachersViewProps> = ({ period }) => {
  const overview = useOverview();
  const teachers = useTeachers({ period, limit: LIST_FETCH_LIMIT });
  const clubs = useClubs({ period, limit: LIST_FETCH_LIMIT });

  const retry = () => {
    void overview.refetch();
    void teachers.refetch();
    void clubs.refetch();
  };

  const list = teachers.data?.teachers ?? [];
  const launched = list.filter((teacher) => teacher.performance.totalPagelas > 0);
  const idle = list.filter((teacher) => teacher.performance.totalPagelas === 0);

  const topItems: BarItem[] = [...launched]
    .sort((a, b) => b.performance.totalPagelas - a.performance.totalPagelas)
    .slice(0, TOP_SIZE)
    .map((teacher) => ({
      key: teacher.teacherId,
      label: teacher.name,
      value: teacher.performance.totalPagelas,
      display: TEACHERS_TEXTS.pagelas(teacher.performance.totalPagelas),
      caption: [teacher.club ? `Clubinho ${teacher.club.number}` : null, `Última pagela: ${formatDaysAgo(daysSince(teacher.lastActivity?.date))}`]
        .filter(Boolean)
        .join(' · '),
    }));

  const byClub: BarItem[] = [...(teachers.data?.distribution.byClub ?? [])]
    .sort((a, b) => b.count - a.count)
    .map((club) => ({
      key: club.clubId,
      label: `Clubinho ${club.clubNumber}`,
      value: club.count,
      display: `${club.count}`,
    }));

  const noTeacher = clubsWithoutTeacher(clubs.data?.clubs ?? [], teachers.data?.distribution.byClub ?? []);
  const alerts: AttentionItem[] = [];
  if (noTeacher.length > 0) {
    alerts.push({ key: 'no-teacher', severity: 'error', title: ALERT_TEXTS.noTeacher(noTeacher.length), names: noTeacher.map(clubLabel) });
  }
  if (idle.length > 0) {
    alerts.push({
      key: 'idle',
      title: TEACHERS_TEXTS.idleAlert(idle.length),
      detail: TEACHERS_TEXTS.idleHelp,
      names: idle.map((teacher) => teacher.name),
    });
  }


  return (
    <DataState data-testid="statistics-teachers-view" isLoading={teachers.isLoading || overview.isLoading || clubs.isLoading} isError={teachers.isError || overview.isError || clubs.isError} onRetry={retry}>
      <>
        <StatTileGrid>
          <StatTile
            testId="statistics-teachers-total"
            icon={<SchoolIcon />}
            tone={Tone.Info}
            title={TEACHERS_TEXTS.totalTitle}
            value={overview.data?.summary.totalTeachers ?? STATISTICS_TEXTS.noValue}
            hint={TEACHERS_TEXTS.totalHint(list.length)}
          />
          <StatTile
            testId="statistics-teachers-launched"
            icon={<EditNoteIcon />}
            tone={Tone.Success}
            title={TEACHERS_TEXTS.launchedTitle}
            value={launched.length}
            hint={TEACHERS_TEXTS.launchedHint}
          />
          <StatTile
            testId="statistics-teachers-idle"
            icon={<GroupsIcon />}
            tone={idle.length > 0 ? Tone.Warning : Tone.Success}
            title={TEACHERS_TEXTS.notLaunchedTitle}
            value={idle.length}
            hint={TEACHERS_TEXTS.notLaunchedHint}
          />
        </StatTileGrid>

        <Section testId="statistics-teachers-attention" title={TEACHERS_TEXTS.attentionTitle} tone={attentionTone(alerts)}>
          <AttentionList items={alerts} allGoodText={TEACHERS_TEXTS.none} />
        </Section>

        <SectionGrid>
          <Section testId="statistics-teachers-top" tone={Tone.Success} title={TEACHERS_TEXTS.topTitle} help={TEACHERS_TEXTS.topHelp}>
            <RingList rank medals items={topItems} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-teachers-by-club" title={TEACHERS_TEXTS.byClubTitle}>
            <DotsList items={byClub} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
        </SectionGrid>
      </>
    </DataState>
  );
};
