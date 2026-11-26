import { expect, test } from '@playwright/test';

import { ALL_CLUBS_OPTION } from '@/features/club-weekly-summary/constants';
import {
  ClubWeekStatus,
  ClubWeekday,
  ClubWeekTimeline,
  RangeGranularity,
  type ClubWeeklySummaryCell,
  type ClubWeeklySummaryClub,
  type ClubWeeklySummaryWeek,
} from '@/features/club-weekly-summary/types';
import {
  aggregateByClub,
  buildCoverageSeries,
  buildRanges,
  buildSummaryQuery,
  currentRangeIndex,
  rangeTotals,
  sumCounts,
  cellHasPendency,
  formatCount,
  formatRate,
  keepClubs,
  onlyActiveClubs,
  visibleWeeks,
  weekHasPendency,
  weekOverallStatus,
  weekPendencyCount,
  weekRangeLabel,
  weekShortLabel,
  weekStatusLabel,
  weekStatusSeverity,
} from '@/features/club-weekly-summary/utils';

const cell = (status: ClubWeekStatus): ClubWeeklySummaryCell => ({
  clubId: 'club-1',
  clubNumber: 12,
  status,
  expectedDate: '2026-03-04',
  exceptionReason: null,
  counts: {
    children: 10,
    childrenWithPagela: 7,
    childrenMissing: 3,
    childrenPresent: 7,
    completionRate: 70,
  },
});

const week = (
  overrides: Partial<ClubWeeklySummaryWeek> = {},
): ClubWeeklySummaryWeek => ({
  week: 1,
  startDate: '2026-03-02',
  endDate: '2026-03-07',
  timeline: ClubWeekTimeline.Past,
  counts: {
    children: 10,
    childrenWithPagela: 7,
    childrenMissing: 3,
    childrenPresent: 7,
    completionRate: 70,
  },
  statusCounts: {
    ok: 0,
    partial: 1,
    missing: 0,
    pending: 0,
    exception: 0,
    inactive: 0,
    outOfPeriod: 0,
  },
  clubs: [cell(ClubWeekStatus.Partial)],
  ...overrides,
});

test.describe('weekStatusLabel e weekStatusSeverity', () => {
  test('nomeiam as sete situações que o back devolve', () => {
    expect(weekStatusLabel(ClubWeekStatus.Ok)).toBe('Em dia');
    expect(weekStatusLabel(ClubWeekStatus.Partial)).toBe('Parcial');
    expect(weekStatusLabel(ClubWeekStatus.Missing)).toBe('Sem pagela');
    expect(weekStatusLabel(ClubWeekStatus.Pending)).toBe('Aguardando');
    expect(weekStatusLabel(ClubWeekStatus.Exception)).toBe('Sem clubinho');
    expect(weekStatusLabel(ClubWeekStatus.Inactive)).toBe('Desativado');
    expect(weekStatusLabel(ClubWeekStatus.OutOfPeriod)).toBe('Fora do período');
  });

  test('só falta e parcial pintam de erro e aviso', () => {
    expect(weekStatusSeverity(ClubWeekStatus.Missing)).toBe('error');
    expect(weekStatusSeverity(ClubWeekStatus.Partial)).toBe('warning');
    expect(weekStatusSeverity(ClubWeekStatus.Ok)).toBe('success');
    // A semana ainda não chegou, ou o dia sem Clubinho foi combinado.
    expect(weekStatusSeverity(ClubWeekStatus.Pending)).toBe('info');
    expect(weekStatusSeverity(ClubWeekStatus.Exception)).toBe('info');
  });
});

test.describe('pendência', () => {
  test('aguardando não é pendência', () => {
    // Cobrar aí faria toda segunda-feira parecer um problema.
    expect(cellHasPendency(cell(ClubWeekStatus.Pending))).toBe(false);
    expect(cellHasPendency(cell(ClubWeekStatus.Exception))).toBe(false);
  });

  test('falta e parcial são pendência', () => {
    expect(cellHasPendency(cell(ClubWeekStatus.Missing))).toBe(true);
    expect(cellHasPendency(cell(ClubWeekStatus.Partial))).toBe(true);
  });

  test('a semana herda a pendência de qualquer clubinho', () => {
    expect(weekHasPendency(week())).toBe(true);
    expect(weekHasPendency(week({ clubs: [cell(ClubWeekStatus.Ok)] }))).toBe(
      false,
    );
  });
});

