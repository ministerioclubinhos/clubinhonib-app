import React, { useMemo } from "react";

import {
  LinkManagerDialog,
  type LinkOption,
  type LinkedItem,
} from "@/components/common/linking";

import { formatUserLabel } from "../utils";
import type { ClubResponse, TeacherOption } from "../types";

type Props = {
  open: boolean;
  club: ClubResponse | null;
  teachers: TeacherOption[];
  teachersLoading: boolean;
  loading: boolean;
  error: string;
  /** Sem permissão o diálogo mostra os vínculos e esconde os controles. */
  canManage: boolean;
  onLink: (teacherProfileId: string) => void;
  onUnlink: (teacher: { id: string }) => void;
  onClose: () => void;
};

/**
 * Os professores de um clubinho, direto do card.
 *
 * Antes só dava para mexer nisso abrindo o formulário de edição inteiro, que
 * pede número, dia, horário e endereço para trocar um professor de turma.
 */
export default function ClubTeachersDialog({
  open,
  club,
  teachers,
  teachersLoading,
  loading,
  error,
  canManage,
  onLink,
  onUnlink,
  onClose,
}: Props) {
  const linked = useMemo<LinkedItem[]>(
    () =>
      (club?.teachers ?? []).map((teacher) => ({
        id: teacher.id,
        primary: formatUserLabel(teacher.user),
      })),
    [club],
  );

  const options = useMemo<LinkOption[]>(() => {
    const jaNoClubinho = new Set((club?.teachers ?? []).map((t) => t.id));

    return teachers
      .filter((teacher) => !jaNoClubinho.has(teacher.teacherProfileId))
      .map((teacher) => ({
        id: teacher.teacherProfileId,
        // Quem já tem turma sai de lá ao entrar aqui; o rótulo diz de onde,
        // para evitar a surpresa de "sumiu do outro clubinho".
        label:
          teacher.clubNumber !== null
            ? `${teacher.name} · hoje no clubinho ${teacher.clubNumber}`
            : teacher.name,
      }));
  }, [club, teachers]);

  if (!club) return null;

  return (
    <LinkManagerDialog data-testid="clubs-club-teachers-dialog"
      open={open}
      title="Professores do clubinho"
      subjectName={`Clubinho ${club.number}`}
      cardinality="multiple"
      linked={linked}
      options={options}
      optionsLoading={teachersLoading}
      loading={loading}
      error={error}
      readOnly={!canManage}
      readOnlyReason="Seu perfil não altera os professores deste clubinho."
      labels={{
        linkedTitle: "Professores vinculados",
        emptyLinked: "Nenhum professor neste clubinho",
        addLabel: "Professor",
        addPlaceholder: "Busque pelo nome",
        addHelper: "O professor sai do clubinho atual ao entrar neste.",
        noOptions: "Nenhum professor disponível",
        submit: "Vincular",
        unlink: (item) => `Desvincular ${item.primary}`,
      }}
      onAdd={onLink}
      onUnlink={onUnlink}
      onClose={onClose}
    />
  );
}
