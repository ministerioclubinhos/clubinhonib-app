import type { CoordinatorResponse } from '@/features/coordinators/types';
import {
  DEFAULT_PLAIN_PERIOD,
  DEFAULT_STATISTICS_TAB,
  PLAIN_PERIOD_OPTIONS,
  RATE_TONE_THRESHOLDS,
  RateTone,
  StatisticsTab,
  Tone,
  WEEK_COLUMNS_MAX,
} from '../constants';
import type { ClubStat, PeriodShortcut, WeeklyPagelaStats } from '../types';
import { weightedAverageRate } from './rates';

/**
 * Contas e traduções da página de estatísticas para quem não é da área.
 *
 * Funções puras: nada de React, nada de tema.
 */

const isNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** `84.4` → `84%`. Sem dado, `null`: o chamador escolhe o que mostrar. */
export function formatPercent(rate: number | null | undefined): string | null {
  return isNumber(rate) ? `${Math.round(rate)}%` : null;
}

/** `84.4` → `8`: a porcentagem lida como "quantos em cada dez". */
export function outOfTen(rate: number | null | undefined): number | null {
  return isNumber(rate) ? Math.min(10, Math.max(0, Math.round(rate / 10))) : null;
}

/** Como ler uma presença: vai bem, pode melhorar ou precisa de atenção. */
export function rateTone(rate: number | null | undefined): RateTone {
  if (!isNumber(rate)) return RateTone.Low;
  if (rate >= RATE_TONE_THRESHOLDS.good) return RateTone.Good;
  if (rate >= RATE_TONE_THRESHOLDS.medium) return RateTone.Medium;
  return RateTone.Low;
}

/** Uma coluna do gráfico de presença por semana. */
export interface WeekColumn {
  key: string;
  label: string;
  value: number;
  total: number;
}

/**
 * As últimas semanas, da mais antiga para a mais nova.
 *
 * O valor é quantas crianças vieram — não uma taxa, que sem o denominador
 * certo mostrava 0% em semana com gente presente.
 */
export function toWeekColumns(
  weeks: readonly WeeklyPagelaStats[] | undefined,
  max: number = WEEK_COLUMNS_MAX,
): WeekColumn[] {
  return [...(weeks ?? [])]
    .sort((a, b) => a.year - b.year || a.week - b.week)
    .slice(-max)
    .map((item) => ({
      key: `${item.year}-${item.week}`,
      label: `S${item.week}`,
      value: item.presentCount,
      total: item.totalPagelas,
    }));
}

/** Uma linha da lista de coordenadores. */
export interface CoordinatorRow {
  id: string;
  name: string;
  active: boolean;
  clubsCount: number;
  childrenCount: number;
  /** Média da presença dos clubinhos, ponderada pelas pagelas; `null` sem dado. */
  presence: number | null;
}

/**
 * Junta o cadastro de coordenadores com a estatística dos clubinhos.
 *
 * O nome vem do cadastro: a estatística de clubinho devolve "N/A" quando o
 * coordenador não tem nome no recorte. Quem cuida de clubinho e tem a melhor
 * presença vem primeiro; quem não tem clubinho, por último.
 */
export function buildCoordinatorRows(
  coordinators: readonly CoordinatorResponse[],
  clubs: readonly ClubStat[],
): CoordinatorRow[] {
  const statsByClub = new Map(clubs.map((club) => [club.clubId, club]));

  const rows = coordinators.map<CoordinatorRow>((coordinator) => {
    const owned = coordinator.clubs
      .map((club) => statsByClub.get(club.id))
      .filter((club): club is ClubStat => !!club);

    return {
      id: coordinator.id,
      name: coordinator.user.name,
      active: coordinator.active,
      clubsCount: coordinator.clubs.length,
      childrenCount: owned.reduce((sum, club) => sum + club.children.active, 0),
      presence: weightedAverageRate(
        owned.map((club) => ({ total: club.performance.totalPagelas, rate: club.performance.presenceRate })),
        (row) => row.rate,
      ),
    };
  });

  return rows.sort((a, b) => {
    if ((a.clubsCount > 0) !== (b.clubsCount > 0)) return a.clubsCount > 0 ? -1 : 1;
    return (b.presence ?? -1) - (a.presence ?? -1) || a.name.localeCompare(b.name, 'pt-BR');
  });
}

/** Média de clubinhos por coordenador, só entre quem cuida de algum. */
export function averageClubsPerCoordinator(rows: readonly CoordinatorRow[]): number | null {
  const withClubs = rows.filter((row) => row.clubsCount > 0);
  if (withClubs.length === 0) return null;
  return withClubs.reduce((sum, row) => sum + row.clubsCount, 0) / withClubs.length;
}

/** Arredonda para uma casa e tira o ",0": `7.0` → `7`, `7.46` → `7,5`. */
export function formatDecimal(value: number | null | undefined): string | null {
  if (!isNumber(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}

/** A visão pedida na URL; valor desconhecido cai na primeira. */
export function parseStatisticsTab(value: string | null | undefined): StatisticsTab {
  return Object.values(StatisticsTab).find((tab) => tab === value) ?? DEFAULT_STATISTICS_TAB;
}

/** O período pedido na URL; só os três oferecidos valem. */
export function parsePlainPeriod(value: string | null | undefined): PeriodShortcut {
  return PLAIN_PERIOD_OPTIONS.find((option) => option === value) ?? DEFAULT_PLAIN_PERIOD;
}

/** A leitura de uma presença como cor: verde, amarelo ou vermelho. */
export function rateToTone(rate: number | null | undefined): Tone {
  switch (rateTone(rate)) {
    case RateTone.Good:
      return Tone.Success;
    case RateTone.Medium:
      return Tone.Warning;
    default:
      return Tone.Error;
  }
}

/** Sinal de uma variação: sobe é verde, desce é vermelho, igual é neutro. */
export function deltaTone(delta: number | null | undefined): Tone {
  if (delta === null || delta === undefined || !Number.isFinite(delta) || delta === 0) return Tone.Neutral;
  return delta > 0 ? Tone.Success : Tone.Error;
}
