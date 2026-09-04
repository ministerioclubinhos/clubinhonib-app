import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/types/shared";

import {
  buildChangePasswordRequest,
  buildCompleteProfileRequest,
  buildUpdateAccountRequest,
  formatDateOnly,
  profileClubs,
  requiresCurrentPassword,
  splitBirthdaysByProximity,
  validateAccountForm,
  validatePasswordForm,
} from "./utils";
import type { MyProfile, ProfileBirthday } from "./types";

/**
 * Trava o formato do que sai daqui para a API.
 *
 * `UpdateOwnProfileDto`, `ChangePasswordDto` e `UpdateCompleteProfileDto`
 * recusam propriedade desconhecida, então um campo a mais derruba a requisição
 * com 400.
 */
describe("profile utils", () => {
  const profile: MyProfile = {
    id: "user-1",
    email: "fulano@example.com",
    name: "Fulano de Tal",
    phone: "92999990000",
    cpf: "12345678901",
    role: UserRole.TEACHER,
    active: true,
    completed: true,
    commonUser: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    image: null,
    teacherProfile: {
      id: "teacher-1",
      active: true,
      club: {
        id: "club-1",
        number: 12,
        weekday: "saturday",
        time: "14:30",
        isActive: true,
      },
    },
    coordinatorProfile: null,
  };

  it("a edição da conta envia só o que mudou", () => {
    const request = buildUpdateAccountRequest(
      {
        name: "Fulano de Tal",
        email: "novo@example.com",
        phone: "92999990000",
        cpf: "12345678901",
      },
      profile,
    );

    // Reenviar o e-mail atual dispararia a checagem de duplicidade à toa.
    expect(Object.keys(request)).toEqual(["email"]);
    expect(request.email).toBe("novo@example.com");
  });

  it("a edição da conta ignora campo em branco", () => {
    expect(
      buildUpdateAccountRequest({ name: "   ", phone: "" }, profile),
    ).toEqual({});
  });

  it("a senha atual só vai quando é exigida", () => {
    const values = { currentPassword: "antiga", newPassword: "novasenha" };

    expect(Object.keys(buildChangePasswordRequest(values, true)).sort()).toEqual(
      ["currentPassword", "newPassword"].sort(),
    );
    // No login social não há senha atual, e mandá-la vazia reprovaria.
    expect(Object.keys(buildChangePasswordRequest(values, false))).toEqual([
      "newPassword",
    ]);
  });

  it("sabe quem precisa informar a senha atual", () => {
    expect(requiresCurrentPassword(profile)).toBe(true);
    expect(requiresCurrentPassword({ ...profile, commonUser: false })).toBe(false);
    expect(requiresCurrentPassword(null)).toBe(false);
  });

  it("o perfil completo leva só os blocos preenchidos", () => {
    expect(
      Object.keys(buildCompleteProfileRequest({ preferences: { temperaments: "x" } })),
    ).toEqual(["preferences"]);
    expect(buildCompleteProfileRequest({})).toEqual({});
  });

  it("cobra nome e e-mail válidos", () => {
    expect(validateAccountForm({ name: "Fulano", email: "a@b.co" })).toEqual({});
    expect(validateAccountForm({ name: "F" }).name).toBeDefined();
    expect(validateAccountForm({ email: "invalido" }).email).toBeDefined();
  });

  it("cobra senha com o mínimo e confirmação igual", () => {
    expect(
      validatePasswordForm(
        { currentPassword: "antiga", newPassword: "novasenha", confirmPassword: "novasenha" },
        true,
      ),
    ).toEqual({});
    expect(
      validatePasswordForm({ newPassword: "novasenha" }, true).currentPassword,
    ).toBeDefined();
    expect(validatePasswordForm({ newPassword: "123" }, false).newPassword).toBeDefined();
    expect(
      validatePasswordForm(
        { newPassword: "novasenha", confirmPassword: "outra" },
        false,
      ).confirmPassword,
    ).toBeDefined();
  });

  it("reúne os clubinhos dos dois vínculos", () => {
    expect(profileClubs(profile).map((club) => club.id)).toEqual(["club-1"]);
    expect(profileClubs(null)).toEqual([]);
  });

  it("mostra a data de nascimento no dia certo", () => {
    // `new Date('1990-05-20')` seria lido como UTC e, em Manaus, viraria 19/05.
    expect(formatDateOnly("1990-05-20")).toBe("20/05/1990");
    expect(formatDateOnly(null)).toBe("—");
  });
});

describe('splitBirthdaysByProximity', () => {
    const birthday = (id: string, birthDate: string): ProfileBirthday => ({
        id,
        name: `Pessoa ${id}`,
        role: 'teacher',
        birthDate,
        image: null,
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-10T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('separa hoje, a semana e o resto do mês', () => {
        const { today, week, month } = splitBirthdaysByProximity([
            birthday('a', '1990-05-10'),
            birthday('b', '1990-05-12'),
            birthday('c', '1990-05-28'),
        ]);

        expect(today.map((p) => p.id)).toEqual(['a']);
        expect(week.map((p) => p.id)).toEqual(['b']);
        expect(month.map((p) => p.id)).toEqual(['c']);
    });

    it('ordena por proximidade dentro de cada faixa', () => {
        const { month } = splitBirthdaysByProximity([
            birthday('longe', '1990-05-30'),
            birthday('perto', '1990-05-20'),
        ]);

        expect(month.map((p) => p.id)).toEqual(['perto', 'longe']);
    });

    it('devolve faixas vazias quando não há aniversariante', () => {
        const { today, week, month } = splitBirthdaysByProximity([]);

        expect(today).toEqual([]);
        expect(week).toEqual([]);
        expect(month).toEqual([]);
    });
});
