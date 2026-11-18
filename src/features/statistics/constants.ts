import { AttendanceWeekState, PeriodShortcut, WeeklyClubStatus } from './types';

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

/** As visões da página, na ordem em que aparecem. O valor vai na URL (`?aba=`). */
export enum StatisticsTab {
  Summary = 'resumo',
  Children = 'criancas',
  Clubs = 'clubinhos',
  Teachers = 'professores',
  Coordinators = 'coordenadores',
}

export const DEFAULT_STATISTICS_TAB = StatisticsTab.Summary;
export const STATISTICS_TAB_PARAM = 'aba';

/** Os períodos oferecidos: poucos e com nome de gente. */
export const PLAIN_PERIOD_OPTIONS = [
  PeriodShortcut.THIS_WEEK,
  PeriodShortcut.THIS_MONTH,
  PeriodShortcut.LAST_30_DAYS,
  PeriodShortcut.THIS_YEAR,
] as const;
export const DEFAULT_PLAIN_PERIOD = PeriodShortcut.THIS_YEAR;
export const STATISTICS_PERIOD_PARAM = 'periodo';

/** Leitura da taxa de presença: de "vai bem" a "precisa de atenção". */
export enum RateTone {
  Good = 'good',
  Medium = 'medium',
  Low = 'low',
}

export const RATE_TONE_THRESHOLDS = { good: 75, medium: 50 } as const;

/** Só entra em "quem mais vem / quem precisa de atenção" quem tem pagelas o bastante. */
export const MIN_PAGELAS_FOR_RANKING = 3;
export const RANKING_SIZE = 5;
/** Quantos itens as listas por clubinho/professor/coordenador buscam de uma vez. */
export const LIST_FETCH_LIMIT = 100;
/** Quantas semanas o gráfico de presença mostra no máximo. */
export const WEEK_COLUMNS_MAX = 12;
/** Abaixo disto o clubinho aparece como "pouca presença". */
export const LOW_PRESENCE_THRESHOLD = 60;
/** Clubinho com crianças e sem pagela há tantos dias aparece como "parado". */
export const STALE_CLUB_DAYS = 10;
/** Quantos nomes um aviso lista antes do "e mais N". */
export const ALERT_NAMES_SHOWN = 8;

/** A cor que dá o recado: verde vai bem, amarelo pede atenção, vermelho pede ajuda. */
export enum Tone {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
  Neutral = 'neutral',
}
