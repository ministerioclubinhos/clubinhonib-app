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
