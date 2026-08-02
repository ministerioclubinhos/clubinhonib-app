import { UserRole } from '@/types/shared';

export const getAuthenticatedHome = (role?: UserRole): string =>
  role === UserRole.ADMIN || role === UserRole.COORDINATOR ? '/adm' : '/area-do-professor';
