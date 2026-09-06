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
    });
  });

  test("o coordenador mexe no vínculo de professor, não no de coordenador", () => {
    expect(clubLinkPermissionsOf(UserRole.COORDINATOR)).toEqual({
      canManageTeacherLinks: true,
      canManageCoordinatorLinks: false,
    });
  });

  test("o professor não mexe em nenhum", () => {
    expect(clubLinkPermissionsOf(UserRole.TEACHER)).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
    });
  });

  test("papel ausente ou desconhecido não mexe em nada", () => {
    expect(clubLinkPermissionsOf(null)).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
    });
    expect(clubLinkPermissionsOf("outro")).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
    });
  });
});
