import { PendingItemId } from '../types';

export const LINK_CLUB_MESSAGE = 'De qual clubinho você faz parte?';

/** Destino quando a pendência do perfil não define um. */
export const PENDING_FALLBACK_ROUTES: Partial<Record<PendingItemId, string>> = {
  [PendingItemId.EMAIL_VERIFICATION]: '/verificar-email',
};
