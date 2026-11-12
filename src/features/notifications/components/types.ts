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
