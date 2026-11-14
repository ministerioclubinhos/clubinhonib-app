import { UserRole } from '@/types/shared';
import { isSafeNotificationPath } from '@/features/notifications/utils';

export const getAuthenticatedHome = (role?: UserRole): string =>
  role === UserRole.ADMIN || role === UserRole.COORDINATOR ? '/adm' : '/area-do-professor';

/** O `state.from` que o `ProtectedRoute` guarda ao mandar para o login. */
interface ReturnLocation {
  pathname: string;
  search?: string;
}

function isReturnLocation(value: unknown): value is ReturnLocation {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { pathname?: unknown }).pathname === 'string' &&
    ['string', 'undefined'].includes(typeof (value as { search?: unknown }).search)
  );
}

/**
 * Destino depois do login. Só volta para caminhos internos permitidos (hoje,
 * a central de notificações e um aviso dela); qualquer outro estado cai no
 * destino padrão do papel. Impede redirecionamento aberto. A rota de destino
 * continua passando pelos guards e pela autorização da API.
 */
export const resolvePostLoginDestination = (role: UserRole | undefined, from: unknown): string => {
  if (isReturnLocation(from)) {
    const path = `${from.pathname}${from.search ?? ''}`;
    if (isSafeNotificationPath(path)) return path;
  }
  return getAuthenticatedHome(role);
};
