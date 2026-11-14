import { expect, test } from '@playwright/test';

import { clampWeek, getISOWeekYear, launchableWeeks, toLabelWeek, todayISO } from "@/features/pagela-teacher/utils";

test.describe("clampWeek", () => {
  test("mantém a semana dentro dos limites ISO", () => {
    expect(clampWeek(1)).toBe(1);
    expect(clampWeek(53)).toBe(53);
  });

  test("puxa para dentro o que passa dos limites", () => {
    // Navegar para trás na semana 1 não pode virar semana 0.
    expect(clampWeek(0)).toBe(1);
    expect(clampWeek(-4)).toBe(1);
    expect(clampWeek(54)).toBe(53);
  });
});

test.describe("toLabelWeek", () => {
  test("preenche a semana com zero à esquerda", () => {
    expect(toLabelWeek(2026, 7)).toBe("Ano: 2026 Semana: 07");
    expect(toLabelWeek(2026, 48)).toBe("Ano: 2026 Semana: 48");
  });
});

test.describe("getISOWeekYear", () => {
  test("a quinta-feira decide o ano da semana", () => {
    // 01/01/2026 é quinta: a semana pertence a 2026.
    expect(getISOWeekYear(new Date(2026, 0, 1))).toEqual({
      year: 2026,
      week: 1,
    });
  });

  test("o domingo fecha a semana que começou na segunda", () => {
    expect(getISOWeekYear(new Date(2026, 0, 4))).toEqual({
      year: 2026,
      week: 1,
    });
    expect(getISOWeekYear(new Date(2026, 0, 5))).toEqual({
      year: 2026,
      week: 2,
    });
  });

  test("dezembro pode cair na semana 1 do ano seguinte", () => {
    // 31/12/2025 é quarta; a quinta dessa semana é 01/01/2026.
    expect(getISOWeekYear(new Date(2025, 11, 31))).toEqual({
      year: 2026,
      week: 1,
    });
  });
});

test.describe("todayISO", () => {
  test("usa os componentes locais, sem deslocar por fuso", () => {
    const hoje = new Date();
    const esperado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    expect(todayISO()).toBe(esperado);
  });
});

test.describe("launchableWeeks", () => {
  test("lista da semana atual até a primeira", () => {
    expect(launchableWeeks({ open: true, currentWeek: 3 })).toEqual([3, 2, 1]);
  });

  test("fora do período letivo não há semana que aceite lançamento", () => {
    expect(launchableWeeks({ open: false, currentWeek: null })).toEqual([]);
    expect(launchableWeeks(null)).toEqual([]);
  });
});
