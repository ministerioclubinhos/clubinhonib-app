import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TeachersSelect from "./TeachersSelect";
import type { TeacherOption } from "../../types";

const options: TeacherOption[] = [
  {
    teacherProfileId: "t-livre",
    name: "Ana Livre",
    vinculado: false,
    clubId: null,
    clubNumber: null,
  },
  {
    teacherProfileId: "t-meu",
    name: "Beto Meu",
    vinculado: true,
    clubId: "club-meu",
    clubNumber: 13,
  },
  {
    teacherProfileId: "t-alheio",
    name: "Carla Alheia",
    vinculado: true,
    clubId: "club-alheio",
    clubNumber: 20,
  },
  {
    teacherProfileId: "t-daqui",
    name: "Dora Daqui",
    vinculado: true,
    clubId: "club-editado",
    clubNumber: 12,
  },
];

const onChange = vi.fn();

const openMenu = async () => {
  await userEvent.click(screen.getByRole("combobox"));
};

const renderSelect = (
  props: Partial<React.ComponentProps<typeof TeachersSelect>> = {},
) =>
  render(
    <TeachersSelect
      value={["t-daqui"]}
      options={options}
      onChange={onChange}
      currentClubId="club-editado"
      reachableClubIds={new Set(["club-editado", "club-meu"])}
      {...props}
    />,
  );

describe("TeachersSelect", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Antes, quem já tinha turma sumia da lista: não havia como descobrir por que
   * o professor não aparecia, nem trazê-lo — o que a API aceita.
   */
  it("lista todo mundo, inclusive quem já tem turma", async () => {
    renderSelect();
    await openMenu();

    expect(screen.getByText("Ana Livre")).toBeInTheDocument();
    expect(screen.getByText("Beto Meu")).toBeInTheDocument();
    expect(screen.getByText("Carla Alheia")).toBeInTheDocument();
  });

  it("diz de onde o professor viria", async () => {
    renderSelect();
    await openMenu();

    expect(screen.getByText("No Clubinho 13 — será movido")).toBeInTheDocument();
  });

  /** Trazer de fora da coordenação tiraria a turma de outra pessoa; a API recusa. */
  it("bloqueia quem está em clubinho de outra coordenação", async () => {
    renderSelect();
    await openMenu();

    expect(
      screen.getByText("Em um clubinho de outra coordenação"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Carla Alheia/ }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("não bloqueia nada quando quem edita alcança todos os clubinhos", async () => {
    renderSelect({ reachableClubIds: undefined });
    await openMenu();

    expect(
      screen.queryByText("Em um clubinho de outra coordenação"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("No Clubinho 20 — será movido")).toBeInTheDocument();
  });

  /** Quem já está no clubinho editado não está "sendo movido". */
  it("não anuncia mudança para quem já é do clubinho editado", async () => {
    renderSelect();
    await openMenu();

    expect(
      screen.queryByText("No Clubinho 12 — será movido"),
    ).not.toBeInTheDocument();
  });
});
