import { expect, test } from '@playwright/test';
import type { Theme } from "@mui/material";

import {
  engagementColor,
  medalColor,
  nameInitials,
  performanceColor,
} from "@/features/statistics/utils/ranking";

const theme = { palette: { grey: { 400: "#bdbdbd" } } } as Theme;

test.describe("performanceColor", () => {
  test("classifica nas bordas de cada faixa", () => {
    expect(performanceColor(85)).toBe("success");
    expect(performanceColor(84.9)).toBe("info");
    expect(performanceColor(70)).toBe("info");
    expect(performanceColor(69.9)).toBe("warning");
    expect(performanceColor(60)).toBe("warning");
    expect(performanceColor(59.9)).toBe("default");
  });

  test("clubinho sem nada registrado não vira alerta visual", () => {
    // Zero é ausência de dado, e sai como neutro em vez de vermelho.
    expect(performanceColor(0)).toBe("default");
  });
});

test.describe("medalColor", () => {
  test("dá ouro, prata e bronze aos três primeiros", () => {
    expect(medalColor(1, theme)).toBe("#FFD700");
    expect(medalColor(2, theme)).toBe("#C0C0C0");
    expect(medalColor(3, theme)).toBe("#CD7F32");
  });

  test("do quarto em diante usa o cinza do tema", () => {
    expect(medalColor(4, theme)).toBe("#bdbdbd");
    expect(medalColor(50, theme)).toBe("#bdbdbd");
  });
});

test.describe("engagementColor", () => {
  test("classifica nas bordas de cada faixa", () => {
    // Mais exigente que a de clubinho: a criança é medida pelo próprio
    // histórico, não pela média da turma.
    expect(engagementColor(90)).toBe("success");
    expect(engagementColor(89.9)).toBe("info");
    expect(engagementColor(75)).toBe("info");
    expect(engagementColor(74.9)).toBe("warning");
    expect(engagementColor(60)).toBe("warning");
    expect(engagementColor(59.9)).toBe("default");
  });

  test("criança sem pagela no recorte sai neutra", () => {
    expect(engagementColor(0)).toBe("default");
  });
});

test.describe("nameInitials", () => {
  test("usa a inicial do primeiro e do segundo nome", () => {
    expect(nameInitials("Ana Souza")).toBe("AS");
    expect(nameInitials("joão pedro lima")).toBe("JP");
  });

  test("nome com um termo só usa as duas primeiras letras", () => {
    // Sem isso todos os avatares de nome curto ficariam iguais.
    expect(nameInitials("Ana")).toBe("AN");
  });

  test("ignora espaço em volta e espaços repetidos", () => {
    expect(nameInitials("  Ana   Souza ")).toBe("AS");
  });
});
