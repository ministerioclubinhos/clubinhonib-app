import { describe, expect, it } from "vitest";

import { LINK_CLUB_MESSAGES } from "./constants";
import { linkClubErrorMessage, validateClubNumber } from "./utils";

describe("validateClubNumber", () => {
  it("aceita um número inteiro positivo", () => {
    expect(validateClubNumber("12")).toEqual({ valid: true, clubNumber: 12 });
  });

  it("ignora espaço em volta", () => {
    expect(validateClubNumber("  7 ")).toEqual({ valid: true, clubNumber: 7 });
  });

  it("recusa texto com número no começo", () => {
    // `parseInt("12abc")` devolvia 12: o vínculo seguia com um número que o
    // usuário não digitou.
    expect(validateClubNumber("12abc").valid).toBe(false);
  });

  it("recusa vazio, zero e negativo", () => {
    expect(validateClubNumber("").valid).toBe(false);
    expect(validateClubNumber("0").valid).toBe(false);
    expect(validateClubNumber("-3").valid).toBe(false);
  });

  it("a recusa vem com a mensagem que a tela mostra", () => {
    const resultado = validateClubNumber("x");

    expect(resultado.valid).toBe(false);
    if (!resultado.valid) {
      expect(resultado.message).toBe(LINK_CLUB_MESSAGES.invalidNumber);
    }
  });
});

describe("linkClubErrorMessage", () => {
  it("usa o texto que a API devolveu", () => {
    expect(linkClubErrorMessage("Clubinho 99 não existe")).toBe(
      "Clubinho 99 não existe",
    );
  });

  it("usa a mensagem do Error", () => {
    expect(linkClubErrorMessage(new Error("rede fora"))).toBe("rede fora");
  });

  it("sem nada aproveitável, cai na mensagem padrão", () => {
    expect(linkClubErrorMessage(undefined)).toBe(LINK_CLUB_MESSAGES.failed);
    expect(linkClubErrorMessage("   ")).toBe(LINK_CLUB_MESSAGES.failed);
  });
});
