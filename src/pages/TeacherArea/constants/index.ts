export const MOTIVATION_TEXT = '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com as crianças da sua comunidade?';

export const SECTION_DATA = [
  {
    icon: 'CheckCircle',
    color: '#4caf50',
    title: 'Objetivos da Área',
    items: [
      '📅 Materiais atualizados semanalmente seguindo o calendário bíblico',
      '👶 Conteúdos personalizados por faixa etária e temas específicos',
      '📚 Apoio didático completo com sugestões práticas de atividades',
      '🔄 Recursos interativos para engajar as crianças na palavra de Deus',
    ],
  },
  {
    icon: 'Info',
    color: '#2196f3',
    title: 'Orientações Importantes',
    items: [
      '🚩 Consulte o banner semanal para o tema e versículo atual',
      '🎨 Adapte os materiais à realidade e idade da sua turma',
      '💬 Compartilhe experiências e ideias com outros professores',
      '📖 Mantenha-se atualizado com as novidades da plataforma',
    ],
  },
  {
    icon: 'Lightbulb',
    color: '#ff9800',
    title: 'Dicas de Ouro',
    items: [
      '⏰ Prepare sua aula com antecedência para maior segurança',
      '🎭 Use criatividade para ensinar valores bíblicos de forma divertida',
      '🏠 Crie um ambiente acolhedor e seguro para as crianças',
      '🙏 Ore sempre antes e depois de cada encontro com as crianças',
    ],
  },
];

export const BANNER_STYLES = {
  specialFamily: {
    background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
    borderRadius: 4,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  ideasSharing: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  },
  motivation: {
    backgroundColor: '#e3f2fd',
    borderLeft: '6px solid #2196f3',
    borderRadius: 2,
  },
};

export const BANNER_HEIGHTS = {
  sideBySide: {
    xs: 200,
    sm: 230,
    md: 280,
  },
  standalone: {
    xs: 220,
    sm: 260,
    md: 320,
  },
  standaloneCompact: {
    xs: 220,
    sm: 260,
    md: 240,
  },
};

export const CONTAINER_STYLES = {
  main: {
    width: '100%',
    mt: 3,
    mb: 8,
    px: { xs: 2, md: 4 },
    bgcolor: '#f5f7fa',
  },
  paper: {
    p: { xs: 2, md: 5 },
    borderRadius: 3,
    background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
  },
};
