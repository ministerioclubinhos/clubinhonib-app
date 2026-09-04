import React, { useMemo } from "react";

import {
  LinkManagerDialog,
  type LinkOption,
  type LinkedItem,
} from "@/components/common/linking";
import type { ClubSelectOption } from "@/features/clubs/types";

import { clubLabel, teacherName } from "../utils";
import type { TeacherResponse } from "../types";

type Props = {
  open: boolean;
  teacher: TeacherResponse | null;
  clubs: ClubSelectOption[];
  clubsLoading: boolean;
  loading: boolean;
  error: string;
  /** Sem permissão o diálogo mostra o vínculo e esconde os controles. */
  canManage: boolean;
  onAssign: (clubId: string) => void;
  onUnassign: () => void;
  onClose: () => void;
};

/**
 * O clubinho de um professor.
 *
 * Vínculo único: escolher outro clubinho troca, numa operação só. O clubinho é
 * escolhido numa lista — o número digitado à mão só falhava depois de enviado.
 */
export default function TeacherClubDialog({
  open,
  teacher,
  clubs,
  clubsLoading,
  loading,
  error,
  canManage,
  onAssign,
  onUnassign,
  onClose,
}: Props) {
  const linked = useMemo<LinkedItem[]>(
    () =>
      teacher?.club
        ? [{ id: teacher.club.id, primary: clubLabel(teacher.club) }]
        : [],
    [teacher],
  );

  const options = useMemo<LinkOption[]>(
    () => clubs.map((club) => ({ id: club.id, label: club.label })),
    [clubs],
  );

  if (!teacher) return null;

  return (
    <LinkManagerDialog
      open={open}
      title="Clubinho do professor"
      subjectName={teacherName(teacher)}
      cardinality="single"
      linked={linked}
      options={options}
      optionsLoading={clubsLoading}
      loading={loading}
      error={error}
      readOnly={!canManage}
      readOnlyReason="Seu perfil não altera o clubinho de um professor."
      labels={{
        linkedTitle: "Vínculo atual",
        emptyLinked: "Sem clubinho",
        addLabel: "Clubinho",
        addPlaceholder: "Busque pelo número",
        noOptions: "Nenhum clubinho disponível",
        submit: "Vincular",
        submitReplace: "Trocar",
        unlink: () => "Desvincular clubinho",
      }}
      onAdd={onAssign}
      onUnlink={onUnassign}
      onClose={onClose}
    />
  );
}
