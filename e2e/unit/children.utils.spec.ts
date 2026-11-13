import { expect, test } from '@playwright/test';

import { Gender } from "@/features/children/constants";
import {
  ageInYears,
  buildChildrenQuery,
  childToForm,
  cityLabel,
  clubLabel,
  emptyChildForm,
  formatDateOnly,
  authorLabel,
  authorshipLine,
  toCreateChildRequest,
  toUpdateChildRequest,
  validateChildForm,
} from "@/features/children/utils";
import type { ChildFormValues, ChildResponse } from "@/features/children/types";

const child: ChildResponse = {
  id: "child-1",
  name: "Ana Souza",
  birthDate: "2018-05-20",
  guardianName: "Marta Souza",
  gender: Gender.FEMALE,
  guardianPhone: "92999990000",
  joinedAt: "2024-02-01",
  isActive: true,
  club: { id: "club-1", number: 12, weekday: "saturday" },
  address: {
    id: "addr-1",
    street: "Rua das Flores",
    number: "10",
    district: "Centro",
    city: "Manaus",
    state: "AM",
    postalCode: "69000000",
    complement: null,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: null,
  updatedBy: null,
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const validForm = (overrides: Partial<ChildFormValues> = {}): ChildFormValues => ({
  ...emptyChildForm(),
  name: "Ana Souza",
  birthDate: "2018-05-20",
  guardianName: "Marta Souza",
  district: "Centro",
  city: "Manaus",
  state: "AM",
  ...overrides,
});

test.describe("formatDateOnly", () => {
  /**
   * A API manda `YYYY-MM-DD`, um dia sem hora. Passar isso por `new Date`
   * seria lê-lo como UTC e, num fuso a oeste, mostrar o dia anterior.
   */
  test("mantém o dia de calendário, sem passar por fuso", () => {
    expect(formatDateOnly("2018-05-20")).toBe("20/05/2018");
    expect(formatDateOnly("2018-01-01")).toBe("01/01/2018");
  });

  test("aceita um carimbo completo e devolve só o dia", () => {
    expect(formatDateOnly("2026-01-02T23:30:00.000Z")).toBe("02/01/2026");
  });

  test("devolve o traço quando não há data", () => {
    expect(formatDateOnly(null)).toBe("—");
  });
});

test.describe("ageInYears", () => {
  test("conta anos completos", () => {
    expect(ageInYears("2018-05-20", new Date("2026-05-20T12:00:00Z"))).toBe(8);
  });

  test("não conta o ano antes do aniversário", () => {
    expect(ageInYears("2018-05-20", new Date("2026-05-19T12:00:00Z"))).toBe(7);
  });

  test("devolve nulo para data ausente ou inválida", () => {
    expect(ageInYears(null)).toBeNull();
    expect(ageInYears("nao-e-data")).toBeNull();
  });
});

test.describe("buildChildrenQuery", () => {
  test("não envia filtro vazio", () => {
    const params = buildChildrenQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "  ", birthDateFrom: "" },
    });

    expect(params.searchString).toBeUndefined();
    expect(params.birthDateFrom).toBeUndefined();
  });

  /**
   * A ordenação padrão precisa ser um campo que a API aceita: a versão anterior
   * mandava `orderBy=updatedAt`, que não existia na lista do repositório, e a
   * consulta caía silenciosamente na ordem por nome.
   */
  test("usa a ordenação padrão aceita pela API", () => {
    const params = buildChildrenQuery({ page: 1, limit: 12 });

    expect(params.orderBy).toBe("name");
    expect(params.order).toBe("ASC");
  });

  test("envia os filtros preenchidos", () => {
    const params = buildChildrenQuery({
      page: 3,
      limit: 24,
      filters: {
        searchString: " ana ",
        clubNumber: 12,
        isActive: false,
        joinedFrom: "2024-01-01",
      },
    });

    expect(params).toMatchObject({
      page: 3,
      limit: 24,
      searchString: "ana",
      clubNumber: 12,
      isActive: false,
      joinedFrom: "2024-01-01",
    });
  });
});

