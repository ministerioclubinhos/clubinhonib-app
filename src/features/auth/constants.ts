/** Menor número de clubinho aceito no vínculo. */
export const MIN_CLUB_NUMBER = 1;

/** Mensagens do vínculo de professor a clubinho. */
export const LINK_CLUB_MESSAGES = {
  invalidNumber: 'Informe um número de clubinho válido.',
  failed:
    'Erro ao vincular clubinho. Verifique o número e tente novamente.',
} as const;

/** Textos da confirmação de e-mail. */
export const EMAIL_CONFIRMATION_MESSAGES = {
  CONFIRMING: 'Confirmando seu e-mail...',
  FAILED: 'Não foi possível confirmar o e-mail. O link pode ter expirado ou já ter sido usado.',
  RESEND_FAILED: 'Não foi possível reenviar agora. Tente novamente em instantes.',
} as const;

/** Assunto da mensagem de confirmação, como a pessoa o vê na caixa de entrada. */
export const EMAIL_VERIFICATION_SUBJECT = 'Confirme seu e-mail - Clubinhos NIB';

/** Validade do link de confirmação, em horas. */
export const EMAIL_VERIFICATION_TTL_HOURS = 24;
