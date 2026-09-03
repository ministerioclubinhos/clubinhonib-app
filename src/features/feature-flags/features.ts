import type { FeatureFlags } from '@/constants/featureFlags';

/**
 * A chave de cada flag usada pela aplicação.
 *
 * Uma flag por recurso. O perfil que enxerga o recurso vem dos perfis alvo da
 * flag, definidos no painel — por isso nenhuma chave carrega o nome de um
 * perfil.
 *
 * O tipo é `keyof FeatureFlags`, então uma chave escrita errada não compila.
 */
export const FEATURE = {
  /** Área das Crianças: consulta das crianças e das pagelas. */
  CHILDREN_AREA: 'children_area',
  /** Envio de fotos do clubinho. */
  CLUB_PHOTO_UPLOAD: 'club_photo_upload',
  /** Lista de materiais da visita semanal. */
  WEEKLY_MATERIALS: 'weekly_materials',
  /** Formulário de avaliação do site. */
  SITE_FEEDBACK: 'site_feedback',
  /** Envio de uma ideia para a fila de revisão. */
  IDEA_SUBMISSION: 'idea_submission',
  /** Galeria das ideias já publicadas. */
  IDEAS_SHARING: 'ideas_sharing',
  /** Página de eventos e os atalhos que levam até ela. */
  EVENTS_SECTION: 'events_section',
  /** Feed de fotos dos clubinhos. */
  CLUBINHO_FEED: 'clubinho_feed',
  /** Painel de estatísticas. */
  STATISTICS: 'statistics',
  /** Controle operacional dos clubinhos. */
  CLUB_CONTROL: 'club_control',
  /** Gestão das pagelas no painel. */
  PAGELAS: 'pagelas',

  /** Página do Dia Especial da Família e o convite que leva até ela. */
  SPECIAL_FAMILY_DAY: 'special_family_day',
  /** Criação de conta pelo site. */
  PUBLIC_REGISTRATION: 'public_registration',
  /** Login e cadastro pela conta Google. */
  GOOGLE_LOGIN: 'google_login',
  /** Pedido de recuperação e redefinição de senha. */
  PASSWORD_RECOVERY: 'password_recovery',
  /** Formulário público de contato. */
  CONTACT_FORM: 'contact_form',
  /** Depoimentos publicados na página inicial. */
  HOME_COMMENTS: 'home_comments',
  /** Páginas públicas de galerias de fotos. */
  PUBLIC_GALLERIES: 'public_galleries',
  /** Páginas públicas de galerias de vídeos. */
  PUBLIC_VIDEOS: 'public_videos',
  /** Meditação da semana e o banner que leva até ela. */
  WEEKLY_MEDITATION: 'weekly_meditation',
  /** Seção de documentos da área do professor. */
  DOCUMENTS_LIBRARY: 'documents_library',
  /** Seção de vídeos de treinamento. */
  TRAINING_VIDEOS: 'training_videos',
  /** Seção com o passo a passo da aula. */
  TEACHING_STEPS: 'teaching_steps',
  /** Versículo da semana na área do professor. */
  VERSE_OF_WEEK: 'verse_of_week',
  /** Carrossel de informativos. */
  INFORMATIVE_BANNERS: 'informative_banners',
  /** Pedido de vínculo a um clubinho pelo próprio usuário. */
  CLUB_LINK_REQUEST: 'club_link_request',
  /** Registro da decisão por Cristo de uma criança. */
  ACCEPTED_CHRISTS: 'accepted_christs',
  /** Fila de revisão das fotos enviadas pelos clubinhos. */
  PHOTO_MODERATION: 'photo_moderation',
  /** Fila de revisão das ideias compartilhadas. */
  IDEA_MODERATION: 'idea_moderation',
  /** Moderação dos comentários enviados ao site. */
  COMMENT_MODERATION: 'comment_moderation',
} as const satisfies Record<string, keyof FeatureFlags>;

/** Uma chave de flag conhecida pela aplicação. */
export type FeatureKey = (typeof FEATURE)[keyof typeof FEATURE];
