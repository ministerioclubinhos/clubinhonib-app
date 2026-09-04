import { describe, expect, it } from "vitest";

import {
  buildTeachersQuery,
  clubLabel,
  teacherCoordinatorName,
  teacherInitials,
  teacherName,
} from "./utils";
import type { TeacherResponse } from "./types";

const user = {
  id: "user-1",
  name: "João Lima",
  email: "joao@example.com",
  phone: "92999990000",
  active: true,
  completed: true,
  commonUser: false,
};

const teacher: TeacherResponse = {
  id: "teacher-1",
  active: true,
  user,
  club: {
    id: "club-1",
    number: 12,
    weekday: "saturday",
    coordinator: {
      id: "coord-1",
      active: true,
      user: { ...user, id: "user-2", name: "Marta Reis" },
    },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("buildTeachersQuery", () => {
  it("não envia filtro vazio", () => {
    const params = buildTeachersQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "   " },
    });

    expect(params.searchString).toBeUndefined();
    expect(params.active).toBeUndefined();
    expect(params.hasClub).toBeUndefined();
  });

  it("usa a ordenação padrão aceita pela API", () => {
    const params = buildTeachersQuery({ page: 1, limit: 12 });

    expect(params.sort).toBe("updatedAt");
    expect(params.order).toBe("desc");
  });

  it("envia os filtros preenchidos", () => {
    const params = buildTeachersQuery({
      page: 2,
      limit: 24,
      filters: { searchString: " joão ", active: true, hasClub: false },
    });

    expect(params).toMatchObject({
      page: 2,
      limit: 24,
      searchString: "joão",
      active: true,
      hasClub: false,
    });
  });
});

describe("apresentação", () => {
  it("usa o e-mail quando não há nome", () => {
    expect(teacherName(teacher)).toBe("João Lima");
    expect(
      teacherName({ ...teacher, user: { ...user, name: "" } }),
    ).toBe("joao@example.com");
  });

  it("monta as iniciais", () => {
    expect(teacherInitials("João Lima")).toBe("JL");
  });

  it("rotula o clubinho com o dia da semana", () => {
    expect(clubLabel(teacher.club)).toBe("Clubinho 12 · Sábado");
    expect(clubLabel(null)).toBe("Sem clubinho");
  });

  it("mostra o coordenador do clubinho", () => {
    expect(teacherCoordinatorName(teacher.club)).toBe("Marta Reis");
    expect(teacherCoordinatorName(null)).toBe("—");
  });

});
