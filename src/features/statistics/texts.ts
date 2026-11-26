import { DecisionType, PeriodShortcut } from './types';
import { StatisticsTab } from './constants';

/**
 * Todo o texto da página de estatísticas, em linguagem de quem não é da área.
 *
 * Regra: nada de "taxa", "score", "engajamento" ou "performance". Cada número
 * vem com uma frase dizendo o que ele quer dizer.
 */

export const STATISTICS_TEXTS = {
  title: 'Estatísticas',
  subtitle: 'Como estão as crianças, os clubinhos e as equipes, em poucas palavras.',
  periodLabel: 'Período',
  refresh: 'Atualizar',
  updatedAt: (when: string) => `Dados de ${when}`,
  loadingData: 'Carregando os dados…',
  loadError: 'Não foi possível carregar estes números agora.',
  retry: 'Tentar de novo',
  empty: 'Ainda não há dados para mostrar aqui.',
  noValue: '—',
  seeDetails: 'Ver detalhes',
} as const;

export const PLAIN_PERIOD_LABELS: Partial<Record<PeriodShortcut, string>> = {
  [PeriodShortcut.THIS_WEEK]: 'Esta semana',
  [PeriodShortcut.THIS_MONTH]: 'Este mês',
  [PeriodShortcut.LAST_30_DAYS]: 'Últimos 30 dias',
  [PeriodShortcut.THIS_YEAR]: 'Este ano',
};

export const STATISTICS_TAB_LABELS: Record<StatisticsTab, string> = {
  [StatisticsTab.Summary]: 'Resumo',
  [StatisticsTab.Children]: 'Crianças',
  [StatisticsTab.Clubs]: 'Clubinhos',
  [StatisticsTab.Teachers]: 'Professores',
  [StatisticsTab.Coordinators]: 'Coordenadores',
};

export const STATISTICS_TAB_INTRO: Record<StatisticsTab, string> = {
  [StatisticsTab.Summary]: 'O retrato geral: quantas crianças, como está a presença e o que merece atenção.',
  [StatisticsTab.Children]: 'Quem são as crianças, quem mais vem e quem está sumido.',
  [StatisticsTab.Clubs]: 'Como cada clubinho está: presença, tamanho e se lançou a pagela da semana.',
  [StatisticsTab.Teachers]: 'Quem está lançando as pagelas e em quais clubinhos.',
  [StatisticsTab.Coordinators]: 'Quantos clubinhos cada coordenador cuida e como eles estão indo.',
};

export const RATE_TONE_WORDS = {
  good: 'Vai bem',
  medium: 'Pode melhorar',
  low: 'Precisa de atenção',
} as const;

/** Frase que traduz a porcentagem de presença. */
export const presencePhrase = (outOfTen: number): string =>
  `${outOfTen} de cada 10 crianças esperadas vieram`;

/** Com o que o cartão de variação compara, por período. */
const GROWTH_COMPARISON: Partial<Record<PeriodShortcut, { title: string; than: string }>> = {
  [PeriodShortcut.THIS_WEEK]: { title: 'Em relação à semana passada', than: 'do que na semana passada' },
  [PeriodShortcut.THIS_MONTH]: { title: 'Em relação ao mês passado', than: 'do que no mês passado' },
  [PeriodShortcut.LAST_30_DAYS]: { title: 'Em relação aos 30 dias antes', than: 'do que nos 30 dias antes' },
  [PeriodShortcut.THIS_YEAR]: { title: 'Em relação ao ano passado', than: 'do que no ano passado, até esta data' },
};

