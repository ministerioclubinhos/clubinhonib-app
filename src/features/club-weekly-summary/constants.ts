import { ClubWeekStatus, ClubWeekTimeline, RangeGranularity } from './types';

/** Endpoint do resumo semanal. */
export const CLUB_WEEKLY_SUMMARY_ENDPOINT = '/club-control/weekly-summary';

/** Prefixo da chave de cache do resumo. */
export const CLUB_WEEKLY_SUMMARY_QUERY_KEY = 'clubWeeklySummary';

/**
 * Validade do resumo em cache.
 *
 * O quadro muda quando alguém lança uma pagela, o que acontece ao longo da
 * semana e não a cada segundo. Cinco minutos evitam recarregar a cada volta à
 * tela sem deixar o número velho o suficiente para enganar.
 */
export const CLUB_WEEKLY_SUMMARY_STALE_TIME_MS = 5 * 60 * 1000;

/** Valor do seletor quando nenhum clubinho foi escolhido. */
export const ALL_CLUBS_OPTION = 'all';

/** Rótulo de cada situação, igual ao vocabulário do controle de clubinhos. */
export const WEEK_STATUS_LABELS: Record<ClubWeekStatus, string> = {
  [ClubWeekStatus.Ok]: 'Em dia',
  [ClubWeekStatus.Partial]: 'Parcial',
  [ClubWeekStatus.Missing]: 'Sem pagela',
  [ClubWeekStatus.Pending]: 'Aguardando',
  [ClubWeekStatus.Exception]: 'Sem clubinho',
  [ClubWeekStatus.Inactive]: 'Desativado',
  [ClubWeekStatus.OutOfPeriod]: 'Fora do período',
};

/** O que cada situação significa, para o `title` da célula do quadro. */
export const WEEK_STATUS_DESCRIPTIONS: Record<ClubWeekStatus, string> = {
  [ClubWeekStatus.Ok]: 'Todas as crianças com pagela lançada',
  [ClubWeekStatus.Partial]: 'Parte das crianças ainda sem pagela',
  [ClubWeekStatus.Missing]: 'Nenhuma pagela lançada na semana',
  [ClubWeekStatus.Pending]: 'O dia do clubinho ainda não chegou',
  [ClubWeekStatus.Exception]: 'Dia sem Clubinho registrado no calendário',
  [ClubWeekStatus.Inactive]: 'Clubinho desativado nesta semana',
  [ClubWeekStatus.OutOfPeriod]: 'Semana fora do período letivo',
};

/**
 * Gravidade de cada situação, no vocabulário do MUI.
 *
 * `pending`, `exception` e `out_of_period` são informativos de propósito:
 * nenhum deles é falta de alguém.
 */
export const WEEK_STATUS_SEVERITY: Record<
  ClubWeekStatus,
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  [ClubWeekStatus.Ok]: 'success',
  [ClubWeekStatus.Partial]: 'warning',
  [ClubWeekStatus.Missing]: 'error',
  [ClubWeekStatus.Pending]: 'info',
  [ClubWeekStatus.Exception]: 'info',
  [ClubWeekStatus.Inactive]: 'default',
  [ClubWeekStatus.OutOfPeriod]: 'default',
};

/** As situações que pedem atenção de quem coordena. */
export const WEEK_STATUSES_WITH_PENDENCY: ClubWeekStatus[] = [
  ClubWeekStatus.Missing,
  ClubWeekStatus.Partial,
];

/** A ordem em que as situações aparecem na legenda do quadro. */
export const WEEK_STATUS_LEGEND_ORDER: ClubWeekStatus[] = [
  ClubWeekStatus.Ok,
  ClubWeekStatus.Partial,
  ClubWeekStatus.Missing,
  ClubWeekStatus.Pending,
  ClubWeekStatus.Exception,
  ClubWeekStatus.Inactive,
  ClubWeekStatus.OutOfPeriod,
];

/**
 * A etiqueta de cada trecho da linha do tempo.
 *
 * `past` fica vazio de propósito: quase toda semana da lista já passou, e uma
 * etiqueta repetida em todos os cartões não distingue nada.
 */
export const WEEK_TIMELINE_BADGES: Record<ClubWeekTimeline, string | null> = {
  [ClubWeekTimeline.Past]: null,
  [ClubWeekTimeline.Current]: 'atual',
  [ClubWeekTimeline.Future]: 'ainda não chegou',
};

/** Altura do gráfico da linha do tempo, por faixa de tela. */
export const COVERAGE_CHART_HEIGHT = { xs: 180, sm: 220, md: 260 } as const;

/**
 * Da situação mais grave para a mais branda.
 *
 * A faixa do ano pinta cada semana pela pior situação entre os clubinhos dela:
 * uma semana em que um clubinho não lançou nada não pode aparecer verde só
 * porque os outros dois fecharam.
 */
export const WEEK_STATUS_SEVERITY_ORDER: ClubWeekStatus[] = [
  ClubWeekStatus.Missing,
  ClubWeekStatus.Partial,
  ClubWeekStatus.Pending,
  ClubWeekStatus.Exception,
  ClubWeekStatus.Ok,
  ClubWeekStatus.Inactive,
  ClubWeekStatus.OutOfPeriod,
];

/**
 * Lado de cada quadradinho da faixa do ano, por faixa de tela.
 *
 * Maior no celular do que no desktop, de propósito: ali o quadrado é um alvo
 * de toque, e 44 px é o mínimo para o polegar. Com o mouse, 30 px sobram e
 * deixam o ano inteiro caber em menos linhas.
 */
export const HEAT_STRIP_CELL_SIZE = { xs: 44, sm: 30 } as const;

/** Os status que representam um encontro que devia ter acontecido. */
export const WEEK_STATUSES_WITH_MEETING: ClubWeekStatus[] = [
  ClubWeekStatus.Ok,
  ClubWeekStatus.Partial,
  ClubWeekStatus.Missing,
  ClubWeekStatus.Pending,
];

/** As visões oferecidas, na ordem em que aparecem. */
export const RANGE_GRANULARITIES: RangeGranularity[] = [
  RangeGranularity.Week,
  RangeGranularity.Month,
  RangeGranularity.Quarter,
  RangeGranularity.Year,
];

/** O nome de cada visão. */
export const RANGE_GRANULARITY_LABELS: Record<RangeGranularity, string> = {
  [RangeGranularity.Week]: 'Semana',
  [RangeGranularity.Month]: 'Mês',
  [RangeGranularity.Quarter]: 'Trimestre',
  [RangeGranularity.Year]: 'Ano',
};

/** O que o botão "voltar para agora" diz em cada visão. */
export const RANGE_CURRENT_LABELS: Record<RangeGranularity, string> = {
  [RangeGranularity.Week]: 'Semana atual',
  [RangeGranularity.Month]: 'Mês atual',
  [RangeGranularity.Quarter]: 'Trimestre atual',
  [RangeGranularity.Year]: 'Ano letivo',
};

/**
 * Largura da página, igual à das telas de conteúdo do site.
 *
 * Quase toda a largura no celular, com uma folga maior no desktop — é a mesma
 * régua de `IdeasPageView`, `PageVideoView` e `WeekMaterialsPageView`.
 */
export const PAGE_WIDTH = { xs: '98%', md: '95%' } as const;
