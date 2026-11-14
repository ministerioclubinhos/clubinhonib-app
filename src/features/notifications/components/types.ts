import type { ReactNode } from 'react';
import type {
  NotificationCenterFilter,
  NotificationDetailDto,
  NotificationItemDto,
  NotificationPanelVariant,
  PendingItem,
} from '../types';

export interface NotificationPanelProps {
  variant: NotificationPanelVariant;
  onClose?: () => void;
  /** Detalhe controlado pela URL (página); sem isso, estado local. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export interface NotificationListProps {
  filter: NotificationCenterFilter;
  pendingItems: PendingItem[];
  items: NotificationItemDto[];
  showNotices: boolean;
  loading: boolean;
  error: boolean;
  fetching: boolean;
  offline: boolean;
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  onOpen: (id: string) => void;
  onResolvePending: (item: PendingItem) => void;
}

export interface NotificationItemProps {
  item: NotificationItemDto;
  now: number;
  onOpen: (id: string) => void;
}

export interface NotificationDetailProps {
  notification: NotificationDetailDto | undefined;
  loading: boolean;
  unavailable: boolean;
  error: boolean;
  readPending: boolean;
  readError: string | null;
  onBack: () => void;
  onRetry: () => void;
  onRead: (id: string) => void;
}

export interface NotificationBellProps {
  'data-testid'?: string;
  /** Cor do ícone na barra. */
  color?: string;
}

export interface NotificationSettingRowProps {
  /** Ícone decorativo à esquerda. */
  icon: ReactNode;
  /** Id do título, ligado à chave pelo `aria-labelledby`. */
  titleId: string;
  title: string;
  description: string;
  /** A chave (ou outro controle) à direita. */
  control: ReactNode;
  /** Avisos e ações extras abaixo da linha. */
  children?: ReactNode;
  'data-testid'?: string;
}

export interface NotificationSettingsSectionProps {
  title: string;
  help?: string;
  children: ReactNode;
  'data-testid'?: string;
}
