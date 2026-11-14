import { AttendanceWeekState, PeriodShortcut, WeeklyClubStatus } from './types';

/**
 * As seções do painel.
 *
 * O `switch` que escolhe a aba comparava `case 0` a `case 10` contra a lista
 * de `NavigationTabs` — duas listas paralelas de números. Reordenar uma delas
 * trocava as abas em silêncio. Com o enum, o compilador cobra as duas pontas.
 */
export enum StatisticsTab {
  Overview = 0,
  Frequency = 1,
  Children = 2,
  Clubs = 3,
  Teachers = 4,
  Demographic = 5,
  Geographic = 6,
  Decisions = 7,
  Retention = 8,
  Activities = 9,
  Rankings = 10,
}

/** Largura da página, igual à das demais telas de conteúdo. */
export const PAGE_WIDTH = { xs: '98%', md: '95%' } as const;

/** Prefixo de toda chave de cache das estatísticas. */
export const STATISTICS_QUERY_KEY = 'statistics';

/**
 * Validade dos agregados do painel.
 *
 * Estes números mudam quando alguém lança uma pagela, o que acontece ao longo
 * da semana — não a cada segundo. Antes seis consultas usavam `staleTime: 0`
 * com o comentário "força refetch ao trocar de filtro", o que não é o que
 * `staleTime` faz: o filtro já está na chave, então trocar de filtro já busca
 * outra chave. O efeito real era refazer a agregação a cada montagem — e as
 * abas são `React.lazy` dentro de um `AnimatePresence`, ou seja, remontam a
 * cada troca. Ir e voltar entre duas abas repetia o trabalho inteiro do banco.
 */
export const STATISTICS_STALE_TIME_MS = 5 * 60 * 1000;

/** Listagens paginadas mudam mais: meio tempo do agregado. */
export const STATISTICS_LIST_STALE_TIME_MS = 2 * 60 * 1000;


/**
 * Rótulo de cada atalho de período.
 *
 * Estava escrito à mão dentro de `SmartFilters`, junto do ícone e da cor. O
 * texto sai daqui para que a mesma escolha apareça igual em qualquer tela que
 * venha a oferecer o filtro.
 */
export const PERIOD_SHORTCUT_LABELS: Record<PeriodShortcut, string> = {
  [PeriodShortcut.TODAY]: 'Hoje',
  [PeriodShortcut.THIS_WEEK]: 'Esta semana',
  [PeriodShortcut.THIS_MONTH]: 'Este mês',
  [PeriodShortcut.LAST_7_DAYS]: '7 dias',
  [PeriodShortcut.LAST_30_DAYS]: '30 dias',
  [PeriodShortcut.THIS_YEAR]: 'Este ano',
  [PeriodShortcut.CUSTOM]: 'Personalizado',
};

/** Ordem em que os atalhos aparecem na barra de filtros. */
export const QUICK_PERIOD_ORDER: PeriodShortcut[] = [
  PeriodShortcut.TODAY,
  PeriodShortcut.THIS_WEEK,
  PeriodShortcut.THIS_MONTH,
  PeriodShortcut.LAST_7_DAYS,
  PeriodShortcut.LAST_30_DAYS,
  PeriodShortcut.THIS_YEAR,
];

/**
 * Faixas de idade e de tempo de participação.
 *
 * São as mesmas que o back usa para agrupar (`metrics.utils.ts`); repetir os
 * limites na tela faria os dois lados divergirem em silêncio.
 */
export const AGE_GROUPS = ['0-5', '6-10', '11-15', '16+'] as const;

export const PARTICIPATION_TIME_RANGES = [
  '0-3 meses',
  '3-6 meses',
  '6-12 meses',
  '1+ ano',
] as const;

/** Quantas casas decimais as taxas mostram — o mesmo do back. */
export const RATE_DECIMAL_PLACES = 1;

/** Página e tamanho padrão das listagens de estatística. */
export const STATISTICS_DEFAULT_PAGE = 1;
export const STATISTICS_DEFAULT_LIMIT = 20;

/**
 * Nome do dia da semana como as listagens o mostram.
 *
 * Aceita as duas grafias porque a API já devolveu ambas: linhas antigas em
 * maiúsculas, as novas em minúsculas.
 */
