import { expect, test } from '@playwright/test';

import {
  buildCreatePagelaRequest,
  buildPagelasQuery,
  buildUpdatePagelaRequest,
  formatReferenceDate,
  formatWeekLabel,
  pagelaStatus,
  weekSearchIsMeaningful,
} from "@/features/pagelas/utils";
import type { PagelaResponse } from "@/features/pagelas/types";

/**
 * Trava o formato do que sai daqui para a API.
 *
 * `CreatePagelaDto` e `UpdatePagelaDto` recusam propriedade desconhecida, então
 * qualquer campo a mais derruba a requisição com 400.
 */
test.describe("pagelas utils", () => {
  const pagela: PagelaResponse = {
    id: "pagela-1",
    childId: "child-1",
    teacherProfileId: null,
    referenceDate: "2026-03-07",
    year: 2026,
    week: 5,
    present: true,
    didMeditation: true,
    recitedVerse: true,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    updatedBy: null,
    updatedAt: "2026-01-02T00:00:00.000Z",
  };

  test("a criação envia só o que CreatePagelaDto aceita", () => {
    const request = buildCreatePagelaRequest({
      childId: "child-1",
      referenceDate: "2026-03-07",
      present: true,
      didMeditation: false,
      recitedVerse: true,
      week: 5,
      year: 2026,
      teacherProfileId: "teacher-1",
      notes: "  observação  ",
    });

    expect(Object.keys(request).sort()).toEqual(
      [
        "childId",
        "didMeditation",
        "notes",
        "present",
        "recitedVerse",
        "referenceDate",
        "teacherProfileId",
        "week",
        "year",
      ].sort(),
    );
    expect(request.notes).toBe("observação");
  });

  test("a criação omite o que está vazio em vez de mandar null", () => {
    const request = buildCreatePagelaRequest({
      childId: "child-1",
      referenceDate: "2026-03-07",
      present: false,
      didMeditation: false,
      recitedVerse: false,
      notes: "   ",
      teacherProfileId: null,
    });

    expect(Object.keys(request).sort()).toEqual(
      [
        "childId",
        "didMeditation",
        "present",
        "recitedVerse",
        "referenceDate",
      ].sort(),
    );
  });

  test("a edição manda null para limpar a observação", () => {
    expect(buildUpdatePagelaRequest({ notes: "   " }).notes).toBeNull();
    expect(buildUpdatePagelaRequest({ notes: null }).notes).toBeNull();
  });

  test("a edição não inventa campo que não foi mexido", () => {
    expect(Object.keys(buildUpdatePagelaRequest({ present: false }))).toEqual([
      "present",
    ]);
    expect(buildUpdatePagelaRequest({})).toEqual({});
  });

  test("a query da listagem só leva o que QueryPagelasDto aceita", () => {
    // A API roda `forbidNonWhitelisted`: um campo a mais aqui derruba a
    // requisição inteira com 400, não é ignorado.
    const params = buildPagelasQuery({
      childId: "child-1",
      page: 2,
      limit: 9,
      filters: { searchString: " 2026-48 ", present: true },
    });

    expect(Object.keys(params).sort()).toEqual(
      [
        "childId",
        "didMeditation",
        "limit",
        "page",
        "present",
        "recitedVerse",
        "searchString",
        "week",
        "year",
      ].sort(),
    );
    expect(params.searchString).toBe("2026-48");
  });

  test("o recorte de ano e semana chega na query", () => {
    const params = buildPagelasQuery({
      childId: "child-1",
      page: 1,
      limit: 10,
      filters: { year: 2026, week: 48 },
    });

    expect(params.year).toBe(2026);
    expect(params.week).toBe(48);
  });

  test("classifica a semana da criança", () => {
    expect(pagelaStatus(pagela)).toBe("complete");
    expect(pagelaStatus({ ...pagela, recitedVerse: false })).toBe("partial");
    expect(pagelaStatus({ ...pagela, present: false })).toBe("absent");
  });

  test("sabe quando a busca livre não filtra nada", () => {
    expect(weekSearchIsMeaningful("2026-48")).toBe(true);
    expect(weekSearchIsMeaningful("2026")).toBe(true);
    expect(weekSearchIsMeaningful("48")).toBe(true);
    expect(weekSearchIsMeaningful("")).toBe(true);
    expect(weekSearchIsMeaningful("abc")).toBe(false);
    expect(weekSearchIsMeaningful("99")).toBe(false);
  });

  test("mostra a data do encontro no dia certo", () => {
    // `new Date('2026-03-01')` seria lido como UTC e, em Manaus, viraria 29/02.
    expect(formatReferenceDate("2026-03-01")).toBe("01/03/2026");
    expect(formatReferenceDate(null)).toBe("—");
    expect(formatWeekLabel(2026, 5)).toBe("Semana 05 · 2026");
  });
});