test.describe('visibleWeeks', () => {
  const semanas = [
    week({ week: 1 }),
    week({ week: 2, timeline: ClubWeekTimeline.Current }),
    week({ week: 3, timeline: ClubWeekTimeline.Future }),
  ];

  test('esconde as semanas futuras por padrão', () => {
    expect(visibleWeeks(semanas, false).map((item) => item.week)).toEqual([
      1, 2,
    ]);
  });

  test('mostra o calendário completo quando pedido', () => {
    expect(visibleWeeks(semanas, true).map((item) => item.week)).toEqual([
      1, 2, 3,
    ]);
  });
});

test.describe('buildSummaryQuery', () => {
  test('"todos os clubinhos" não vira parâmetro', () => {
    // `all` não é um id: mandá-lo faria a API responder 400.
    expect(buildSummaryQuery(2026, ALL_CLUBS_OPTION)).toEqual({ year: 2026 });
  });

  test('leva ano e clubinho quando os dois foram escolhidos', () => {
    expect(buildSummaryQuery(2026, 'club-1')).toEqual({
      year: 2026,
      clubId: 'club-1',
    });
  });

  test('sem ano escolhido a API decide qual é o corrente', () => {
    expect(buildSummaryQuery(null, ALL_CLUBS_OPTION)).toEqual({});
  });
});

test.describe('formatação', () => {
  test('percentual em português, sem casa decimal sobrando', () => {
    expect(formatRate(100)).toBe('100%');
    expect(formatRate(77.75)).toBe('77,8%');
    expect(formatRate(0)).toBe('0%');
  });

  test('contagem em português', () => {
    expect(formatCount(1234)).toBe('1.234');
  });

  test('rótulo curto e intervalo da semana', () => {
    expect(weekShortLabel(12)).toBe('S12');
    expect(weekRangeLabel(week())).toBe('02/03/2026 a 07/03/2026');
  });
});

test.describe('buildCoverageSeries', () => {
  test('um ponto por semana, com o rótulo do eixo pronto', () => {
    const serie = buildCoverageSeries([
      week({ week: 1, counts: { ...week().counts, completionRate: 70 } }),
      week({ week: 2, timeline: ClubWeekTimeline.Current }),
    ]);

    expect(serie).toEqual([
      {
        week: 1,
        label: 'S1',
        completionRate: 70,
        timeline: ClubWeekTimeline.Past,
      },
      {
        week: 2,
        label: 'S2',
        completionRate: 70,
        timeline: ClubWeekTimeline.Current,
      },
    ]);
  });
});

test.describe('weekOverallStatus', () => {
  test('a semana herda a situação mais grave entre os clubinhos', () => {
    // Uma semana com um clubinho sem pagela nenhuma não pode aparecer verde.
    const semana = week({
      clubs: [
        cell(ClubWeekStatus.Ok),
        cell(ClubWeekStatus.Missing),
        cell(ClubWeekStatus.Partial),
      ],
    });

    expect(weekOverallStatus(semana)).toBe(ClubWeekStatus.Missing);
  });

  test('parcial pesa mais que aguardando', () => {
    expect(
      weekOverallStatus(
        week({ clubs: [cell(ClubWeekStatus.Pending), cell(ClubWeekStatus.Partial)] }),
      ),
    ).toBe(ClubWeekStatus.Partial);
  });

  test('semana sem clubinho nenhum devolve o valor neutro', () => {
    expect(weekOverallStatus(week({ clubs: [] }))).toBe(ClubWeekStatus.OutOfPeriod);
  });
});

test.describe('weekPendencyCount', () => {
  test('conta só os clubinhos devendo pagela', () => {
    expect(
      weekPendencyCount(
        week({
          clubs: [
            cell(ClubWeekStatus.Missing),
            cell(ClubWeekStatus.Partial),
            cell(ClubWeekStatus.Ok),
            cell(ClubWeekStatus.Pending),
          ],
        }),
      ),
    ).toBe(2);
  });
});

