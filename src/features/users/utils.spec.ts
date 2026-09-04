import { describe, expect, it } from "vitest";

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
} from "./utils";
import type { UserFormValues, UserResponse } from "./types";

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

describe("buildUsersQuery", () => {
  it("não envia filtro vazio", () => {
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

  it("envia os filtros preenchidos e a ordenação padrão", () => {
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

describe("validateUserForm", () => {
  it("aceita um cadastro completo", () => {
    expect(validateUserForm(validForm(), "create")).toEqual({});
  });

  it("cobra nome, e-mail e telefone", () => {
    const errors = validateUserForm(
      validForm({ name: "M", email: "sem-arroba", phone: "999" }),
      "create",
    );

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  it("cobra a senha ao criar", () => {
    const errors = validateUserForm(
      validForm({ password: "123", confirmPassword: "123" }),
      "create",
    );

    expect(errors.password).toBeDefined();
  });

  it("acusa senhas diferentes", () => {
    const errors = validateUserForm(
      validForm({ password: "segredo1", confirmPassword: "segredo2" }),
      "create",
    );

    expect(errors.confirmPassword).toBeDefined();
  });

  it("não cobra senha ao editar sem trocá-la", () => {
    const errors = validateUserForm(
      validForm({ editPassword: false, password: "", confirmPassword: "" }),
      "edit",
    );

    expect(errors.password).toBeUndefined();
    expect(errors.confirmPassword).toBeUndefined();
  });
});

describe("payloads", () => {
  it("manda só os dígitos do telefone ao criar", () => {
    const payload = toCreateUserRequest(validForm());

    expect(payload.phone).toBe("92999990000");
    expect(payload.name).toBe("Maria da Silva");
  });

  it("omite a senha na edição quando a troca não foi pedida", () => {
    const payload = toUpdateUserRequest(
      validForm({ editPassword: false, password: "", confirmPassword: "" }),
    );

    expect(payload).not.toHaveProperty("password");
  });

  it("inclui a senha na edição quando a troca foi pedida", () => {
    const payload = toUpdateUserRequest(validForm({ editPassword: true }));

    expect(payload.password).toBe("segredo1");
  });
});

describe("userToForm", () => {
  it("abre a edição sem senha e sem a troca marcada", () => {
    const form = userToForm(user);

    expect(form.id).toBe("user-1");
    expect(form.editPassword).toBe(false);
    expect(form.password).toBe("");
  });
});

describe("apresentação", () => {
  it("monta as iniciais do primeiro e do último nome", () => {
    expect(userInitials("Maria da Silva")).toBe("MS");
    expect(userInitials("Maria")).toBe("MA");
    expect(userInitials("")).toBe("?");
  });

  it("formata o telefone com DDD", () => {
    expect(formatPhone("92999990000")).toBe("(92) 99999-0000");
    expect(formatPhone("9233330000")).toBe("(92) 3333-0000");
    expect(formatPhone(null)).toBe("—");
  });
});
