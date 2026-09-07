import { fmtBR } from '@/utils/dateUtils';

import {
  ALL_CLUBS_OPTION,
  WEEK_STATUSES_WITH_MEETING,
  WEEK_STATUSES_WITH_PENDENCY,
  WEEK_STATUS_SEVERITY_ORDER,
  WEEK_STATUS_DESCRIPTIONS,
  WEEK_STATUS_LABELS,
  WEEK_STATUS_SEVERITY,
} from './constants';
import {
  ClubWeekStatus,
  ClubWeekTimeline,
  type ClubWeeklySummaryCell,
  type ClubWeeklySummaryClub,
  type ClubWeeklySummaryQuery,
  type ClubRangeSummary,
  type ClubWeeklySummaryCounts,
  type ClubWeeklySummaryWeek,
  type RangeTotals,
  type WeekCoveragePoint,
  type WeekRange,
  RangeGranularity,
} from './types';

/**
 * Regras puras do resumo semanal.
 *
 * Nenhuma delas toca React: é o que permite conferir por teste o que a tela
 * mostra — quais semanas aparecem, o que é pendência, como um percentual vira
 * texto.
 */

/** Rótulo da situação; uma situação desconhecida vira "Indefinido". */
export function weekStatusLabel(status: ClubWeekStatus): string {
  return WEEK_STATUS_LABELS[status] ?? 'Indefinido';
}

/** Explicação da situação, para o `title` da célula. */
export function weekStatusDescription(status: ClubWeekStatus): string {
  return WEEK_STATUS_DESCRIPTIONS[status] ?? 'Situação não reconhecida';
}

/** Gravidade da situação, no vocabulário do MUI. */
export function weekStatusSeverity(
  status: ClubWeekStatus,
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  return WEEK_STATUS_SEVERITY[status] ?? 'default';
}

/**
 * Se a célula pede atenção de quem coordena.
 *
 * `pending` fica de fora: o dia do clubinho ainda não chegou, e cobrar aí
 * faria toda segunda-feira parecer um problema.
 */
export function cellHasPendency(cell: ClubWeeklySummaryCell): boolean {
  return WEEK_STATUSES_WITH_PENDENCY.includes(cell.status);
}

/** Se algum clubinho ficou devendo pagela na semana. */
export function weekHasPendency(week: ClubWeeklySummaryWeek): boolean {
  return week.clubs.some(cellHasPendency);
}

/**
 * As semanas que a tela mostra.
 *
 * As futuras ficam escondidas por padrão: elas ainda não aconteceram, e uma
 * fila de semanas "aguardando" empurra para baixo justamente as que já
 * fecharam — que são o assunto da tela.
 */
export function visibleWeeks(
  weeks: readonly ClubWeeklySummaryWeek[],
  includeFuture: boolean,
): ClubWeeklySummaryWeek[] {
  return weeks.filter(
    (week) => includeFuture || week.timeline !== ClubWeekTimeline.Future,
  );
}

/** Rótulo curto da semana, para o eixo do gráfico. */
export function weekShortLabel(week: number): string {
  return `S${week}`;
}

/** Intervalo da semana em `dd/mm/aaaa a dd/mm/aaaa`. */
export function weekRangeLabel(week: ClubWeeklySummaryWeek): string {
  return `${fmtBR(week.startDate)} a ${fmtBR(week.endDate)}`;
}

