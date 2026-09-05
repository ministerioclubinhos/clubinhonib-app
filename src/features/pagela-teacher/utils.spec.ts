import { describe, expect, it } from "vitest";

import { clampWeek, getISOWeekYear, toLabelWeek, todayISO } from "./utils";

describe("clampWeek", () => {
  it("mantém a semana dentro dos limites ISO", () => {
    expect(clampWeek(1)).toBe(1);
    expect(clampWeek(53)).toBe(53);
  });

  it("puxa para dentro o que passa dos limites", () => {
    // Navegar para trás na semana 1 não pode virar semana 0.
    expect(clampWeek(0)).toBe(1);
    expect(clampWeek(-4)).toBe(1);
    expect(clampWeek(54)).toBe(53);
  });
});

describe("toLabelWeek", () => {
  it("preenche a semana com zero à esquerda", () => {
    expect(toLabelWeek(2026, 7)).toBe("Ano: 2026 Semana: 07");
    expect(toLabelWeek(2026, 48)).toBe("Ano: 2026 Semana: 48");
  });
});

describe("getISOWeekYear", () => {
  it("a quinta-feira decide o ano da semana", () => {
    // 01/01/2026 é quinta: a semana pertence a 2026.
    expect(getISOWeekYear(new Date(2026, 0, 1))).toEqual({
      year: 2026,
      week: 1,
    });
  });

  it("o domingo fecha a semana que começou na segunda", () => {
    expect(getISOWeekYear(new Date(2026, 0, 4))).toEqual({
      year: 2026,
      week: 1,
    });
    expect(getISOWeekYear(new Date(2026, 0, 5))).toEqual({
      year: 2026,
      week: 2,
    });
  });

  it("dezembro pode cair na semana 1 do ano seguinte", () => {
    // 31/12/2025 é quarta; a quinta dessa semana é 01/01/2026.
    expect(getISOWeekYear(new Date(2025, 11, 31))).toEqual({
      year: 2026,
      week: 1,
    });
  });
});

describe("todayISO", () => {
  it("usa os componentes locais, sem deslocar por fuso", () => {
    const hoje = new Date();
    const esperado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    expect(todayISO()).toBe(esperado);
  });
});