export const SUMMARY_TEXTS = {
  childrenTitle: 'Crianças cadastradas',
  childrenHint: (cameThisMonth: number) => `${cameThisMonth} vieram em algum encontro este mês`,
  presenceTitle: 'Presença',
  decisionsTitle: 'Decisões por Jesus',
  decisionsHint: 'Crianças que aceitaram Jesus ou se reconciliaram',
  clubsTitle: 'Clubinhos',
  clubsHint: 'Clubinhos ativos',
  meditationTitle: 'Meditação',
  meditationHint: (n: number) => `${n} de cada 10 fizeram a meditação`,
  verseTitle: 'Versículo',
  verseHint: (n: number) => `${n} de cada 10 recitaram o versículo`,
  newTitle: 'Crianças novas',
  newHint: 'Chegaram há menos de 3 meses',
  growthTitle: (period: PeriodShortcut) => GROWTH_COMPARISON[period]?.title ?? 'Em relação ao período anterior',
  growthThan: (period: PeriodShortcut) => GROWTH_COMPARISON[period]?.than ?? 'no período anterior',
  growthUp: (n: string, than: string) => `Mais ${n}% de presenças ${than}`,
  growthDown: (n: string, than: string) => `Menos ${n}% de presenças ${than}`,
  growthSame: 'Mesma quantidade de presenças',
  weeksTitle: 'Quantas crianças vieram por semana',
  weeksHelp: 'Cada coluna é uma semana. Quanto mais alta, mais crianças vieram.',
  weekUp: (n: number) => `Na última semana vieram ${n} crianças a mais que na anterior.`,
  weekDown: (n: number) => `Na última semana vieram ${n} crianças a menos que na anterior.`,
  weekSame: 'A última semana teve o mesmo número de crianças que a anterior.',
  attentionTitle: 'O que merece atenção',
  attentionNone: 'Nada preocupante por agora. Tudo dentro do esperado.',
  pagelasTitle: 'Pagelas da semana',
  pagelasHelp: 'Quantos clubinhos já lançaram a pagela. Em dia, tudo marcado de verde.',
  lastWeek: 'Semana passada',
  thisWeek: 'Esta semana',
  thisWeekWaiting: 'Ainda não chegou o dia dos clubinhos',
  decisionsListTitle: 'Últimas decisões por Jesus',
  decisionsListHelp: 'Para celebrar e acompanhar.',
  decisionsEmpty: 'Nenhuma decisão registrada ainda.',
  goClubs: 'Ver clubinhos',
  goChildren: 'Ver crianças',
} as const;

export const CHILDREN_TEXTS = {
  totalTitle: 'Crianças cadastradas',
  presenceTitle: 'Presença média',
  presenceHint: 'Dos encontros esperados, quantos a criança foi',
  ageTitle: 'Idade média',
  ageHint: 'Anos, entre todas as crianças',
  decidedTitle: 'Já decidiram por Jesus',
  inactive: (n: number) => `${n} desativadas`,
  genderTitle: 'Meninos e meninas',
  agesTitle: 'Quantos anos elas têm',
  timeTitle: 'Há quanto tempo vêm ao clubinho',
  topTitle: 'Quem mais vem',
  topHelp: 'As crianças com a maior presença.',
  lowTitle: 'Quem precisa de uma visita',
  lowHelp: 'Crianças que vêm pouco. Vale conversar com a família.',
  decisionsTitle: 'Decisões por Jesus no período',
  recentTitle: 'Últimas decisões por Jesus',
  newcomersTitle: 'Chegaram há pouco',
  newcomersHelp: 'Crianças novas: vale dar boas-vindas e acompanhar de perto.',
  newcomerCaption: (months: number, club?: number) =>
    `${months < 1 ? 'Entrou este mês' : `Entrou há ${months} ${months === 1 ? 'mês' : 'meses'}`}${club ? ` · Clubinho ${club}` : ''}`,
  meditationTitle: 'Fazem a meditação',
  verseTitle: 'Recitam o versículo',
  ofTen: (n: number) => `${n} de cada 10`,
  needsPagelas: `Só aparecem crianças com pelo menos 3 pagelas.`,
  male: 'Meninos',
  female: 'Meninas',
} as const;

