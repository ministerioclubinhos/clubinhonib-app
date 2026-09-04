import { describe, expect, it } from "vitest";

import {
  buildCoordinatorsQuery,
  clubLabel,
  coordinatorInitials,
  coordinatorName,
  coordinatorTeachers,
} from "./utils";
import type { CoordinatorResponse } from "./types";

const user = (id: string, name: string) => ({
  id,
  name,
  email: `${id}@example.com`,
  phone: "92999990000",
  active: true,
  completed: true,
  commonUser: false,
});

const coordinator: CoordinatorResponse = {
  id: "coord-1",
  active: true,
  user: user("user-1", "Marta Reis"),
  clubs: [
    {
      id: "club-1",
      number: 12,
      weekday: "saturday",
      teachers: [
        { id: "teacher-1", active: true, user: user("user-2", "João Lima") },
      ],
    },
    {
      id: "club-2",
      number: 13,
      weekday: "friday",
      // O mesmo professor aparece nos dois clubinhos.
      teachers: [
        { id: "teacher-1", active: true, user: user("user-2", "João Lima") },
        { id: "teacher-2", active: true, user: user("user-3", "Ana Paz") },
      ],
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("buildCoordinatorsQuery", () => {
  it("não envia filtro vazio", () => {
    const params = buildCoordinatorsQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "   " },
    });

    expect(params.searchString).toBeUndefined();
    expect(params.hasClubs).toBeUndefined();
  });

  it("usa a ordenação padrão aceita pela API", () => {
    const params = buildCoordinatorsQuery({ page: 1, limit: 12 });

    expect(params.sort).toBe("updatedAt");
    expect(params.order).toBe("desc");
  });
});

describe("coordinatorTeachers", () => {
  it("não repete o professor que atende mais de um clubinho", () => {
    const teachers = coordinatorTeachers(coordinator);

    expect(teachers).toHaveLength(2);
    expect(teachers.map((teacher) => teacher.id).sort()).toEqual([
      "teacher-1",
      "teacher-2",
    ]);
  });

  it("devolve lista vazia quando não há clubinho", () => {
    expect(coordinatorTeachers({ ...coordinator, clubs: [] })).toEqual([]);
  });
});

describe("apresentação", () => {
  it("usa o e-mail quando não há nome", () => {
    expect(coordinatorName(coordinator)).toBe("Marta Reis");
    expect(
      coordinatorName({
        ...coordinator,
        user: { ...coordinator.user, name: "" },
      }),
    ).toBe("user-1@example.com");
  });

  it("monta as iniciais e rotula o clubinho", () => {
    expect(coordinatorInitials("Marta Reis")).toBe("MR");
    expect(clubLabel(coordinator.clubs[0])).toBe("Clubinho 12 · Sábado");
  });
});
