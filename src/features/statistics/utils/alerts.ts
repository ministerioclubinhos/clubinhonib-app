import { LOW_PRESENCE_THRESHOLD, STALE_CLUB_DAYS, Tone } from '../constants';
import {
  WeeklyClubStatus,
  type AttentionItem,
  type ClubStat,
  type WeeklyAttendanceDto,
  type WeekColumnLike,
} from '../types';

/**
 * Os avisos da página: contas puras que dizem **quem** precisa de atenção.
 * Nada de React, nada de tema.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type WeeklyClub = WeeklyAttendanceDto['clubs'][number];

/** Quantos dias inteiros se passaram desde `iso`; `null` sem data válida. */
export function daysSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((now.getTime() - time) / MS_PER_DAY));
}

/** `0` → "hoje", `1` → "ontem", `5` → "há 5 dias". */
export function formatDaysAgo(days: number | null): string {
  if (days === null) return 'nunca';
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

/** A semana anterior à letiva dada; `null` na primeira semana do ano. */
export function previousWeek(year: number, week: number): { year: number; week: number } | null {
  return week > 1 ? { year, week: week - 1 } : null;
}

/** Como ficou a pagela de uma semana: quem lançou, quem não, quem lançou só em parte. */
export interface WeeklyPagelaStatus {
  launched: number;
  expected: number;
  missing: WeeklyClub[];
  partial: WeeklyClub[];
}

/**
 * Só conta quem era esperado: clubinho pendente (dia ainda não chegou), de
 * férias, inativo ou fora do ano letivo não é falta.
 */
export function weeklyPagelaStatus(weekly: WeeklyAttendanceDto | undefined): WeeklyPagelaStatus {
  const clubs = weekly?.clubs ?? [];
  const missing = clubs.filter((club) => club.status === WeeklyClubStatus.Missing);
  const partial = clubs.filter((club) => club.status === WeeklyClubStatus.Partial);
  const launched = clubs.filter((club) => club.status === WeeklyClubStatus.Ok).length;

  return { launched, expected: launched + missing.length + partial.length, missing, partial };
}

/** Clubinhos com pagelas no período e presença abaixo do limite, os piores primeiro. */
export function lowPresenceClubs(clubs: readonly ClubStat[], threshold = LOW_PRESENCE_THRESHOLD): ClubStat[] {
  return clubs
    .filter((club) => club.performance.totalPagelas > 0 && club.performance.presenceRate < threshold)
    .sort((a, b) => a.performance.presenceRate - b.performance.presenceRate);
}

/** Clubinhos com crianças que não lançam pagela há `days` dias ou mais (ou nunca lançaram). */
export function staleClubs(
  clubs: readonly ClubStat[],
  now: Date = new Date(),
  days = STALE_CLUB_DAYS,
): ClubStat[] {
  return clubs
    .filter((club) => club.children.active > 0)
    .filter((club) => {
      const since = daysSince(club.lastActivity?.date, now);
      return since === null || since >= days;
    });
}

/** Clubinhos sem nenhuma criança ativa. */
export const clubsWithoutChildren = (clubs: readonly ClubStat[]): ClubStat[] =>
  clubs.filter((club) => club.children.active === 0);

/** Clubinhos sem coordenador ligado. */
export const clubsWithoutCoordinator = (clubs: readonly ClubStat[]): ClubStat[] =>
  clubs.filter((club) => !club.coordinator);

/** Clubinhos que não aparecem na contagem de professores. */
export function clubsWithoutTeacher(
  clubs: readonly ClubStat[],
  teachersByClub: ReadonlyArray<{ clubId: string; count: number }>,
): ClubStat[] {
  const covered = new Set(teachersByClub.filter((row) => row.count > 0).map((row) => row.clubId));
  return clubs.filter((club) => !covered.has(club.clubId));
}

/** Diferença entre a última semana e a anterior; `null` com menos de duas semanas. */
export function weekDelta(columns: readonly WeekColumnLike[]): number | null {
  if (columns.length < 2) return null;
  return columns[columns.length - 1].value - columns[columns.length - 2].value;
}

/** "Clubinho 1133" — o nome curto usado nos avisos. */
export const clubLabel = (club: { clubNumber: number }): string => `Clubinho ${club.clubNumber}`;

/** A cor do conjunto de avisos: vermelho se algum é grave, amarelo se há avisos, verde sem nenhum. */
export function attentionTone(items: readonly AttentionItem[]): Tone {
  if (items.some((item) => item.severity === 'error')) return Tone.Error;
  return items.length > 0 ? Tone.Warning : Tone.Success;
}
