import { expect, test } from '@playwright/test';

import { UserRole } from "@/types/shared";

import { clubLinkPermissionsOf } from "@/utils/clubLinkPermissions";

/**
 * Trava o espelho da política da API. Se o back mudar quem pode o quê, um
 * destes casos falha antes de a tela oferecer um botão que responde 403.
 */
test.describe("clubLinkPermissionsOf", () => {
  test("o administrador mexe nos dois vínculos", () => {
    expect(clubLinkPermissionsOf(UserRole.ADMIN)).toEqual({
      canManageTeacherLinks: true,
      canManageCoordinatorLinks: true,
      canDeleteClub: true,
    });
  });

  test("o coordenador mexe no vínculo de professor, não no de coordenador", () => {
    expect(clubLinkPermissionsOf(UserRole.COORDINATOR)).toEqual({
      canManageTeacherLinks: true,
      canManageCoordinatorLinks: false,
      canDeleteClub: false,
    });
  });

  test("o coordenador não exclui clubinho: é a única ação sem volta", () => {
    // Ele muda dia, horário, endereço e equipe, e pode **desativar** — que tira
    // o clubinho do calendário e preserva o histórico. Excluir apaga a linha e
    // desvincula as crianças, e ficou só com o administrador.
    expect(clubLinkPermissionsOf(UserRole.COORDINATOR).canDeleteClub).toBe(
      false,
    );
  });

  test("o professor não mexe em nenhum", () => {
    expect(clubLinkPermissionsOf(UserRole.TEACHER)).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
      canDeleteClub: false,
    });
  });

  test("papel ausente ou desconhecido não mexe em nada", () => {
    expect(clubLinkPermissionsOf(null)).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
      canDeleteClub: false,
    });
    expect(clubLinkPermissionsOf("outro")).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
      canDeleteClub: false,
    });
  });
});
