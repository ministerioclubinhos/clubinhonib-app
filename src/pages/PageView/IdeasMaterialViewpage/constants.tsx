import type { ReactNode } from 'react';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import { MediaType } from '@/store/slices/types';

/** Cor do tema usada por cada tipo de mídia, sempre a mesma na página inteira. */
export type IdeasMediaColor = 'error' | 'success' | 'warning' | 'info';

/** Como cada tipo de mídia se apresenta na página pública de ideias. */
export interface IdeasMediaKind {
  mediaType: MediaType;
  /** Plural, usado no botão da seção e no título da galeria. */
  label: string;
  /** Singular, usado quando a seção tem um item só. */
  singular: string;
  icon: ReactNode;
  color: IdeasMediaColor;
}

/**
 * Os tipos de mídia na ordem em que aparecem.
 *
 * O rótulo, o ícone e a cor vivem aqui porque antes estavam repetidos em três
 * lugares — a seção, o cartão do tipo e o cabeçalho da galeria — com emoji,
 * ícone e contagem duplicados na mesma linha.
 */
export const IDEAS_MEDIA_KINDS: readonly IdeasMediaKind[] = [
  {
    mediaType: MediaType.VIDEO,
    label: 'Vídeos',
    singular: 'Vídeo',
    icon: <VideocamOutlinedIcon />,
    color: 'error',
  },
  {
    mediaType: MediaType.DOCUMENT,
    label: 'Documentos',
    singular: 'Documento',
    icon: <PictureAsPdfOutlinedIcon />,
    color: 'success',
  },
  {
    mediaType: MediaType.IMAGE,
    label: 'Imagens',
    singular: 'Imagem',
    icon: <ImageOutlinedIcon />,
    color: 'warning',
  },
  {
    mediaType: MediaType.AUDIO,
    label: 'Áudios',
    singular: 'Áudio',
    icon: <AudiotrackOutlinedIcon />,
    color: 'info',
  },
];

/** Alvo mínimo de toque das telas do site. */
export const TOUCH_TARGET = 44;

/**
 * Largura do conteúdo das páginas do site: 98% no celular, 95% no desktop.
 *
 * É o padrão das demais páginas públicas (materiais da semana, vídeos,
 * eventos); sai daqui para o cabeçalho e o corpo não divergirem.
 */
export const PAGE_WIDTH = { xs: '98%', md: '95%' } as const;
