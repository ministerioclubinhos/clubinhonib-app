import { expect, test } from '@playwright/test';

import { LINK_CLUB_MESSAGES } from "@/features/auth/constants";
import { linkClubErrorMessage, validateClubNumber } from "@/features/auth/utils";

test.describe("validateClubNumber", () => {
  test("aceita um número inteiro positivo", () => {
    expect(validateClubNumber("12")).toEqual({ valid: true, clubNumber: 12 });
  });

  test("ignora espaço em volta", () => {
    expect(validateClubNumber("  7 ")).toEqual({ valid: true, clubNumber: 7 });
  });

  test("recusa texto com número no começo", () => {
    // `parseInt("12abc")` devolvia 12: o vínculo seguia com um número que o
    // usuário não digitou.
    expect(validateClubNumber("12abc").valid).toBe(false);
  });

  test("recusa vazio, zero e negativo", () => {
    expect(validateClubNumber("").valid).toBe(false);
    expect(validateClubNumber("0").valid).toBe(false);
    expect(validateClubNumber("-3").valid).toBe(false);
  });

  test("a recusa vem com a mensagem que a tela mostra", () => {
    const resultado = validateClubNumber("x");

    expect(resultado.valid).toBe(false);
    if (!resultado.valid) {
      expect(resultado.message).toBe(LINK_CLUB_MESSAGES.invalidNumber);
    }
  });
});

test.describe("linkClubErrorMessage", () => {
  test("usa o texto que a API devolveu", () => {
    expect(linkClubErrorMessage("Clubinho 99 não existe")).toBe(
      "Clubinho 99 não existe",
    );
  });

  test("usa a mensagem do Error", () => {
    expect(linkClubErrorMessage(new Error("rede fora"))).toBe("rede fora");
  });

  test("sem nada aproveitável, cai na mensagem padrão", () => {
    expect(linkClubErrorMessage(undefined)).toBe(LINK_CLUB_MESSAGES.failed);
    expect(linkClubErrorMessage("   ")).toBe(LINK_CLUB_MESSAGES.failed);
  });
});
