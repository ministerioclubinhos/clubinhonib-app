import { UserRole } from "@/types/shared";

/**
 * Quem pode mexer nos vínculos com clubinho.
 *
 * Espelha, campo a campo, o que `teacher-profiles/utils.ts` e
 * `coordinator-profiles/utils.ts` decidem na API. Esconder um botão não é
 * autorização — o servidor barra de novo —, mas oferecer uma ação que sempre
 * responde 403 é um convite para o erro.
 *
 * O recorte por clubinho não entra aqui: a listagem já devolve ao coordenador
 * apenas os clubinhos que ele coordena, e a API confere de novo a cada escrita.
 */
export type ClubLinkPermissions = {
  /** Vincular, trocar e desvincular o clubinho de um professor. */
  canManageTeacherLinks: boolean;
  /** Vincular, desvincular e transferir clubinhos de um coordenador. */
  canManageCoordinatorLinks: boolean;
  /**
   * Excluir o clubinho.
   *
   * A única operação de clubinho fechada para a coordenação, por ser a única
   * irreversível: a linha some e as crianças são desvinculadas. Desativar
   * continua disponível — tira o clubinho do calendário e tem volta.
   */
  canDeleteClub: boolean;
};

/** Motivo exibido quando a ação existe mas o perfil não a alcança. */
export const COORDINATOR_LINKS_ADMIN_ONLY =
  "Somente um administrador altera os clubinhos de um coordenador.";

export function clubLinkPermissionsOf(
  role?: UserRole | string | null,
): ClubLinkPermissions {
  const normalized = String(role ?? "").toLowerCase();

  return {
    canManageTeacherLinks:
      normalized === UserRole.ADMIN || normalized === UserRole.COORDINATOR,
    canManageCoordinatorLinks: normalized === UserRole.ADMIN,
    canDeleteClub: normalized === UserRole.ADMIN,
  };
}
