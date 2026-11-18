/**
 * Funções puras de telefone.
 *
 * Ficam fora do componente de entrada porque quem monta um payload não precisa
 * — e não deve — arrastar o Material UI e o seletor de datas junto: importar a
 * pasta de entradas puxava a cadeia inteira para dentro dos testes de unidade.
 */

/** Texto exibido quando o telefone não tem valor. */
const EMPTY_VALUE = "—";

/** Só os dígitos, que é o formato que a API espera. */
export function extractPhoneDigits(phone?: string | null): string {
  return phone?.replace(/\D/g, "") ?? "";
}

/** Telefone em `(00) 00000-0000`, ou como veio quando não dá para formatar. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return EMPTY_VALUE;

  const digits = extractPhoneDigits(phone);
  if (digits.length >= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length >= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return phone;
}