export const WEEKDAY_NAMES: Record<string, string> = {
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/** Um campo da barra de filtros, para dizer quais abas o respeitam. */
export enum StatisticsFilterField {
  Period = 'period',
  Search = 'search',
  Gender = 'gender',
  Age = 'age',
  GroupBy = 'groupBy',
  Location = 'location',
}

/**
 * Quais filtros cada aba de fato usa.
 *
 * A barra é a mesma para as onze abas, mas os endpoints por trás aceitam
 * conjuntos diferentes: `groupBy` só existe nas séries temporais, `search` só
 * nas listagens de criança e professor, e gênero/idade não recortam clubinho
 * nem professor.
 *
 * Antes isso aparecia como erro — a requisição saía com a chave a mais e a API
 * respondia `400`. Com o payload filtrado por endpoint o erro sumiu, e o
 * silêncio tomou o lugar dele: o campo continuava editável e simplesmente não
 * fazia nada. Este mapa é o que permite desabilitar o que não se aplica e
 * dizer por quê, em vez de deixar a pessoa mexendo num controle morto.
 */
export const TAB_FILTER_FIELDS: Record<StatisticsTab, StatisticsFilterField[]> = {
  [StatisticsTab.Overview]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.GroupBy,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Frequency]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Children]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Search,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Clubs]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Teachers]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Search,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Demographic]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Geographic]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Decisions]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.GroupBy,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Retention]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Activities]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.GroupBy,
    StatisticsFilterField.Location,
  ],
  [StatisticsTab.Rankings]: [
    StatisticsFilterField.Period,
    StatisticsFilterField.Gender,
    StatisticsFilterField.Age,
    StatisticsFilterField.Location,
  ],
};

/** O aviso que explica por que o campo está desabilitado. */
export const FILTER_NOT_APPLIED_HINT = 'Esta aba não usa este filtro';

/**
 * Rótulo de cada situação de clubinho na grade semanal.
 *
 * `Record` sobre o enum: um estado novo no contrato deixa de compilar aqui em
 * vez de cair num "Desconhecido" cinza na tela.
 */
export const WEEKLY_CLUB_STATUS_LABELS: Record<WeeklyClubStatus, string> = {
  [WeeklyClubStatus.Ok]: 'OK',
  [WeeklyClubStatus.Partial]: 'Parcial',
  [WeeklyClubStatus.Missing]: 'Faltou',
  [WeeklyClubStatus.Pending]: 'Aguardando o dia do clubinho',
  [WeeklyClubStatus.Vacation]: 'Férias',
  [WeeklyClubStatus.Inactive]: 'Inativo',
  [WeeklyClubStatus.OutOfPeriod]: 'Fora do período letivo',
};

/** Rótulo de cada estado de semana na linha do tempo do clubinho. */
export const ATTENDANCE_WEEK_STATE_LABELS: Record<AttendanceWeekState, string> = {
  [AttendanceWeekState.WithPagela]: 'Com pagela',
  [AttendanceWeekState.Missing]: 'Sem pagela',
  [AttendanceWeekState.Pending]: 'Pendente',
  [AttendanceWeekState.Exception]: 'Exceção/feriado',
};

/** Ordem dos estados na legenda da linha do tempo. */
export const ATTENDANCE_WEEK_STATE_ORDER: AttendanceWeekState[] = [
  AttendanceWeekState.WithPagela,
  AttendanceWeekState.Missing,
  AttendanceWeekState.Pending,
  AttendanceWeekState.Exception,
];

/** O que aparece no lugar de uma taxa quando não há dado para calculá-la. */
export const NO_DATA_PLACEHOLDER = '—';

/**
 * Aviso do bloco de KPIs.
 *
 * `/statistics/overview` não recebe filtro nenhum: os números são de janelas
 * fixas (esta semana, este mês, este ano), e a tela precisa dizer isso.
 */
export const KPI_FIXED_WINDOW_CAPTION = 'Visão geral — não segue os filtros';

/** Mensagens de vazio da frequência, para não mostrar 0% onde não há dado. */
export const ATTENDANCE_EMPTY_MESSAGES = {
  noAcademicPeriod: 'Não há período letivo cadastrado para este ano.',
  noExpectedWeeks:
    'Nenhuma semana esperada até agora: o período ainda não começou ou só teve exceções.',
  noExpectedClubs:
    'Nenhum clubinho era esperado até agora nesta semana (dia ainda não chegou, exceção ou sem crianças).',
  noPagelasThisWeek: 'Sem pagelas nesta semana',
  noPagelasThisMonth: 'Sem pagelas neste mês',
} as const;
