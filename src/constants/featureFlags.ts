/**
 * As feature flags que a aplicação consulta.
 *
 * Uma chave por recurso: quem enxerga cada um é decidido pelos perfis alvo da
 * flag, no painel, e nunca pelo nome da chave.
 */
export interface FeatureFlags {
  /** Área das Crianças: consulta das crianças e das pagelas. */
  children_area: boolean;
  /** Envio de fotos do clubinho. */
  club_photo_upload: boolean;
  /** Lista de materiais da visita semanal. */
  weekly_materials: boolean;
  /** Formulário de avaliação do site. */
  site_feedback: boolean;
  /** Envio de uma ideia para a fila de revisão. */
  idea_submission: boolean;
  /** Galeria das ideias já publicadas. */
  ideas_sharing: boolean;
  /** Página de eventos e os atalhos que levam até ela. */
  events_section: boolean;
  /** Feed de fotos dos clubinhos. */
  clubinho_feed: boolean;
  /** Painel de estatísticas. */
  statistics: boolean;
  /** Controle operacional dos clubinhos. */
  club_control: boolean;
  /** Gestão das pagelas no painel. */
  pagelas: boolean;

  /** Página do Dia Especial da Família e o convite que leva até ela. */
  special_family_day: boolean;
  /** Criação de conta pelo site. */
  public_registration: boolean;
  /** Login e cadastro pela conta Google. */
  google_login: boolean;
  /** Pedido de recuperação e redefinição de senha. */
  password_recovery: boolean;
  /** Formulário público de contato. */
  contact_form: boolean;
  /** Depoimentos publicados na página inicial. */
  home_comments: boolean;
  /** Páginas públicas de galerias de fotos. */
  public_galleries: boolean;
  /** Páginas públicas de galerias de vídeos. */
  public_videos: boolean;
  /** Meditação da semana e o banner que leva até ela. */
  weekly_meditation: boolean;
  /** Seção de documentos da área do professor. */
  documents_library: boolean;
  /** Seção de vídeos de treinamento. */
  training_videos: boolean;
  /** Seção com o passo a passo da aula. */
  teaching_steps: boolean;
  /** Versículo da semana na área do professor. */
  verse_of_week: boolean;
  /** Carrossel de informativos. */
  informative_banners: boolean;
  /** Pedido de vínculo a um clubinho pelo próprio usuário. */
  club_link_request: boolean;
  /** Registro da decisão por Cristo de uma criança. */
  accepted_christs: boolean;
  /** Fila de revisão das fotos enviadas pelos clubinhos. */
  photo_moderation: boolean;
  /** Fila de revisão das ideias compartilhadas. */
  idea_moderation: boolean;
  /** Moderação dos comentários enviados ao site. */
  comment_moderation: boolean;
}

/**
 * O que vale enquanto a resposta do servidor não chega, e quando ela falha.
 *
 * São os mesmos valores das flags de fábrica: uma queda de rede não pode fazer
 * áreas inteiras sumirem da tela.
 */
export const MOCKED_FEATURE_FLAGS: FeatureFlags = {
  children_area: false,
  club_photo_upload: true,
  weekly_materials: true,
  site_feedback: true,
  idea_submission: true,
  ideas_sharing: true,
  events_section: true,
  clubinho_feed: true,
  statistics: true,
  club_control: true,
  pagelas: true,

  // O Dia Especial da Família é sazonal: nasce desligado.
  special_family_day: false,
  public_registration: true,
  google_login: true,
  password_recovery: true,
  contact_form: true,
  home_comments: true,
  public_galleries: true,
  public_videos: true,
  weekly_meditation: true,
  documents_library: true,
  training_videos: true,
  teaching_steps: true,
  verse_of_week: true,
  informative_banners: true,
  club_link_request: true,
  accepted_christs: true,
  photo_moderation: true,
  idea_moderation: true,
  comment_moderation: true,
};
