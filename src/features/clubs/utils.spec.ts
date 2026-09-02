import { describe, expect, it } from "vitest";

import { EMPTY_CLUB_FORM } from "./constants";
import {
  buildCreateClubRequest,
  buildUpdateClubRequest,
  formatClubAddress,
  formatClubTime,
  toClubFormValues,
  validateClubForm,
} from "./utils";
import type { ClubFormValues, ClubResponse } from "./types";

/**
 * Trava o formato do que sai daqui para a API.
 *
 * `CreateClubDto` e `UpdateClubDto` recusam propriedade desconhecida, então
 * qualquer campo a mais derruba a requisição com 400. Estes testes existem para
 * que isso apareça aqui, e não na tela.
 */
describe("clubs utils", () => {
  const club: ClubResponse = {
    id: "club-1",
    number: 12,
    weekday: "saturday",
    time: "14:30",
    isActive: true,
    address: {
      id: "address-1",
      street: "Rua A",
      number: "10",
      district: "Centro",
      city: "Manaus",
      state: "AM",
      postalCode: "69000-000",
      complement: null,
    },
    coordinator: {
      id: "coord-1",
      active: true,
      user: {
        id: "user-1",
        name: "Fulano",
        email: "fulano@example.com",
        phone: "92999990000",
        active: true,
        completed: true,
        commonUser: false,
      },
    },
    teachers: [{ id: "teacher-1", active: true, user: null }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  };

  const filled: ClubFormValues = {
    number: 12,
    weekday: "saturday",
    time: "14:30",
    isActive: true,
    address: { street: "Rua A", district: "Centro", city: "Manaus", state: "AM" },
    coordinatorProfileId: "coord-1",
    teacherProfileIds: ["teacher-1", "teacher-1", " "],
  };

  it("monta o formulário a partir da resposta, sem o id do endereço", () => {
    const values = toClubFormValues(club);

    expect(values.number).toBe(12);
    expect(values.coordinatorProfileId).toBe("coord-1");
    expect(values.teacherProfileIds).toEqual(["teacher-1"]);
    expect(Object.keys(values.address).sort()).toEqual(
      [
        "city",
        "complement",
        "district",
        "number",
        "postalCode",
        "state",
        "street",
      ].sort(),
    );
    expect(values.address).not.toHaveProperty("id");
  });

  it("a criação envia só o que CreateClubDto aceita", () => {
    const request = buildCreateClubRequest(filled);

    expect(Object.keys(request).sort()).toEqual(
      [
        "address",
        "coordinatorProfileId",
        "isActive",
        "number",
        "teacherProfileIds",
        "time",
        "weekday",
      ].sort(),
    );
    expect(request.teacherProfileIds).toEqual(["teacher-1"]);
  });

  it("a criação omite o que está vazio em vez de mandar null", () => {
    const request = buildCreateClubRequest({ ...EMPTY_CLUB_FORM, number: 3 });

    expect(Object.keys(request).sort()).toEqual(
      ["isActive", "number", "weekday"].sort(),
    );
  });

  it("a edição manda null para limpar horário e coordenador", () => {
    const request = buildUpdateClubRequest({
      ...filled,
      time: null,
      coordinatorProfileId: null,
      teacherProfileIds: [],
    });

    expect(request.time).toBeNull();
    expect(request.coordinatorProfileId).toBeNull();
    // Lista vazia é informação: significa desvincular todos os professores.
    expect(request.teacherProfileIds).toEqual([]);
  });

  it("a edição envia só o que UpdateClubDto aceita", () => {
    expect(Object.keys(buildUpdateClubRequest(filled)).sort()).toEqual(
      [
        "address",
        "coordinatorProfileId",
        "isActive",
        "number",
        "teacherProfileIds",
        "time",
        "weekday",
      ].sort(),
    );
  });

  it("o endereço nunca leva id nem carimbos de data de volta", () => {
    const request = buildUpdateClubRequest(toClubFormValues(club));

    expect(request.address).not.toHaveProperty("id");
    expect(request.address).not.toHaveProperty("createdAt");
    expect(request.address).not.toHaveProperty("updatedAt");
  });

  it("cobra número válido e horário no formato aceito", () => {
    expect(validateClubForm(filled)).toEqual({});
    expect(validateClubForm({ ...filled, number: null }).number).toBeDefined();
    expect(validateClubForm({ ...filled, number: 0 }).number).toBeDefined();
    expect(validateClubForm({ ...filled, time: "25:00" }).time).toBeDefined();
    expect(validateClubForm({ ...filled, time: "9:05" })).toEqual({});
  });

  it("formata horário e endereço para exibição", () => {
    expect(formatClubTime("14:30:00")).toBe("14:30");
    expect(formatClubTime(null)).toBe("—");
    expect(formatClubAddress(club.address)).toBe(
      "Rua A, 10 · Centro · Manaus - AM · 69000-000",
    );
    expect(formatClubAddress(null)).toBe("—");
  });
});
