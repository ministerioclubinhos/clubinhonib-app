import { expect, test } from '@playwright/test';

import { PeriodShortcut } from '@/features/statistics/types';
import {
  toAcceptedChristsQuery,
  toChildrenQuery,
  toClubsQuery,
  toPagelasQuery,
  toTeachersQuery,
  type StatisticsQueryBag,
} from '@/features/statistics/utils/queryPayload';

/**
 * O amontoado que o painel tinha em mãos quando as abas quebravam: o recorte
 * global (com `groupBy` e `period`), a busca, a semana e a paginação da
 * listagem — tudo junto, indo para todos os endpoints.
 */
const BAG: StatisticsQueryBag = {
  period: PeriodShortcut.THIS_MONTH,
  groupBy: 'week',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  week: 3,
  search: 'ana',
  clubId: 'club-1',
  teacherId: 'teacher-1',
  district: 'Centro',
  page: 2,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'DESC',
};

test.describe('o que cada endpoint recebe', () => {
  test('gráficos de pagela não recebem busca, paginação nem ordenação', () => {
    // Era o "property search should not exist" de `/pagelas/charts`.
    const query = toPagelasQuery(BAG);

    // O tipo já não declara estes campos; a asserção é sobre o que sai no
    // objeto, que é o que a requisição carrega.
    expect('search' in query).toBe(false);
    expect('page' in query).toBe(false);
    expect('sortBy' in query).toBe(false);
    expect(query.groupBy).toBe('week');
    expect(query.week).toBe(3);
  });

  test('a listagem de crianças não recebe groupBy nem semana', () => {
    // Era o "property groupBy should not exist" de `/children`.
    const query = toChildrenQuery(BAG);

    expect('groupBy' in query).toBe(false);
    expect('week' in query).toBe(false);
    expect(query.search).toBe('ana');
    expect(query.page).toBe(2);
  });

  test('a listagem de clubinhos não recebe busca, professor nem semana', () => {
    // Um clubinho não se filtra por professor nem por nome de criança.
    const query = toClubsQuery(BAG);

    expect('groupBy' in query).toBe(false);
    expect('week' in query).toBe(false);
    expect('search' in query).toBe(false);
    expect('teacherId' in query).toBe(false);
    expect(query.district).toBe('Centro');
  });

  test('a listagem de professores não recebe bairro nem groupBy', () => {
    const query = toTeachersQuery(BAG);

    expect('groupBy' in query).toBe(false);
    expect('district' in query).toBe(false);
    expect(query.search).toBe('ana');
    expect(query.clubId).toBe('club-1');
  });

  test('as decisões não recebem semana nem professor', () => {
    const query = toAcceptedChristsQuery(BAG);

    expect('week' in query).toBe(false);
    expect('teacherId' in query).toBe(false);
    expect(query.groupBy).toBe('week');
  });
});

test.describe('nenhum construtor deixa passar chave desconhecida', () => {
  /**
   * A régua que impede a volta do defeito: uma chave nova no contexto não pode
   * vazar para um endpoint só porque alguém a acrescentou ao estado da tela.
   * A validação global do back roda com `forbidNonWhitelisted`, então uma
   * chave a mais transforma a requisição inteira em `400`.
   */
  const CHAVES_ACEITAS: Record<string, string[]> = {
    pagelas: ['period','year','week','startDate','endDate','clubId','teacherId','coordinatorId','gender','minAge','maxAge','city','state','district','joinedAfter','joinedBefore','onlyPresent','onlyDidMeditation','onlyRecitedVerse','groupBy'],
    acceptedChrists: ['period','year','startDate','endDate','clubId','coordinatorId','decision','gender','minAge','maxAge','city','state','district','joinedAfter','joinedBefore','groupBy'],
    children: ['period','year','startDate','endDate','clubId','teacherId','coordinatorId','gender','minAge','maxAge','ageGroup','city','state','district','joinedAfter','joinedBefore','minPagelas','minPresenceRate','maxPresenceRate','minEngagementScore','maxEngagementScore','hasDecision','decisionType','hasLowEngagement','isActive','search','sortBy','sortOrder','page','limit'],
    clubs: ['period','year','startDate','endDate','coordinatorId','weekday','city','state','district','minChildren','maxChildren','minTeachers','minDecisions','minPresenceRate','maxPresenceRate','minPerformanceScore','maxPerformanceScore','sortBy','sortOrder','page','limit'],
    teachers: ['period','year','startDate','endDate','clubId','coordinatorId','city','state','minPagelas','minChildren','minDecisions','minPresenceRate','maxPresenceRate','minEffectivenessScore','maxEffectivenessScore','isActive','search','sortBy','sortOrder','page','limit'],
  };

  const invasor = {
    ...BAG,
    naoExisteNoContrato: 'x',
  } as unknown as StatisticsQueryBag;

  const casos: Array<[string, (bag: StatisticsQueryBag) => object]> = [
    ['pagelas', toPagelasQuery],
    ['acceptedChrists', toAcceptedChristsQuery],
    ['children', toChildrenQuery],
    ['clubs', toClubsQuery],
    ['teachers', toTeachersQuery],
  ];

  for (const [nome, build] of casos) {
    test(`${nome} envia só o que o DTO declara`, () => {
      const chaves = Object.keys(build(invasor));

      expect(chaves).not.toContain('naoExisteNoContrato');
      for (const chave of chaves) {
        expect(CHAVES_ACEITAS[nome], `${nome} enviou "${chave}"`).toContain(chave);
      }
    });
  }
});

test.describe('valores vazios', () => {
  test('campo em branco não vira filtro', () => {
    // `?clubId=` faria o back tratar a string vazia como um id e devolver nada.
    const query = toChildrenQuery({ clubId: '', city: undefined, search: 'ana' });

    expect('clubId' in query).toBe(false);
    expect('city' in query).toBe(false);
    expect(query.search).toBe('ana');
  });

  test('sem filtro nenhum, o payload é vazio', () => {
    expect(toPagelasQuery()).toEqual({});
    expect(toClubsQuery({})).toEqual({});
  });
});