export const CLUBS_TEXTS = {
  totalTitle: 'Clubinhos ativos',
  avgChildrenTitle: 'Crianças por clubinho',
  avgChildrenHint: 'Em média',
  presenceTitle: 'Presença média',
  decisionsTitle: 'Decisões por Jesus',
  presenceListTitle: 'Presença em cada clubinho',
  presenceListHelp: 'Verde vai bem, laranja pode melhorar, vermelho precisa de atenção.',
  sizeListTitle: 'Quantas crianças em cada clubinho',
  weekTitle: 'Pagela desta semana',
  weekHelp: 'Quais clubinhos já lançaram a pagela da semana.',
  citiesTitle: 'Em quais cidades estão',
  noPagelas: 'Sem pagelas',
  attentionTitle: 'O que merece atenção',
  attentionNone: 'Todos os clubinhos estão em dia.',
  lastWeekTitle: 'Pagela da semana passada',
  thisWeekHelp: 'Na segunda-feira ainda é cedo: quem tem o dia depois aparece como "Ainda não é o dia".',
  weekdaysTitle: 'Em que dia acontecem',
  lastPagela: (when: string) => `Última pagela: ${when}`,
  clubName: (number: number, city?: string) => (city ? `Clubinho ${number} · ${city}` : `Clubinho ${number}`),
  children: (n: number) => `${n} ${n === 1 ? 'criança' : 'crianças'}`,
} as const;

export const TEACHERS_TEXTS = {
  totalTitle: 'Professores',
  totalHint: (inClubs: number) => `${inClubs} estão num clubinho ativo`,
  launchedTitle: 'Lançaram pagela',
  launchedHint: 'No período escolhido',
  notLaunchedTitle: 'Ainda não lançaram',
  notLaunchedHint: 'Dos que estão num clubinho, nenhuma pagela no período',
  topTitle: 'Quem mais lançou pagelas',
  topHelp: 'Quem lançou mais pagelas. O anel mostra quanto cada um lançou em relação ao primeiro.',
  byClubTitle: 'Professores em cada clubinho',
  attentionTitle: 'O que merece atenção',
  idleAlert: (n: number) => `${n} ${n === 1 ? 'professor ainda não lançou' : 'professores ainda não lançaram'} pagela no período`,
  idleTitle: 'Sem pagela no período',
  idleHelp: 'Pode ser alguém novo, de férias ou que precisa de ajuda com o sistema.',
  idleMore: (n: number) => `e mais ${n}`,
  pagelas: (n: number) => `${n} ${n === 1 ? 'pagela' : 'pagelas'}`,
  none: 'Todos os clubinhos têm professor e todos lançaram pagela.',
} as const;

export const COORDINATORS_TEXTS = {
  totalTitle: 'Coordenadores',
  withClubsTitle: 'Cuidam de clubinhos',
  withoutClubsTitle: 'Sem clubinho',
  withoutClubsHint: 'Ainda não foram ligados a nenhum clubinho',
  avgClubsTitle: 'Clubinhos por coordenador',
  avgClubsHint: 'Em média, entre quem cuida de algum',
  attentionTitle: 'O que merece atenção',
  attentionNone: 'Todos os clubinhos têm coordenador e estão com a pagela em dia.',
  listTitle: 'Cada coordenador',
  listHelp: 'A presença é a média dos clubinhos que a pessoa coordena.',
  clubs: (n: number) => `${n} ${n === 1 ? 'clubinho' : 'clubinhos'}`,
  children: (n: number) => `${n} ${n === 1 ? 'criança' : 'crianças'}`,
  noClubs: 'Sem clubinhos',
  withoutTitle: 'Ainda sem clubinho',
  withoutHelp: 'Foram cadastrados, mas não estão ligados a nenhum clubinho.',
  withoutMore: (n: number) => `e mais ${n}`,
  inactive: 'Inativo',
} as const;

