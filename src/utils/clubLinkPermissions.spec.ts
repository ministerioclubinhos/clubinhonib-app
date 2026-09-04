import { describe, expect, it } from "vitest";

import { UserRole } from "@/types/shared";

import { clubLinkPermissionsOf } from "./clubLinkPermissions";

/**
 * Trava o espelho da política da API. Se o back mudar quem pode o quê, um
 * destes casos falha antes de a tela oferecer um botão que responde 403.
 */
describe("clubLinkPermissionsOf", () => {
  it("o administrador mexe nos dois vínculos", () => {
    expect(clubLinkPermissionsOf(UserRole.ADMIN)).toEqual({
      canManageTeacherLinks: true,
      canManageCoordinatorLinks: true,
    });
  });

  it("o coordenador mexe no vínculo de professor, não no de coordenador", () => {
    expect(clubLinkPermissionsOf(UserRole.COORDINATOR)).toEqual({
      canManageTeacherLinks: true,
      canManageCoordinatorLinks: false,
    });
  });

  it("o professor não mexe em nenhum", () => {
    expect(clubLinkPermissionsOf(UserRole.TEACHER)).toEqual({
      canManageTeacherLinks: false,
      canManageCoordinatorLinks: false,
    });
  });

  it("papel ausente ou desconhecido não mexe em nada", () => {
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
