import { expect, test } from '@playwright/test';

import { UserRole } from "@/types/shared";

import {
  buildUsersQuery,
  emptyUserForm,
  formatPhone,
  toCreateUserRequest,
  toUpdateUserRequest,
  userInitials,
  userToForm,
  validateUserForm,
} from "@/features/users/utils";
import type { UserFormValues, UserResponse } from "@/features/users/types";

const user: UserResponse = {
  id: "user-1",
  name: "Maria da Silva",
  email: "maria@example.com",
  phone: "92999990000",
  cpf: null,
  role: UserRole.TEACHER,
  active: true,
  completed: false,
  commonUser: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const validForm = (overrides: Partial<UserFormValues> = {}): UserFormValues => ({
  ...emptyUserForm(),
  name: "Maria da Silva",
  email: "maria@example.com",
  phone: "(92) 99999-0000",
  password: "segredo1",
  confirmPassword: "segredo1",
  ...overrides,
});

test.describe("buildUsersQuery", () => {
  test("não envia filtro vazio", () => {
    const params = buildUsersQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "   " },
    });

    expect(params.q).toBeUndefined();
    expect(params.role).toBeUndefined();
    expect(params.active).toBeUndefined();
    expect(params.completed).toBeUndefined();
  });

  test("envia os filtros preenchidos e a ordenação padrão", () => {
    const params = buildUsersQuery({
      page: 2,
      limit: 24,
      filters: {
        searchString: " maria ",
        role: UserRole.COORDINATOR,
        active: false,
        completed: true,
      },
    });

    expect(params).toEqual({
      page: 2,
      limit: 24,
      q: "maria",
      role: UserRole.COORDINATOR,
      active: false,
      completed: true,
      sort: "updatedAt",
      order: "DESC",
    });
  });
});

test.describe("validateUserForm", () => {
  test("aceita um cadastro completo", () => {
    expect(validateUserForm(validForm(), "create")).toEqual({});
  });

  test("cobra nome, e-mail e telefone", () => {
    const errors = validateUserForm(
      validForm({ name: "M", email: "sem-arroba", phone: "999" }),
      "create",
    );

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  test("cobra a senha ao criar", () => {
    const errors = validateUserForm(
      validForm({ password: "123", confirmPassword: "123" }),
      "create",
    );

    expect(errors.password).toBeDefined();
  });

  test("acusa senhas diferentes", () => {
    const errors = validateUserForm(
      validForm({ password: "segredo1", confirmPassword: "segredo2" }),
      "create",
    );

    expect(errors.confirmPassword).toBeDefined();
  });

  test("não cobra senha ao editar sem trocá-la", () => {
    const errors = validateUserForm(
      validForm({ editPassword: false, password: "", confirmPassword: "" }),
      "edit",
    );

    expect(errors.password).toBeUndefined();
    expect(errors.confirmPassword).toBeUndefined();
  });
});

test.describe("payloads", () => {
  test("manda só os dígitos do telefone ao criar", () => {
    const payload = toCreateUserRequest(validForm());

    expect(payload.phone).toBe("92999990000");
    expect(payload.name).toBe("Maria da Silva");
  });

  test("omite a senha na edição quando a troca não foi pedida", () => {
    const payload = toUpdateUserRequest(
      validForm({ editPassword: false, password: "", confirmPassword: "" }),
    );

    expect(payload).not.toHaveProperty("password");
  });

  test("inclui a senha na edição quando a troca foi pedida", () => {
    const payload = toUpdateUserRequest(validForm({ editPassword: true }));

    expect(payload.password).toBe("segredo1");
  });
});

test.describe("userToForm", () => {
  test("abre a edição sem senha e sem a troca marcada", () => {
    const form = userToForm(user);

    expect(form.id).toBe("user-1");
    expect(form.editPassword).toBe(false);
    expect(form.password).toBe("");
  });
});

test.describe("apresentação", () => {
  test("monta as iniciais do primeiro e do último nome", () => {
    expect(userInitials("Maria da Silva")).toBe("MS");
    expect(userInitials("Maria")).toBe("MA");
    expect(userInitials("")).toBe("?");
  });

  test("formata o telefone com DDD", () => {
    expect(formatPhone("92999990000")).toBe("(92) 99999-0000");
    expect(formatPhone("9233330000")).toBe("(92) 3333-0000");
    expect(formatPhone(null)).toBe("—");
  });
});
