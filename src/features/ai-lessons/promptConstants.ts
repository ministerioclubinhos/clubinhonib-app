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
