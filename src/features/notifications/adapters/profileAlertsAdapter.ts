import { useMemo } from 'react';
import type { ProfileAlert } from '@/features/profile/hooks';
import { UserRole } from '@/types/shared';
import { PendingItemId, type PendingItem } from '../types';
import { LINK_CLUB_MESSAGE, PENDING_FALLBACK_ROUTES } from './constants';

const KNOWN_IDS = new Set<string>(Object.values(PendingItemId));

function isPendingItemId(id: string): id is PendingItemId {
  return KNOWN_IDS.has(id);
}

export interface PendingItemsInput {
  alerts: ProfileAlert[];
  role: UserRole | null;
  hasClub: boolean;
  clubLinkEnabled: boolean;
  onLinkClub: () => void;
}

/**
 * Converte as pendências do perfil (e o convite de vínculo) em itens da
 * central. As condições continuam no domínio de perfil; aqui só se escolhe
 * a ação. A verificação de e-mail, que antes não tinha ação, leva à tela
 * existente de instruções.
 */
export function toPendingItems(input: PendingItemsInput): PendingItem[] {
  const items: PendingItem[] = [];
  if (input.clubLinkEnabled && input.role === UserRole.TEACHER && !input.hasClub) {
    items.push({
      id: PendingItemId.LINK_CLUB,
      message: LINK_CLUB_MESSAGE,
      action: input.onLinkClub,
    });
  }
  for (const alert of input.alerts) {
    if (!isPendingItemId(alert.id)) continue;
    items.push({
      id: alert.id,
      message: alert.message,
      to: alert.to ?? PENDING_FALLBACK_ROUTES[alert.id],
      action: alert.action,
    });
  }
  return items;
}

export function usePendingItems(input: PendingItemsInput): PendingItem[] {
  const { alerts, role, hasClub, clubLinkEnabled, onLinkClub } = input;
  return useMemo(
    () => toPendingItems({ alerts, role, hasClub, clubLinkEnabled, onLinkClub }),
    [alerts, role, hasClub, clubLinkEnabled, onLinkClub]
  );
}
