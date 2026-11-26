/** Resultado da checagem do número digitado no vínculo. */
export type ClubNumberValidation =
  | { valid: true; clubNumber: number }
  | { valid: false; message: string };

/** Corpo de `POST /auth/verify-email`. */
export interface VerifyEmailDto {
  token: string;
}

export interface VerifyEmailResponseDto {
  message: string;
  email: string;
}

/** Corpo de `POST /auth/resend-verification`. */
export interface ResendVerificationDto {
  email: string;
}

export interface ResendVerificationResponseDto {
  emailVerification: { verificationEmailSent: boolean; message?: string };
}

export enum EmailConfirmationStatus {
  Confirming = 'confirming',
  Confirmed = 'confirmed',
  Failed = 'failed',
}
