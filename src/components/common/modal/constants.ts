import { ToggleActiveCopy, ToggleActiveSubject } from './types';

/**
 * O texto do diálogo de ativar/desativar, por assunto.
 *
 * Fica aqui, e não espalhado em cada tela que abre o diálogo, para as três
 * chamadas não divergirem no tom — e para um assunto novo ser uma entrada nesta
 * tabela, não um `if` a mais dentro do componente.
 */
export const TOGGLE_ACTIVE_COPY: Record<
  ToggleActiveSubject,
  { deactivate: ToggleActiveCopy; activate: ToggleActiveCopy; fallbackName: string }
> = {
  [ToggleActiveSubject.Child]: {
    deactivate: {
      question: 'Criança não frequenta mais o clubinho?',
      consequence:
        'Esta criança ficará inativa e sairá das estatísticas do clubinho.',
    },
    activate: {
      question: 'Criança voltou a frequentar o clubinho?',
      consequence:
        'Esta criança ficará ativa e entrará nas estatísticas do clubinho.',
    },
    fallbackName: 'esta criança',
  },
  [ToggleActiveSubject.Club]: {
    deactivate: {
      question: 'Este clubinho não vai mais funcionar?',
      consequence:
        'O clubinho ficará inativo e todos os dias dele saem do calendário. As crianças e os professores continuam vinculados, e reativar traz os dias de volta.',
    },
    activate: {
      question: 'Este clubinho voltou a funcionar?',
      consequence:
        'O clubinho ficará ativo e os dias dele voltam ao calendário, valendo a partir de hoje.',
    },
    fallbackName: 'este clubinho',
  },
};

/**
 * Texto da confirmação de saída com edição pendente.
 *
 * O botão que descarta diz o que descarta: "Sair" sozinho não avisa que o
 * trabalho da última meia hora vai embora com o clique.
 */
export const UNSAVED_CHANGES_COPY = {
  title: 'Sair sem salvar?',
  content:
    'Esta página tem alterações que ainda não foram salvas. Se sair agora, elas serão perdidas.',
  confirm: 'Sair sem salvar',
  cancel: 'Continuar editando',
} as const;
