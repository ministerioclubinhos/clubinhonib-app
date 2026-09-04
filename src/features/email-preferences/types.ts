/**
 * Contratos das preferências de e-mail.
 *
 * Espelham `src/core/user/dto/unsubscribe-notices.dto.ts` da API, campo a
 * campo.
 */

/** Corpo de `POST /email-preferences/unsubscribe` (`UnsubscribeNoticesDto`). */
export type UnsubscribeNoticesRequest = {
  token: string;
};

/** Resposta do descadastro (`EmailPreferencesResponseDto`). */
export type EmailPreferencesResponse = {
  unsubscribed: boolean;
  message: string;
};

/** Em que ponto a página está. */
export type UnsubscribeStatus = "idle" | "loading" | "done" | "error";
