import { describe, expect, it } from "vitest";

import { PeriodShortcut } from "../types";
import { getPeriodDates } from "./periodHelpers";

describe("getPeriodDates", () => {
  it("sem período e sem datas, não recorta nada", () => {
    expect(getPeriodDates(undefined)).toBeUndefined();
  });

  it("período personalizado usa as datas informadas", () => {
    expect(
      getPeriodDates(PeriodShortcut.CUSTOM, "2026-01-01", "2026-01-31"),
    ).toEqual({ startDate: "2026-01-01", endDate: "2026-01-31" });
  });

  it("personalizado sem as duas datas não recorta", () => {
    // Mandar só uma ponta traria um recorte aberto, que não é o que a tela
    // pediu.
    expect(getPeriodDates(PeriodShortcut.CUSTOM, "2026-01-01")).toBeUndefined();
  });

  it("hoje começa e termina no mesmo dia", () => {
    const recorte = getPeriodDates(PeriodShortcut.TODAY);

    expect(recorte?.startDate).toBe(recorte?.endDate);
    expect(recorte?.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("a semana vai de segunda a domingo", () => {
    const recorte = getPeriodDates(PeriodShortcut.THIS_WEEK);
    const inicio = new Date(`${recorte?.startDate}T12:00:00`);
    const fim = new Date(`${recorte?.endDate}T12:00:00`);

    expect(inicio.getDay()).toBe(1);
    expect(fim.getDay()).toBe(0);
  });

  it("o mês vai do primeiro ao último dia", () => {
    const recorte = getPeriodDates(PeriodShortcut.THIS_MONTH);
    const inicio = new Date(`${recorte?.startDate}T12:00:00`);
    const fim = new Date(`${recorte?.endDate}T12:00:00`);

    expect(inicio.getDate()).toBe(1);
    // O dia seguinte ao fim já é outro mês.
    const seguinte = new Date(fim);
    seguinte.setDate(fim.getDate() + 1);
    expect(seguinte.getMonth()).not.toBe(fim.getMonth());
  });

  it("as datas saem no formato que a API aceita, sem deslocar por fuso", () => {
    // `toISOString()` converteria para UTC antes de recortar e, em fuso
    // positivo, devolveria o dia anterior.
    const recorte = getPeriodDates(PeriodShortcut.TODAY);
    const hoje = new Date();
    const esperado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    expect(recorte?.startDate).toBe(esperado);
  });
});
