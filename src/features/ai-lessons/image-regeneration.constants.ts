import { LessonStageType } from './types';

export const IMAGE_REGENERATION_INSTRUCTIONS_MAX_LENGTH = 500;

/** Items whose artwork is produced and checked as a set: all images or none. */
export const IMAGE_SET_STAGES: readonly LessonStageType[] = [LessonStageType.MEDITATION_OLDER];

/** Key of the master image prompt inside a version's structured data. */
export const IMAGE_BRIEF_FIELD = 'imageBrief';

export const IMAGE_REGENERATION_TEXTS = {
  brief: {
    title: 'Prompt mestre das imagens',
    reused:
      'As imagens marcadas serão refeitas com o mesmo prompt mestre desta versão, cada uma com a sua parte.',
    rewritten:
      'Com todas marcadas, o prompt mestre é escrito de novo a partir das regras, das suas orientações e da lição.',
    created:
      'Esta versão ainda não tem prompt mestre. Ele será escrito agora e guardado para as próximas vezes.',
    artDirection: 'Direção de arte (igual em todas as imagens)',
    part: 'Parte desta imagem',
    show: 'Ver prompt mestre',
    hide: 'Ocultar prompt mestre',
  },
  button: 'Regerar imagens',
  title: 'Regerar imagens',
  intro:
    'Marque as imagens que você quer refazer. O texto do item e as imagens não marcadas ficam exatamente como estão.',
  setOnly:
    'As imagens deste item são produzidas e conferidas em conjunto, por isso só é possível regerar todas.',
  someTitle: 'Refazer só algumas imagens',
  fullTitle: 'Refazer o item inteiro',
  fullDescription:
    'Monta de novo a lista de elementos e gera todas as imagens. Use para mudar quantidade, estilo ou formato.',
  fullChangeChoices: 'Alterar escolhas',
  fullKeepChoices: 'Refazer tudo com as escolhas atuais',
  selectAll: 'Marcar todas',
  clear: 'Desmarcar todas',
  instructionsLabel: 'O que mudar? (opcional)',
  instructionsHelp:
    'Vale só para as imagens marcadas. Ex.: "sem texto na arte", "personagens maiores".',
  firstImageNote:
    'A primeira imagem é a que define a aparência dos personagens. Ao refazê-la sem as outras, a nova segue as imagens que ficaram.',
  continuityNote:
    'Uma imagem que fica é enviada como guia de estilo, para a nova manter o mesmo traço, cores e rostos. Confira o resultado: pequenas diferenças ainda podem aparecer.',
  outcome:
    'O item volta para rascunho com uma versão nova e precisa ser concluído de novo. A versão atual continua no histórico.',
  confirm: (count: number) => (count === 1 ? 'Regerar 1 imagem' : `Regerar ${count} imagens`),
  confirmNone: 'Escolha ao menos uma imagem',
  submitting: 'Enviando…',
  cancel: 'Cancelar',
  close: 'Fechar',
  fallbackError: 'Não foi possível regerar as imagens. Tente novamente.',
  blocked: {
    unsaved: 'Salve ou descarte a edição antes de regerar imagens.',
    stale: 'Este item está desatualizado em relação aos anteriores: gere o item por completo.',
    missing: 'Há imagens que ainda não foram geradas: gere o item por completo.',
  },
} as const;
