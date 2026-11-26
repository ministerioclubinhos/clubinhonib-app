import { expect, test } from '@playwright/test';

import {
  clubHasProblem,
  clubStatusLabel,
  clubStatusSeverity,
  completionRate,
  exceptionTypeLabel,
  validatePeriodDates,
} from "@/features/club-control/utils";

test.describe("clubStatusLabel", () => {
  test("nomeia as sete situações que o back devolve", () => {
    // A cópia que existia em `ClubCheckDetail` só cobria quatro: `pending`,
    // `inactive` e `out_of_period` apareciam como "Desconhecido".
    expect(clubStatusLabel("ok")).toBe("Completo");
    expect(clubStatusLabel("pending")).toBe("Pendente");
    expect(clubStatusLabel("partial")).toBe("Parcial");
    expect(clubStatusLabel("missing")).toBe("Faltando");
    expect(clubStatusLabel("exception")).toBe("Exceção");
    expect(clubStatusLabel("inactive")).toBe("Desativado");
    expect(clubStatusLabel("out_of_period")).toBe("Fora do período");
  });

  test("situação desconhecida não quebra a tela", () => {
    expect(clubStatusLabel("algo_novo")).toBe("Indefinido");
  });
});

test.describe("clubStatusSeverity", () => {
  test("só falta e parcial pintam de erro e aviso", () => {
    expect(clubStatusSeverity("missing")).toBe("error");
    expect(clubStatusSeverity("partial")).toBe("warning");
    expect(clubStatusSeverity("ok")).toBe("success");
  });

  test("pendente e fora do período são informativos, não problemas", () => {
    // A semana ainda não chegou, ou nem existe no período letivo.
    expect(clubStatusSeverity("pending")).toBe("info");
    expect(clubStatusSeverity("out_of_period")).toBe("info");
  });
});

test.describe("clubHasProblem", () => {
  test("aponta só o que pede ação", () => {
    expect(clubHasProblem("missing")).toBe(true);
    expect(clubHasProblem("partial")).toBe(true);
  });

  test("pendente não é problema", () => {
    // Cobrar aqui faria toda segunda-feira parecer um problema.
    expect(clubHasProblem("pending")).toBe(false);
    expect(clubHasProblem("ok")).toBe(false);
    expect(clubHasProblem("exception")).toBe(false);
  });
});

test.describe("exceptionTypeLabel", () => {
  test("traduz os tipos conhecidos", () => {
    expect(exceptionTypeLabel("holiday")).toBe("Feriado");
    expect(exceptionTypeLabel("vacation")).toBe("Recesso");
  });

  test("tipo novo aparece como veio, em vez de sumir", () => {
    expect(exceptionTypeLabel("greve")).toBe("greve");
  });
});

test.describe("completionRate", () => {
  test("calcula a fração com uma casa decimal", () => {
    expect(completionRate(1, 3)).toBe(33.3);
    expect(completionRate(8, 10)).toBe(80);
  });

  test("clubinho sem criança mostra 0%, e não NaN", () => {
    expect(completionRate(0, 0)).toBe(0);
  });
});

test.describe("validatePeriodDates", () => {
  test("aceita um período dentro do ano letivo", () => {
    expect(validatePeriodDates("2026-03-02", "2026-12-19", 2026)).toEqual({
      valid: true,
    });
  });

  test("recusa período que termina antes de começar", () => {
    expect(validatePeriodDates("2026-12-19", "2026-03-02", 2026).valid).toBe(
      false,
    );
  });

  test("recusa data fora do ano do período", () => {
    // O ano letivo é o do cadastro: uma data de 2027 num período de 2026
    // faria a contagem de semanas render um total impossível.
    expect(validatePeriodDates("2026-03-02", "2027-01-10", 2026).valid).toBe(
      false,
    );
    expect(validatePeriodDates("2025-12-20", "2026-12-19", 2026).valid).toBe(
      false,
    );
  });

  test("recusa data em branco", () => {
    expect(validatePeriodDates("", "2026-12-19", 2026).valid).toBe(false);
    expect(validatePeriodDates("2026-03-02", "", 2026).valid).toBe(false);
  });

  test("a recusa traz a mensagem que a tela mostra", () => {
    expect(validatePeriodDates("2026-12-19", "2026-03-02", 2026).message).toBe(
      "Informe datas válidas, em ordem, dentro do ano letivo.",
    );
  });
});