/** Percentual em português, com uma casa decimal e sem `.0` sobrando. */
export function formatRate(rate: number): string {
  const rounded = Math.round(rate * 10) / 10;
  return `${rounded.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

/** Número inteiro em português. */
export function formatCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

/**
 * A série da linha do tempo de cobertura.
 *
 * Uma medida só — o percentual de pagelas lançadas —, porque duas escalas
 * diferentes no mesmo eixo não se comparam. Quantidade de crianças tem o seu
 * lugar no quadro, abaixo.
 */
export function buildCoverageSeries(
  weeks: readonly ClubWeeklySummaryWeek[],
): WeekCoveragePoint[] {
  return weeks.map((week) => ({
    week: week.week,
    label: weekShortLabel(week.week),
    completionRate: week.counts.completionRate,
    timeline: week.timeline,
  }));
}

/**
 * A consulta enviada à API.
 *
 * "Todos os clubinhos" não vira parâmetro: o endpoint sem `clubId` já responde
 * pelo conjunto inteiro que a sessão enxerga, e mandar a palavra `all` seria
 * um id inválido.
 */
export function buildSummaryQuery(
  year: number | null,
  clubId: string,
): ClubWeeklySummaryQuery {
  const query: ClubWeeklySummaryQuery = {};

  if (year !== null) query.year = year;
  if (clubId !== ALL_CLUBS_OPTION) query.clubId = clubId;

  return query;
}

/**
 * A situação que representa a semana inteira: a pior entre os clubinhos.
 *
 * Uma semana em que um clubinho não lançou nada não pode aparecer em verde na
 * faixa do ano só porque os outros dois fecharam — é justamente essa semana
 * que quem coordena precisa achar.
 *
 * Semana sem clubinho nenhum devolve `out_of_period`: não há situação a
 * mostrar, e é o valor neutro do vocabulário.
 */
export function weekOverallStatus(week: ClubWeeklySummaryWeek): ClubWeekStatus {
  const present = new Set(week.clubs.map((cell) => cell.status));

  return (
    WEEK_STATUS_SEVERITY_ORDER.find((status) => present.has(status)) ??
    ClubWeekStatus.OutOfPeriod
  );
}

/** Quantos clubinhos ficaram devendo pagela na semana. */
export function weekPendencyCount(week: ClubWeeklySummaryWeek): number {
  return week.clubs.filter(cellHasPendency).length;
}

/**
 * O quadro sem os clubinhos desativados.
 *
 * Um clubinho desativado não tem o que reportar: não é pendência, não vai
 * virar uma, e nunca muda de situação. Numa base com dez deles e quatro
 * ativos, deixá-los na tela transforma cada semana numa fileira de "Desativado"
 * — e o que importa fica escondido no meio. Continua possível mostrá-los,
 * porque um clubinho pode ter sido desativado no meio do ano e quem coordena
 * precisa achar o histórico dele.
 */
export function onlyActiveClubs(
  clubs: readonly ClubWeeklySummaryClub[],
): ClubWeeklySummaryClub[] {
  return clubs.filter((club) => club.isActive);
}

/** As mesmas semanas, sem as células dos clubinhos ocultos. */
export function keepClubs(
  weeks: readonly ClubWeeklySummaryWeek[],
  clubs: readonly ClubWeeklySummaryClub[],
): ClubWeeklySummaryWeek[] {
  const visible = new Set(clubs.map((club) => club.clubId));

  return weeks.map((week) => ({
    ...week,
    clubs: week.clubs.filter((cell) => visible.has(cell.clubId)),
  }));
}

/**
 * Percentual de uma parte sobre um total, com uma casa decimal.
 *
 * Denominador zero devolve `0`, e não `NaN`: um recorte sem criança a atender
 * aparece com 0%, que é o que a tela deve mostrar.
 */
export function completionRateOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

/**
 * A soma de vários recortes, com o percentual recalculado sobre o total.
 *
 * Nunca a média dos percentuais: 1 de 1 somado a 0 de 9 é 10%, não 50%.
 */
export function sumCounts(
  parts: readonly ClubWeeklySummaryCounts[],
): ClubWeeklySummaryCounts {
  const children = parts.reduce((total, part) => total + part.children, 0);
  const withPagela = parts.reduce(
    (total, part) => total + part.childrenWithPagela,
    0,
  );
  const present = parts.reduce(
    (total, part) => total + part.childrenPresent,
    0,
  );

  return {
    children,
    childrenWithPagela: withPagela,
    childrenMissing: children - withPagela,
    childrenPresent: present,
    completionRate: completionRateOf(withPagela, children),
  };
}

/* ------------------------------------------------------------------ *
 * Recortes de tempo
 * ------------------------------------------------------------------ */

/** Mês (1 a 12) em que a semana começa. */
function monthOf(week: ClubWeeklySummaryWeek): number {
  return Number(week.startDate.slice(5, 7));
}

/** Ano em que a semana começa. */
function yearOf(week: ClubWeeklySummaryWeek): number {
  return Number(week.startDate.slice(0, 4));
}

/** O mês por extenso, a partir de `YYYY-MM-DD` — sem passar por fuso. */
function monthLabel(startDate: string): string {
  const [year, month] = startDate.split('-').map(Number);
  const nome = new Date(year, month - 1, 15).toLocaleDateString('pt-BR', {
    month: 'long',
  });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${year}`;
}

/**
 * As semanas agrupadas no recorte pedido.
 *
 * A semana é sempre a unidade — mês e trimestre apenas juntam as semanas que
 * **começam** dentro deles. Fatiar por dia de calendário partiria uma semana
 * letiva ao meio, e não existe meia semana no controle de pagela.
 */