test.describe("validateChildForm", () => {
  test("aceita um cadastro completo", () => {
    expect(validateChildForm(validForm())).toEqual({});
  });

  test("cobra nome, nascimento, responsável e endereço", () => {
    const errors = validateChildForm(
      validForm({
        name: "",
        birthDate: "",
        guardianName: "",
        district: "",
        city: "",
        state: "",
      }),
    );

    expect(Object.keys(errors).sort()).toEqual(
      ["birthDate", "city", "district", "guardianName", "name", "state"].sort(),
    );
  });

  test("exige a UF com duas letras", () => {
    expect(validateChildForm(validForm({ state: "AMA" })).state).toBeDefined();
  });
});

test.describe("payloads", () => {
  test("manda só os dígitos do telefone e a UF em maiúsculas", () => {
    const payload = toCreateChildRequest(
      validForm({ guardianPhone: "(92) 99999-0000", state: "am" }),
    );

    expect(payload.guardianPhone).toBe("92999990000");
    expect(payload.address?.state).toBe("AM");
  });

  test("não manda o endereço com id, que a API recusa", () => {
    const payload = toCreateChildRequest(validForm());

    expect(payload.address).not.toHaveProperty("id");
    expect(payload.address).not.toHaveProperty("createdAt");
    expect(payload.address).not.toHaveProperty("updatedAt");
  });

  /** `null` é como a API distingue "apague isto" de "não mexa nisto". */
  test("limpa a data de entrada com null na edição", () => {
    const payload = toUpdateChildRequest(validForm({ joinedAt: "" }));

    expect(payload.joinedAt).toBeNull();
  });
});

test.describe("endereço na edição", () => {
  test("campo apagado vai como texto vazio, para a API limpar", () => {
    const payload = toUpdateChildRequest(
      validForm({ complement: "", number: " ", postalCode: "" }),
    );

    expect(payload.address).toMatchObject({
      complement: "",
      number: "",
      postalCode: "",
    });
  });

  test("na criação o campo vazio some do corpo", () => {
    const payload = toCreateChildRequest(validForm({ complement: "" }));

    expect(payload.address?.complement).toBeUndefined();
  });
});

test.describe("clubinho obrigatório", () => {
  test("professor e coordenador não cadastram criança sem clubinho", () => {
    const errors = validateChildForm(validForm({ clubId: null }), {
      requireClub: true,
    });

    expect(errors.clubId).toBeTruthy();
  });

  test("o administrador pode cadastrar sem clubinho", () => {
    expect(validateChildForm(validForm({ clubId: null })).clubId).toBeUndefined();
  });
});

test.describe("childToForm", () => {
  test("achata o endereço nos campos do formulário", () => {
    const form = childToForm(child);

    expect(form.id).toBe("child-1");
    expect(form.clubId).toBe("club-1");
    expect(form.city).toBe("Manaus");
    expect(form.complement).toBe("");
  });
});

test.describe("apresentação", () => {
  test("rotula o clubinho e a cidade", () => {
    expect(clubLabel(child)).toBe("Clubinho 12");
    expect(cityLabel(child)).toBe("Manaus/AM");
    expect(clubLabel({ ...child, club: null })).toBe("Sem clubinho");
    expect(cityLabel({ ...child, address: null })).toBe("—");
  });
});

test.describe("autoria", () => {
  const ana = { id: "u1", name: "Ana" };
  const bia = { id: "u2", name: "Bia" };

  test("mostra quem criou e, se foi outra pessoa, quem alterou", () => {
    expect(
      authorshipLine({ createdBy: ana, updatedBy: bia, createdVerb: "Lançada", updatedVerb: "alterada" }),
    ).toBe("Lançada por Ana · alterada por Bia");
    expect(
      authorshipLine({ createdBy: ana, updatedBy: ana, createdVerb: "Lançada", updatedVerb: "alterada" }),
    ).toBe("Lançada por Ana");
  });

  test("registro antigo, sem autor, não mostra linha", () => {
    expect(authorshipLine({ createdBy: null, updatedBy: null, createdVerb: "Lançada" })).toBeNull();
    expect(authorLabel(null)).toBe("—");
    expect(authorLabel(ana)).toBe("Ana");
  });
});
