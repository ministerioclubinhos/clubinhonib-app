export const MOTIVATION_TEXT = '💬 Que tal aproveitar esta semana para compartilhar o amor de Jesus com as crianças da sua comunidade?';

export interface BibleVerse {
  text: string;
  reference: string;
}

export const WEEKLY_VERSES: BibleVerse[] = [
  {
    text: 'Deixai vir a mim as crianças e não as impeçais, porque delas é o Reino de Deus.',
    reference: 'Marcos 10:14',
  },
  {
    text: 'Ensina a criança no caminho em que deve andar, e, ainda quando for velho, não se desviará dele.',
    reference: 'Provérbios 22:6',
  },
  {
    text: 'Estas palavras que hoje te ordeno estarão no teu coração; e as ensinarás a teus filhos.',
    reference: 'Deuteronômio 6:6-7',
  },
  {
    text: 'Ide, portanto, fazei discípulos de todas as nações... ensinando-os a guardar todas as coisas que vos tenho ordenado.',
    reference: 'Mateus 28:19-20',
  },
  {
    text: 'Lâmpada para os meus pés é a tua palavra e luz para os meus caminhos.',
    reference: 'Salmos 119:105',
  },
  {
    text: 'Da boca de pequeninos e crianças de peito suscitaste força, por causa dos teus adversários.',
    reference: 'Salmos 8:2',
  },
  {
    text: 'E tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor e não para homens.',
    reference: 'Colossenses 3:23',
  },
  {
    text: 'Desde a infância sabes as sagradas letras, que podem tornar-te sábio para a salvação.',
    reference: '2 Timóteo 3:15',
  },
  {
    text: 'Apascenta os meus cordeiros.',
    reference: 'João 21:15',
  },
  {
    text: 'O Senhor é o meu pastor; nada me faltará.',
    reference: 'Salmos 23:1',
  },
  {
    text: 'Não to mandei eu? Sê forte e corajoso; não temas, porque o Senhor, teu Deus, é contigo por onde quer que andares.',
    reference: 'Josué 1:9',
  },
  {
    text: 'E, se algum de vós necessita de sabedoria, peça-a a Deus, que a todos dá liberalmente.',
    reference: 'Tiago 1:5',
  },
];

export const TEACHING_STEPS = [
  {
    emoji: '🙏',
    title: '1. Comece em oração',
    description:
      'Antes de abrir o material, fale com Deus. Peça sabedoria e um coração sensível para alcançar cada criança.',
    verse: {
      text: 'Orai sem cessar.',
      reference: '1 Tessalonicenses 5:17',
    },
    color: '#7b1fa2',
  },
  {
    emoji: '📖',
    title: '2. Medite na Palavra',
    description:
      'Leia a história bíblica da semana com calma. Entenda a mensagem central antes de pensar em como ensiná-la.',
    verse: {
      text: 'Procura apresentar-te a Deus aprovado, como obreiro que maneja bem a palavra da verdade.',
      reference: '2 Timóteo 2:15',
    },
    color: '#1565c0',
  },
  {
    emoji: '✂️',
    title: '3. Prepare a aula',
    description:
      'Baixe o material semanal, leia as orientações e organize os recursos necessários para a aula.',
    verse: {
      text: 'Tudo, porém, seja feito com decência e ordem.',
      reference: '1 Coríntios 14:40',
    },
    color: '#ef6c00',
  },
  {
    emoji: '❤️',
    title: '4. Ministre com amor',
    description:
      'No dia do Clubinho, acolha cada criança pelo nome. Ensine com alegria: mais importante que a atividade é o amor.',
    verse: {
      text: 'Ainda que eu fale a língua dos homens e dos anjos, se não tiver amor, nada serei.',
      reference: '1 Coríntios 13:1-2',
    },
    color: '#c62828',
  },
  {
    emoji: '🌱',
    title: '5. Compartilhe os frutos',
    description:
      'Depois do encontro, envie as fotos, registre as ideias que funcionaram e abençoe outros professores.',
    verse: {
      text: 'Eu plantei, Apolo regou; mas o crescimento veio de Deus.',
      reference: '1 Coríntios 3:6',
    },
    color: '#2e7d32',
  },
];

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
    verse: {
      text: 'Apascentai o rebanho de Deus que há entre vós.',
      reference: '1 Pedro 5:2',
    },
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
    verse: {
      text: 'O sábio de coração aceita os mandamentos.',
      reference: 'Provérbios 10:8',
    },
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
    verse: {
      text: 'Instruir-te-ei e ensinar-te-ei o caminho que deves seguir.',
      reference: 'Salmos 32:8',
    },
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
