/** O mínimo que o rótulo precisa; serve ao `ClubLite` do login e ao `ProfileClub`. */
interface ClubLabelSource {
  number: number;
  district?: string | null;
  city?: string | null;
}

const SEPARATOR = ' - ';

/** Ex.: "Clubinho 91 - Centro - Recife" (bairro e cidade só entram se cadastrados). */
export function formatTeacherClubLabel(club: ClubLabelSource): string {
  return [`Clubinho ${club.number}`, club.district, club.city]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(SEPARATOR);
}

/** Ex.: "Clubinhos: 23 - 45 - 43 - 34", na ordem em que a API devolve. */
export function formatCoordinatorClubsLabel(clubs: readonly ClubLabelSource[]): string {
  const numbers = clubs.map((club) => club.number).join(SEPARATOR);
  return `${clubs.length === 1 ? 'Clubinho' : 'Clubinhos'}: ${numbers}`;
}