test.describe('clubinhos visíveis', () => {
  const club = (
    clubId: string,
    isActive: boolean,
  ): ClubWeeklySummaryClub => ({
    clubId,
    clubNumber: 12,
    weekday: ClubWeekday.Wednesday,
    isActive,
  });

  test('deixa de fora os clubinhos desativados', () => {
    // Um clubinho desativado nunca muda de situação: dez deles na tela
    // escondem os quatro que importam.
    const visiveis = onlyActiveClubs([club('a', true), club('b', false), club('c', true)]);

    expect(visiveis.map((item) => item.clubId)).toEqual(['a', 'c']);
  });

  test('as semanas perdem as células dos clubinhos ocultos', () => {
    const semana = week({
      clubs: [
        { ...cell(ClubWeekStatus.Ok), clubId: 'a' },
        { ...cell(ClubWeekStatus.Inactive), clubId: 'b' },
      ],
    });

    const recortadas = keepClubs([semana], [club('a', true)]);

    expect(recortadas[0].clubs.map((item) => item.clubId)).toEqual(['a']);
    // Os totais da semana vêm do back e não são recalculados aqui.
    expect(recortadas[0].counts).toEqual(semana.counts);
  });
});

const counts = (children: number, withPagela: number, present = withPagela) => ({
  children,
  childrenWithPagela: withPagela,
  childrenMissing: children - withPagela,
  childrenPresent: present,
  completionRate: children > 0 ? Math.round((withPagela / children) * 1000) / 10 : 0,
});

test.describe('sumCounts', () => {
  test('recalcula o percentual sobre o total, e não pela média das partes', () => {
    // 1 de 1 somado a 0 de 9 é 10%, não 50%.
    expect(sumCounts([counts(1, 1), counts(9, 0)])).toEqual(counts(10, 1, 1));
  });

  test('sem partes devolve tudo zerado', () => {
    expect(sumCounts([])).toEqual(counts(0, 0, 0));
  });
});

test.describe('buildRanges', () => {
  const semanas = [
    week({ week: 1, startDate: '2026-03-02', endDate: '2026-03-07' }),
    week({ week: 5, startDate: '2026-03-30', endDate: '2026-04-04' }),
    week({ week: 9, startDate: '2026-04-27', endDate: '2026-05-02' }),
  ];

  test('a visão de semana dá um recorte por semana', () => {
    const ranges = buildRanges(semanas, RangeGranularity.Week, 2026);

    expect(ranges).toHaveLength(3);
    expect(ranges[0].id).toBe('week:1');
    expect(ranges[0].label).toBe('Semana 1');
    expect(ranges[0].caption).toBe('02/03/2026 a 07/03/2026');
  });

  test('a visão de mês agrupa pela segunda-feira da semana', () => {
    // A semana 5 começa em 30/03 e termina em abril: ela é de março, porque
    // fatiar por dia partiria uma semana letiva ao meio.
    const ranges = buildRanges(semanas, RangeGranularity.Month, 2026);

    expect(ranges.map((range) => range.label)).toEqual([
      'Março de 2026',
      'Abril de 2026',
    ]);
    expect(ranges[0].weeks.map((item) => item.week)).toEqual([1, 5]);
    expect(ranges[0].caption).toBe('Semanas 1 a 5');
  });

  test('a visão de trimestre junta os três meses', () => {
    const ranges = buildRanges(semanas, RangeGranularity.Quarter, 2026);

    expect(ranges.map((range) => range.label)).toEqual([
      '1º trimestre de 2026',
      '2º trimestre de 2026',
    ]);
  });

  test('a visão de ano é um recorte só', () => {
    const ranges = buildRanges(semanas, RangeGranularity.Year, 2026);

    expect(ranges).toHaveLength(1);
    expect(ranges[0].label).toBe('Ano letivo 2026');
    expect(ranges[0].weeks).toHaveLength(3);
  });

  test('sem semana nenhuma não há recorte a navegar', () => {
    expect(buildRanges([], RangeGranularity.Month, 2026)).toEqual([]);
  });
});