export const DECISION_LABELS: Record<DecisionType, string> = {
  [DecisionType.ACCEPTED]: 'Aceitaram Jesus',
  [DecisionType.RECONCILED]: 'Se reconciliaram',
};

export const AGE_GROUP_LABELS: Record<string, string> = {
  '0-5': 'Até 5 anos',
  '6-10': 'De 6 a 10 anos',
  '11-15': 'De 11 a 15 anos',
  '16+': '16 anos ou mais',
};

export const PARTICIPATION_LABELS: Record<string, string> = {
  '0-3 meses': 'Menos de 3 meses',
  '3-6 meses': 'De 3 a 6 meses',
  '6-12 meses': 'De 6 meses a 1 ano',
  '1+ ano': 'Mais de 1 ano',
};

export const WEEKLY_STATUS_PLAIN: Record<string, string> = {
  ok: 'Lançou',
  partial: 'Lançou em parte',
  missing: 'Não lançou',
  pending: 'Ainda não é o dia',
  vacation: 'De férias',
  inactive: 'Inativo',
  out_of_period: 'Fora do ano letivo',
};

export const ALERT_TEXTS = {
  missingLastWeek: (n: number) =>
    `${n} ${n === 1 ? 'clubinho não lançou' : 'clubinhos não lançaram'} a pagela da semana passada`,
  missingThisWeek: (n: number) =>
    `${n} ${n === 1 ? 'clubinho não lançou' : 'clubinhos não lançaram'} a pagela desta semana`,
  partial: (n: number) =>
    `${n} ${n === 1 ? 'clubinho lançou' : 'clubinhos lançaram'} só parte das pagelas`,
  weekRange: (start: string, end: string) => `Semana de ${start} a ${end}`,
  lowPresence: (n: number) => `${n} ${n === 1 ? 'clubinho está' : 'clubinhos estão'} com pouca presença`,
  lowPresenceDetail: 'Menos de 6 em cada 10 crianças esperadas vieram.',
  stale: (n: number, days: number) =>
    `${n} ${n === 1 ? 'clubinho está' : 'clubinhos estão'} há mais de ${days} dias sem lançar pagela`,
  noChildren: (n: number) => `${n} ${n === 1 ? 'clubinho está' : 'clubinhos estão'} sem nenhuma criança ativa`,
  noTeacher: (n: number) => `${n} ${n === 1 ? 'clubinho está' : 'clubinhos estão'} sem professor`,
  noCoordinator: (n: number) => `${n} ${n === 1 ? 'clubinho está' : 'clubinhos estão'} sem coordenador`,
  lowChildren: (n: number) => `${n} ${n === 1 ? 'criança vem' : 'crianças vêm'} pouco aos encontros`,
  lowChildrenDetail: 'Vale conversar com a família.',
  coordinatorPending: (n: number) =>
    `${n} ${n === 1 ? 'coordenador tem' : 'coordenadores têm'} clubinho sem pagela da semana passada`,
  goClubs: 'Ver clubinhos',
  goChildren: 'Ver crianças',
  goCoordinators: 'Ver coordenadores',
  goTeachers: 'Ver professores',
} as const;

export const WEEKDAY_PLAIN: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const TONE_LEGEND = {
  good: 'Vai bem',
  attention: 'Atenção',
  help: 'Precisa de ajuda',
  info: 'Informação',
} as const;

export const STATUS_BANNER_TEXTS = {
  good: 'Tudo em dia',
  goodDetail: 'Nenhum clubinho ou criança pedindo atenção agora.',
  attention: (n: number) => `${n} ${n === 1 ? 'ponto merece' : 'pontos merecem'} atenção`,
  attentionDetail: 'Veja abaixo quem são e o que fazer.',
  help: (n: number) => `${n} ${n === 1 ? 'ponto precisa' : 'pontos precisam'} de ajuda agora`,
  helpDetail: 'Há clubinhos que não lançaram a pagela. Veja quem são abaixo.',
} as const;