export function buildRanges(
  weeks: readonly ClubWeeklySummaryWeek[],
  granularity: RangeGranularity,
  year: number,
): WeekRange[] {
  if (weeks.length === 0) return [];

  if (granularity === RangeGranularity.Year) {
    return [
      {
        id: `year:${year}`,
        label: `Ano letivo ${year}`,
        caption: `${weeks.length} semana(s) letiva(s)`,
        weeks: [...weeks],
      },
    ];
  }

  if (granularity === RangeGranularity.Week) {
    return weeks.map((week) => ({
      id: `week:${week.week}`,
      label: `Semana ${week.week}`,
      caption: weekRangeLabel(week),
      weeks: [week],
    }));
  }

  const grouped = new Map<string, ClubWeeklySummaryWeek[]>();
  for (const week of weeks) {
    const key =
      granularity === RangeGranularity.Month
        ? `${yearOf(week)}-${String(monthOf(week)).padStart(2, '0')}`
        : `${yearOf(week)}-${Math.ceil(monthOf(week) / 3)}`;
    const list = grouped.get(key) ?? [];
    list.push(week);
    grouped.set(key, list);
  }

  return [...grouped.entries()].map(([key, group]) => {
    const primeira = group[0];
    const ultima = group[group.length - 1];
    const label =
      granularity === RangeGranularity.Month
        ? monthLabel(primeira.startDate)
        : `${Math.ceil(monthOf(primeira) / 3)}º trimestre de ${yearOf(primeira)}`;

    return {
      id: `${granularity}:${key}`,
      label,
      caption: `Semanas ${primeira.week} a ${ultima.week}`,
      weeks: group,
    };
  });
}

/**
 * O recorte que contém a semana corrente, ou o último disponível.
 *
 * A tela abre no agora — que é a pergunta de quem chega pelo e-mail — e cai
 * no recorte mais recente quando o ano letivo já terminou.
 */
export function currentRangeIndex(
  ranges: readonly WeekRange[],
  currentWeek: number | null,
): number {
  if (ranges.length === 0) return 0;

  if (currentWeek !== null) {
    const index = ranges.findIndex((range) =>
      range.weeks.some((week) => week.week === currentWeek),
    );
    if (index >= 0) return index;
  }

  return ranges.length - 1;
}

/* ------------------------------------------------------------------ *
 * Estatísticas do recorte
 * ------------------------------------------------------------------ */

/** Todas as células do recorte, de todos os clubinhos visíveis. */
function cellsOf(weeks: readonly ClubWeeklySummaryWeek[]): ClubWeeklySummaryCell[] {
  return weeks.flatMap((week) => week.clubs);
}

/** Se o status representa um encontro que devia ter acontecido. */
function isMeeting(status: ClubWeekStatus): boolean {
  return WEEK_STATUSES_WITH_MEETING.includes(status);
}

/**
 * Os números do recorte.
 *
 * Somados a partir das células visíveis, e não do total que o back manda por
 * semana: com um clubinho escondido na tela, as duas contas divergiriam e o
 * cabeçalho passaria a contradizer a lista logo abaixo.
 */
export function rangeTotals(weeks: readonly ClubWeeklySummaryWeek[]): RangeTotals {
  const cells = cellsOf(weeks);
  const counts = sumCounts(cells.map((cell) => cell.counts));
  const rated = weeks.filter((week) =>
    week.clubs.some((cell) => cell.counts.children > 0),
  );

  const best = rated.reduce<ClubWeeklySummaryWeek | null>(
    (chosen, week) => (!chosen || coverageOf(week) > coverageOf(chosen) ? week : chosen),
    null,
  );
  const worst = rated.reduce<ClubWeeklySummaryWeek | null>(
    (chosen, week) => (!chosen || coverageOf(week) < coverageOf(chosen) ? week : chosen),
    null,
  );

  return {
    counts,
    presenceRate: completionRateOf(counts.childrenPresent, counts.childrenWithPagela),
    meetings: cells.filter((cell) => isMeeting(cell.status)).length,
    exceptions: cells.filter((cell) => cell.status === ClubWeekStatus.Exception).length,
    weeksWithPendency: weeks.filter(weekHasPendency).length,
    bestWeek: best?.week ?? null,
    worstWeek: worst?.week ?? null,
  };
}

/** Cobertura da semana calculada sobre as células visíveis. */
function coverageOf(week: ClubWeeklySummaryWeek): number {
  const counts = sumCounts(week.clubs.map((cell) => cell.counts));
  return counts.completionRate;
}

/**
 * O que cada clubinho fez no recorte.
 *
 * Com uma semana só, a situação vem inteira; com mês ou trimestre ela fica
 * `null` — não existe "a" situação de treze semanas, e escolher uma delas
 * esconderia justamente a que interessa.
 */
export function aggregateByClub(
  weeks: readonly ClubWeeklySummaryWeek[],
  clubs: readonly ClubWeeklySummaryClub[],
): ClubRangeSummary[] {
  const single = weeks.length === 1;

  return clubs.map((club) => {
    const cells = weeks
      .flatMap((week) => week.clubs)
      .filter((cell) => cell.clubId === club.clubId);
    const only = single ? (cells[0] ?? null) : null;

    return {
      clubId: club.clubId,
      clubNumber: club.clubNumber,
      weekday: club.weekday,
      isActive: club.isActive,
      counts: sumCounts(cells.map((cell) => cell.counts)),
      weeksWithPendency: cells.filter(cellHasPendency).length,
      meetings: cells.filter((cell) => isMeeting(cell.status)).length,
      status: only?.status ?? null,
      expectedDate: only?.expectedDate ?? null,
      exceptionReason: only?.exceptionReason ?? null,
    };
  });
}
