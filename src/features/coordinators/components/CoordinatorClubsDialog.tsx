import React, { useMemo } from "react";

import {
  LinkManagerDialog,
  type LinkOption,
  type LinkedItem,
} from "@/components/common/linking";
import type { ClubSelectOption } from "@/features/clubs/types";
import { COORDINATOR_LINKS_ADMIN_ONLY } from "@/utils/clubLinkPermissions";

import { clubLabel, coordinatorName } from "../utils";
import type { CoordinatorClub, CoordinatorResponse } from "../types";

type Props = {
  open: boolean;
  coordinator: CoordinatorResponse | null;
  clubs: ClubSelectOption[];
  clubsLoading: boolean;
  loading: boolean;
  error: string;
  /** Sem permissão o diálogo mostra os vínculos e esconde os controles. */
  canManage: boolean;
  onAssign: (clubId: string) => void;
  onUnassign: (club: CoordinatorClub) => void;
  onClose: () => void;
};

/**
 * Os clubinhos de um coordenador.
 *
 * Vínculo múltiplo: cada clubinho entra e sai por si. Um clubinho tem um
 * coordenador só, então os que já têm aparecem desabilitados — escolhê-los
 * tiraria a turma de outra pessoa, e a API recusa.
 */
export default function CoordinatorClubsDialog({
  open,
  coordinator,
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
      (coordinator?.clubs ?? []).map((club) => ({
        id: club.id,
        primary: clubLabel(club),
        secondary: `${club.teachers?.length ?? 0} professor(es)`,
      })),
    [coordinator],
  );

  const options = useMemo<LinkOption[]>(
    () =>
      clubs.map((club) => ({
        id: club.id,
        label: club.label,
        blockedReason: club.coordinator
          ? "Já tem coordenador — remova-o de lá primeiro"
          : undefined,
      })),
    [clubs],
  );

  const clubById = useMemo(
    () => new Map((coordinator?.clubs ?? []).map((club) => [club.id, club])),
    [coordinator],
  );

  if (!coordinator) return null;

  return (
    <LinkManagerDialog data-testid="coordinators-coordinator-clubs-dialog"
      open={open}
      title="Clubinhos do coordenador"
      subjectName={coordinatorName(coordinator)}
      cardinality="multiple"
      linked={linked}
      options={options}
      optionsLoading={clubsLoading}
      loading={loading}
      error={error}
      readOnly={!canManage}
      readOnlyReason={COORDINATOR_LINKS_ADMIN_ONLY}
      labels={{
        linkedTitle: "Vinculados",
        emptyLinked: "Nenhum clubinho vinculado",
        addLabel: "Vincular clubinho",
        addPlaceholder: "Busque pelo número",
        noOptions: "Nenhum clubinho disponível",
        submit: "Vincular",
        unlink: (item) => `Desvincular ${item.primary}`,
      }}
      onAdd={onAssign}
      onUnlink={(item) => {
        const club = clubById.get(item.id);
        if (club) onUnassign(club);
      }}
      onClose={onClose}
    />
  );
}
