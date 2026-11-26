import {
  EventNote,
  Lightbulb,
  MenuBook,
  PhotoLibrary,
  VideoLibrary,
} from '@mui/icons-material';

import { IdeasPageForm } from '@/features/ideas-pages';
import { ImagePageForm } from '@/features/image-pages';
import { MeditationPageForm } from '@/features/meditations';
import { VideoPageForm } from '@/features/video-pages';
import { WeekMaterialPageForm } from '@/features/week-materials';

import { PageTemplateDefinition, PageTemplateId } from './types';

/** Tamanho do ícone exibido no card, em px. */
export const TEMPLATE_ICON_SIZE = 32;

/**
 * Modelos disponíveis, na ordem em que aparecem na grade. Os ícones repetem os
 * já usados no painel administrativo para cada tipo de conteúdo.
 */
export const PAGE_TEMPLATES: readonly PageTemplateDefinition[] = [
  {
    id: PageTemplateId.WEEK_MATERIALS,
    title: 'Materiais da Semana',
    description:
      'Página da visita semanal, com vídeos, documentos, imagens e áudios.',
    icon: <EventNote sx={{ fontSize: TEMPLATE_ICON_SIZE }} color="primary" />,
    render: () => <WeekMaterialPageForm fromTemplatePage={true} />,
  },
  {
    id: PageTemplateId.MEDITATION,
    title: 'Meditação da Semana',
    description: 'Meditação semanal com os temas e versículos de cada dia.',
    icon: <MenuBook sx={{ fontSize: TEMPLATE_ICON_SIZE }} color="primary" />,
    render: () => <MeditationPageForm fromTemplatePage={true} />,
  },
  {
    id: PageTemplateId.GALLERY,
    title: 'Galeria de Fotos',
    description: 'Galeria de imagens do site, organizada em seções.',
    icon: <PhotoLibrary sx={{ fontSize: TEMPLATE_ICON_SIZE }} color="primary" />,
    render: () => <ImagePageForm fromTemplatePage={true} />,
  },
  {
    id: PageTemplateId.VIDEOS,
    title: 'Galeria de Vídeos',
    description: 'Página de vídeos enviados ou de links do YouTube.',
    icon: <VideoLibrary sx={{ fontSize: TEMPLATE_ICON_SIZE }} color="primary" />,
    render: () => <VideoPageForm fromTemplatePage={true} />,
  },
  {
    id: PageTemplateId.IDEAS,
    title: 'Página de Ideias',
    description: 'Ideias de atividades para os professores dos clubinhos.',
    icon: <Lightbulb sx={{ fontSize: TEMPLATE_ICON_SIZE }} color="primary" />,
    render: () => <IdeasPageForm fromTemplatePage={true} />,
  },
];
