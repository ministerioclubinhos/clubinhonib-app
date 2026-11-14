/** Resultado da checagem do número digitado no vínculo. */
export type ClubNumberValidation =
  | { valid: true; clubNumber: number }
  | { valid: false; message: string };
