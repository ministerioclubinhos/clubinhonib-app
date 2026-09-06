import React, { useMemo } from "react";

import {
  LinkManagerDialog,
  type LinkOption,
  type LinkedItem,
} from "@/components/common/linking";
import { COORDINATOR_LINKS_ADMIN_ONLY } from "@/utils/clubLinkPermissions";

import { formatUserLabel } from "../utils";
import type { ClubResponse, CoordinatorOption } from "../types";

type Props = {
  open: boolean;
  club: ClubResponse | null;
  coordinators: CoordinatorOption[];
  coordinatorsLoading: boolean;
  loading: boolean;
  error: string;
  /** Só administração altera coordenador; ver `utils/clubLinkPermissions`. */
  canManage: boolean;
  onLink: (coordinatorProfileId: string) => void;
  onUnlink: () => void;
  onClose: () => void;
};

/**
 * O coordenador de um clubinho, direto do card.
 *
 * Vínculo único: escolher outro coordenador troca, numa operação só — o que
 * também resolve a transferência entre coordenações sem passar por desvincular
 * e vincular de novo, com o clubinho órfão no meio do caminho.
 */
export default function ClubCoordinatorDialog({
  open,
  club,
  coordinators,
  coordinatorsLoading,
  loading,
  error,
  canManage,
  onLink,
  onUnlink,
  onClose,
}: Props) {
  const linked = useMemo<LinkedItem[]>(
    () =>
      club?.coordinator
        ? [
            {
              id: club.coordinator.id,
              primary: formatUserLabel(club.coordinator.user),
            },
          ]
        : [],
    [club],
  );

  const options = useMemo<LinkOption[]>(
    () =>
      coordinators
        .filter(
          (coordenador) =>
            coordenador.coordinatorProfileId !== club?.coordinator?.id,
        )
        .map((coordenador) => ({
          id: coordenador.coordinatorProfileId,
          label: coordenador.name,
        })),
    [club, coordinators],
  );

  if (!club) return null;

  return (
    <LinkManagerDialog data-testid="clubs-club-coordinator-dialog"
      open={open}
      title="Coordenador do clubinho"
      subjectName={`Clubinho ${club.number}`}
      cardinality="single"
      linked={linked}
      options={options}
      optionsLoading={coordinatorsLoading}
      loading={loading}
      error={error}
      readOnly={!canManage}
      readOnlyReason={COORDINATOR_LINKS_ADMIN_ONLY}
      labels={{
        linkedTitle: "Coordenação atual",
        emptyLinked: "Sem coordenador",
        addLabel: "Coordenador",
        addPlaceholder: "Busque pelo nome",
        addHelper:
          "Escolher outro coordenador transfere o clubinho numa operação só.",
        noOptions: "Nenhum coordenador disponível",
        submit: "Vincular",
        submitReplace: "Transferir",
        unlink: () => "Desvincular coordenador",
      }}
      onAdd={onLink}
      onUnlink={onUnlink}
      onClose={onClose}
    />
  );
}
