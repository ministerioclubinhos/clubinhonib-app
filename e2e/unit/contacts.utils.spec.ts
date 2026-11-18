import { expect, test } from '@playwright/test';

import { buildContactsQuery, formatPhone, whatsappHref } from "@/features/contacts/utils";

/**
 * Trava a query da listagem.
 *
 * `QueryContactsDto` recusa propriedade desconhecida, então um parâmetro a
 * mais derruba a requisição com 400.
 */
test.describe("contacts utils", () => {
  test("a listagem envia só o que QueryContactsDto aceita", () => {
    const params = buildContactsQuery({
      page: 2,
      limit: 12,
      filters: { searchString: "  maria  ", read: false },
    });

    expect(Object.keys(params).sort()).toEqual(
      ["limit", "order", "page", "read", "searchString", "sort"].sort(),
    );
    expect(params.searchString).toBe("maria");
    expect(params.read).toBe(false);
  });

  test("busca vazia não vira filtro", () => {
    // `searchString=` peneiraria por texto vazio no banco.
    const params = buildContactsQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "   " },
    });

    expect(params.searchString).toBeUndefined();
    expect(params.read).toBeUndefined();
  });

  test("formata o telefone e monta o link do WhatsApp", () => {
    expect(formatPhone("92999990000")).toBe("(92) 99999-0000");
    expect(formatPhone(null)).toBe("—");
    expect(whatsappHref("92999990000")).toBe("https://wa.me/5592999990000");
    expect(whatsappHref("123")).toBeNull();
  });
});
