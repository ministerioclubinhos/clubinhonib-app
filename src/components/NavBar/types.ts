import type { ProfileAlert } from '@/features/profile/hooks';

export interface CompleteProfileAlertProps {
  alerts: ProfileAlert[];
  userId: string;
  photoNotificationsEnabled: boolean;
  onAlertClick?: () => void;
}

export interface NavLinksProps {
  closeMenu?: () => void;
  isMobile?: boolean;
}

/** Componentes que só repassam a renderização aceitam o seletor de teste. */
export interface TestIdProps {
  'data-testid'?: string;
}
