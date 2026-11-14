import type {
  AcceptedChristsStatsQueryDto,
  ChildrenStatsQueryDto,
  ClubsStatsQueryDto,
  PagelasStatsQueryDto,
  TeachersStatsQueryDto,
} from '../types';
import type { StatisticsContextFilters } from '../context/StatisticsContext';

/**
 * Os filtros da tela traduzidos para cada contrato da API.
 *
 * O painel guarda **um** conjunto de filtros e alimenta cinco endpoints com
 * DTOs diferentes; cada listagem ainda junta os filtros locais dela. Mandar
 * esse amontoado inteiro para todos derrubava a maioria das abas: a validação
 * global roda com `forbidNonWhitelisted`, então uma chave a mais transforma a
 * requisição inteira em `400` — era o "property groupBy should not exist" em
 * `/children`, `/clubs` e `/teachers`, o "property week should not exist" em
 * `/clubs` e o "property search should not exist" em `/pagelas/charts`.
 *
 * Cada função abaixo é a lista **explícita** do que aquele endpoint declara.
 * Uma chave nova no contexto não vaza sozinha para lugar nenhum: ou entra
 * numa dessas listas, ou não é enviada. É o mesmo desenho de
 * `features/clubs/utils.ts`, pelo mesmo motivo.
 */

/**
 * Tudo o que uma tela pode ter em mãos ao pedir estatística.
 *
 * O recorte global do painel mais os filtros locais de cada listagem. As
 * funções abaixo recebem este amontoado e devolvem só o que cabe no contrato.
 */
export type StatisticsQueryBag = StatisticsContextFilters &
  Partial<Omit<ChildrenStatsQueryDto, 'sortBy'>> &
  Partial<Omit<ClubsStatsQueryDto, 'sortBy'>> &
  Partial<Omit<TeachersStatsQueryDto, 'sortBy'>> &
  Partial<AcceptedChristsStatsQueryDto> & {
    /**
     * Campo de ordenação. Fica solto de propósito: cada listagem aceita o seu
     * conjunto de valores, e cruzá-los daria um tipo que nenhum deles satisfaz.
     * Quem monta o payload estreita para a união do seu endpoint.
     */
    sortBy?: string;
  };

/**
 * Remove as chaves sem valor.
 *
 * `?clubId=` não é o mesmo que não filtrar: o back trataria a string vazia
 * como um id, e a resposta viria vazia sem explicação.
 */
function compact<T extends object>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  ) as T;
}

/** `GET /statistics/pagelas`, `/pagelas/charts` e `/insights`. */
export function toPagelasQuery(
  filters: StatisticsQueryBag = {},
): PagelasStatsQueryDto {
  return compact<PagelasStatsQueryDto>({
    period: filters.period,
    year: filters.year,
    week: filters.week,
    startDate: filters.startDate,
    endDate: filters.endDate,
    clubId: filters.clubId,
    teacherId: filters.teacherId,
    coordinatorId: filters.coordinatorId,
    gender: filters.gender,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    city: filters.city,
    state: filters.state,
    district: filters.district,
    joinedAfter: filters.joinedAfter,
    joinedBefore: filters.joinedBefore,
    onlyPresent: filters.onlyPresent,
    onlyDidMeditation: filters.onlyDidMeditation,
    onlyRecitedVerse: filters.onlyRecitedVerse,
    groupBy: filters.groupBy,
  });
}

/** `GET /statistics/accepted-christs` e `/accepted-christs/charts`. */
export function toAcceptedChristsQuery(
  filters: StatisticsQueryBag = {},
): AcceptedChristsStatsQueryDto {
  return compact<AcceptedChristsStatsQueryDto>({
    period: filters.period,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    clubId: filters.clubId,
    coordinatorId: filters.coordinatorId,
    decision: filters.decision,
    gender: filters.gender,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    city: filters.city,
    state: filters.state,
    district: filters.district,
    joinedAfter: filters.joinedAfter,
    joinedBefore: filters.joinedBefore,
    groupBy: filters.groupBy,
  });
}

/** `GET /statistics/children`. Aceita busca; não aceita `groupBy` nem `week`. */
export function toChildrenQuery(
  filters: StatisticsQueryBag = {},
): ChildrenStatsQueryDto {
  return compact<ChildrenStatsQueryDto>({
    period: filters.period,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    clubId: filters.clubId,
    teacherId: filters.teacherId,
    coordinatorId: filters.coordinatorId,
    gender: filters.gender,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    ageGroup: filters.ageGroup,
    city: filters.city,
    state: filters.state,
    district: filters.district,
    joinedAfter: filters.joinedAfter,
    joinedBefore: filters.joinedBefore,
    minPagelas: filters.minPagelas,
    minPresenceRate: filters.minPresenceRate,
    maxPresenceRate: filters.maxPresenceRate,
    minEngagementScore: filters.minEngagementScore,
    maxEngagementScore: filters.maxEngagementScore,
    hasDecision: filters.hasDecision,
    decisionType: filters.decisionType,
    hasLowEngagement: filters.hasLowEngagement,
    isActive: filters.isActive,
    search: filters.search,
    sortBy: filters.sortBy as ChildrenStatsQueryDto['sortBy'],
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  });
}

/**
 * `GET /statistics/clubs`.
 *
 * Sem `teacherId` e sem `search`: o contrato do back não os declara — um
 * clubinho não se filtra por professor nem por nome de criança.
 */
export function toClubsQuery(
  filters: StatisticsQueryBag = {},
): ClubsStatsQueryDto {
  return compact<ClubsStatsQueryDto>({
    period: filters.period,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    coordinatorId: filters.coordinatorId,
    weekday: filters.weekday,
    city: filters.city,
    state: filters.state,
    district: filters.district,
    minChildren: filters.minChildren,
    maxChildren: filters.maxChildren,
    minTeachers: filters.minTeachers,
    minDecisions: filters.minDecisions,
    minPresenceRate: filters.minPresenceRate,
    maxPresenceRate: filters.maxPresenceRate,
    minPerformanceScore: filters.minPerformanceScore,
    maxPerformanceScore: filters.maxPerformanceScore,
    sortBy: filters.sortBy as ClubsStatsQueryDto['sortBy'],
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  });
}

/** `GET /statistics/teachers`. Aceita busca; não aceita `district`. */
export function toTeachersQuery(
  filters: StatisticsQueryBag = {},
): TeachersStatsQueryDto {
  return compact<TeachersStatsQueryDto>({
    period: filters.period,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    clubId: filters.clubId,
    coordinatorId: filters.coordinatorId,
    city: filters.city,
    state: filters.state,
    minPagelas: filters.minPagelas,
    minChildren: filters.minChildren,
    minDecisions: filters.minDecisions,
    minPresenceRate: filters.minPresenceRate,
    maxPresenceRate: filters.maxPresenceRate,
    minEffectivenessScore: filters.minEffectivenessScore,
    maxEffectivenessScore: filters.maxEffectivenessScore,
    isActive: filters.isActive,
    search: filters.search,
    sortBy: filters.sortBy as TeachersStatsQueryDto['sortBy'],
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  });
}
