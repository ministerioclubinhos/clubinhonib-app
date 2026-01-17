import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Feature } from './types';

export const FEATURES: Feature[] = [
  {
    id: 'evangelistic-ministry',
    icon: SchoolIcon,
    title: 'Ministério Evangelístico',
    description: 'Mais de 20 anos levando o amor de Cristo às crianças através de ensino bíblico criativo e envolvente em escolas, clubinhos e residências.',
    color: '#81d742',
  },
  {
    id: 'biblical-teaching',
    icon: GroupIcon,
    title: 'Ensino Bíblico Criativo',
    description: 'Formamos servos comprometidos que ensinam a Palavra de Deus de forma alegre, dinâmica e memorável para as crianças.',
    color: '#e74c3c',
  },
  {
    id: 'community-partnership',
    icon: LightbulbIcon,
    title: 'Parceria com Famílias',
    description: 'Criamos ambientes acolhedores com princípios bíblicos, desenvolvendo cidadãos conscientes de valores morais e éticos.',
    color: '#67bf1b',
  },
];