test.describe('currentRangeIndex', () => {
  const ranges = buildRanges(
    [week({ week: 1 }), week({ week: 2 }), week({ week: 3 })],
    RangeGranularity.Week,
    2026,
  );

  test('abre no recorte que contém a semana corrente', () => {
    expect(currentRangeIndex(ranges, 2)).toBe(1);
  });

  test('sem semana corrente cai no recorte mais recente', () => {
    // Ano letivo já encerrado: o último é o que interessa.
    expect(currentRangeIndex(ranges, null)).toBe(2);
  });

  test('semana corrente escondida também cai no mais recente', () => {
    expect(currentRangeIndex(ranges, 40)).toBe(2);
  });

  test('sem recorte nenhum devolve zero', () => {
    expect(currentRangeIndex([], 3)).toBe(0);
  });
});

test.describe('rangeTotals', () => {
  const semana = (numero: number, cells: ClubWeeklySummaryCell[]) =>
    week({ week: numero, clubs: cells });

  test('soma as células visíveis e mede presença sobre as pagelas lançadas', () => {
    const totals = rangeTotals([
      semana(1, [
        { ...cell(ClubWeekStatus.Ok), clubId: 'a', counts: counts(4, 4, 3) },
        { ...cell(ClubWeekStatus.Missing), clubId: 'b', counts: counts(6, 0, 0) },
      ]),
    ]);

    expect(totals.counts).toEqual(counts(10, 4, 3));
    // Presença é sobre quem teve pagela, não sobre o total de crianças.
    expect(totals.presenceRate).toBe(75);
    expect(totals.meetings).toBe(2);
    expect(totals.weeksWithPendency).toBe(1);
  });

  test('dia sem Clubinho não conta como encontro', () => {
    const totals = rangeTotals([
      semana(1, [
        { ...cell(ClubWeekStatus.Exception), clubId: 'a', counts: counts(4, 0, 0) },
        { ...cell(ClubWeekStatus.Ok), clubId: 'b', counts: counts(4, 4, 4) },
      ]),
    ]);

    expect(totals.meetings).toBe(1);
    expect(totals.exceptions).toBe(1);
    expect(totals.weeksWithPendency).toBe(0);
  });

  test('melhor e pior semana ignoram semana sem criança a atender', () => {
    const totals = rangeTotals([
      semana(1, [{ ...cell(ClubWeekStatus.Ok), clubId: 'a', counts: counts(4, 4, 4) }]),
      semana(2, [{ ...cell(ClubWeekStatus.Exception), clubId: 'a', counts: counts(0, 0, 0) }]),
      semana(3, [{ ...cell(ClubWeekStatus.Partial), clubId: 'a', counts: counts(4, 1, 1) }]),
    ]);

    expect(totals.bestWeek).toBe(1);
    expect(totals.worstWeek).toBe(3);
  });
});

test.describe('aggregateByClub', () => {
  const clubinho = (clubId: string): ClubWeeklySummaryClub => ({
    clubId,
    clubNumber: 12,
    weekday: ClubWeekday.Wednesday,
    isActive: true,
  });

  test('com uma semana só, a situação do clubinho vem inteira', () => {
    const [resumo] = aggregateByClub(
      [week({ clubs: [{ ...cell(ClubWeekStatus.Partial), clubId: 'a', counts: counts(4, 1, 1) }] })],
      [clubinho('a')],
    );

    expect(resumo.status).toBe(ClubWeekStatus.Partial);
    expect(resumo.expectedDate).toBe('2026-03-04');
    expect(resumo.counts).toEqual(counts(4, 1, 1));
  });

  test('com várias semanas não existe "a" situação do clubinho', () => {
    // Resumir treze semanas numa só esconderia justamente a que interessa.
    const [resumo] = aggregateByClub(
      [
        week({ week: 1, clubs: [{ ...cell(ClubWeekStatus.Ok), clubId: 'a', counts: counts(4, 4, 4) }] }),
        week({ week: 2, clubs: [{ ...cell(ClubWeekStatus.Missing), clubId: 'a', counts: counts(4, 0, 0) }] }),
      ],
      [clubinho('a')],
    );

    expect(resumo.status).toBeNull();
    expect(resumo.counts).toEqual(counts(8, 4, 4));
    expect(resumo.weeksWithPendency).toBe(1);
    expect(resumo.meetings).toBe(2);
  });

  test('clubinho sem célula no recorte aparece zerado, e não some', () => {
    const [resumo] = aggregateByClub([week({ clubs: [] })], [clubinho('a')]);

    expect(resumo.counts).toEqual(counts(0, 0, 0));
    expect(resumo.meetings).toBe(0);
  });
});
