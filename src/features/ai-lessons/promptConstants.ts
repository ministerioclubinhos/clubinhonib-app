import { LessonStageType } from './types';
export const ORDER = Object.values(LessonStageType);

export const STAGE_CONFIG: Record<
  LessonStageType,
  { label: string; shortLabel: string; description: string; icon: string }
> = {
  LESSON: {
    label: '1. Lição Completa',
    shortLabel: '1. Lição',
    description: 'Orientação geral para a narrativa da lição, teologia e escolha do versículo NVI.',
    icon: '📖',
  },
  LESSON_VISUALS: {
    label: '2. Visuais da História',
    shortLabel: '2. Visuais',
    description: 'Diretrizes para ilustrações e cenas cronológicas da história bíblica.',
    icon: '🎨',
  },
  STANDARD_GAME: {
    label: '3. Brincadeira Prática',
    shortLabel: '3. Brincadeira',
    description: 'Instruções para a dinâmica prática e brincadeira em grupo.',
    icon: '🏃',
  },
  VERSE_VISUALS: {
    label: '4. Visuais do Versículo',
    shortLabel: '4. Vis. Versículo',
    description: 'Regras para a sequência de imagens mnemônicas de memorização.',
    icon: '🧩',
  },
  VERSE_FIXATION: {
    label: '5. Fixação Divertida',
    shortLabel: '5. Fixação',
    description: 'Orientações para o jogo ou atividade interativa de memorização.',
    icon: '🎯',
  },
  MEDITATION_YOUNGER: {
    label: '6. Meditação dos Menores',
    shortLabel: '6. Med. Menores',
    description: 'Diretrizes pedagógicas para crianças de 5 a 7 anos (2 atividades).',
    icon: '✏️',
  },
  MEDITATION_OLDER: {
    label: '7. Meditação dos Maiores',
    shortLabel: '7. Med. Maiores',
    description: 'Diretrizes de reflexão e gabarito para crianças de 8 a 11 anos (3 atividades).',
    icon: '🧠',
  },
  MANUAL_WORK: {
    label: '8. Trabalho Manual',
    shortLabel: '8. Trab. Manual',
    description: 'Instruções para o desenho em preto e branco para recortar e colorir.',
    icon: '✂️',
  },
};

export const PROMPT_PRESETS = [
  {
    label: 'Linguagem Simples',
    text: '\n• Use vocabulário simples, direto e adaptado para a compreensão infantil.',
  },
  {
    label: 'Aplicação Prática',
    text: '\n• Conecte cada ensinamento com situações reais da rotina das crianças em casa e na escola.',
  },
  {
    label: 'Foco em Oração',
    text: '\n• Enfatize atitudes de gratidão e momentos curtos de oração espontânea.',
  },
  {
    label: 'Perguntas Interativas',
    text: '\n• Inclua perguntas abertas que estimulem a reflexão e resposta ativa das crianças.',
  },
];

/**
 * Exemplo do que cabe na orientação de cada etapa, mostrado no campo vazio.
 *
 * Quem abre a tela pela primeira vez não sabe que tipo de instrução ajuda: o
 * exemplo mostra o tom e o tamanho certos, sem ser gravado.
 */
export const PROMPT_STAGE_EXAMPLES: Record<LessonStageType, string> = {
  LESSON:
    'Ex.: Conte a história em frases curtas, com uma pergunta para as crianças a cada parte. Termine com uma aplicação para a semana em casa.',
  LESSON_VISUALS:
    'Ex.: Prefira personagens com expressões bem claras e cores vivas. Evite cenas com muitos elementos ao fundo.',
  STANDARD_GAME:
    'Ex.: Use brincadeiras que funcionem em sala pequena, sem material além de papel e fita. Todos participam ao mesmo tempo.',
  VERSE_VISUALS:
    'Ex.: Use objetos do dia a dia da criança para lembrar cada trecho do versículo.',
  VERSE_FIXATION:
    'Ex.: Proponha uma dinâmica com gestos para cada parte do versículo, que possa ser repetida em roda.',
  MEDITATION_YOUNGER:
    'Ex.: Atividades de ligar e colorir, com no máximo uma frase de instrução cada.',
  MEDITATION_OLDER:
    'Ex.: Inclua uma pergunta de aplicação pessoal e deixe linhas para a criança escrever.',
  MANUAL_WORK:
    'Ex.: Desenho com traços grossos e poucas áreas pequenas, fácil de recortar por crianças de 5 anos.',
};

/** Textos da tela de orientações. */
export const PROMPT_TEXTS = {
  title: 'Orientações de criação',
  subtitle:
    'Diga à inteligência artificial como você quer cada etapa da lição. Ela soma o que você escrever às regras oficiais.',
  personalTitle: 'Estas orientações são só suas',
  personalBody:
    'Valem para tudo o que você gerar daqui em diante. Cada administrador tem as próprias, e as lições que já foram geradas não mudam.',
  protectedNote:
    'As regras oficiais de cada etapa — estrutura, fidelidade bíblica, segurança e Bíblia NVI — continuam valendo e não podem ser desligadas por aqui.',
  editorLabel: 'Sua orientação para esta etapa',
  presetsLabel: 'Sugestões prontas — toque para acrescentar:',
  baseTitle: 'Regras oficiais desta etapa (não editáveis)',
  baseHelper: 'É o que a IA sempre recebe. A sua orientação é somada a este texto.',
  previewTitle: 'Como a IA vai receber (regras oficiais + a sua orientação)',
  previewHelper: 'Prévia do texto completo enviado à IA nesta etapa.',
  official: 'Padrão oficial',
  custom: 'Personalizada',
  pending: 'Alterações não salvas',
  save: 'Salvar orientação',
  saving: 'Salvando…',
  remove: 'Remover minha orientação',
  restore: 'Voltar ao padrão oficial',
  discard: 'Descartar alterações',
  saved: 'Orientação salva. Ela vale para as suas próximas gerações.',
  restored: 'Orientação removida. Esta etapa voltou ao padrão oficial.',
  saveShortcut: 'Ctrl+S salva',
  loadError: 'Não foi possível carregar as orientações de criação.',
} as const;
