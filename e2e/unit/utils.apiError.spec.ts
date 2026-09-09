import axios, { CanceledError } from "axios";
import { expect, test } from '@playwright/test';

import { extractErrorMessage, getErrorMessage, isCancelledRequest } from "@/utils/apiError";
import { GENERIC_ERROR_MESSAGES } from "@/constants/errorMessages";

/** Texto que o formulário usa quando não há nada melhor a mostrar. */
const FALLBACK = GENERIC_ERROR_MESSAGES.SAVE_ERROR;

/**
 * Uma requisição cancelada não é uma falha.
 *
 * As telas com busca digitada abortam a busca anterior a cada tecla. Antes,
 * o cancelamento passava pelo interceptor como erro qualquer: enchia o console
 * e mostrava toast de erro para quem só estava digitando.
 */
test.describe("isCancelledRequest", () => {
  test("reconhece o cancelamento do axios", () => {
    const error = new CanceledError("canceled");

    expect(isCancelledRequest(error)).toBe(true);
    // O interceptor usa a mesma checagem para deixar o erro passar direto.
    expect(axios.isCancel(error)).toBe(true);
  });

  test("reconhece o AbortController fora do axios", () => {
    const error = new Error("aborted");
    error.name = "AbortError";

    expect(isCancelledRequest(error)).toBe(true);
  });

  test("não confunde falha de rede com cancelamento", () => {
    const networkError = new axios.AxiosError("Network Error", "ERR_NETWORK");

    expect(isCancelledRequest(networkError)).toBe(false);
    expect(isCancelledRequest(new Error("qualquer coisa"))).toBe(false);
    expect(isCancelledRequest(null)).toBe(false);
    expect(isCancelledRequest(undefined)).toBe(false);
  });
});

/**
 * A mensagem que o formulário mostra quando o salvamento falha.
 *
 * Os formulários de página engoliam a exceção e exibiam sempre "erro ao salvar
 * as alterações", escondendo justamente o que a API tinha a dizer — arquivo
 * ausente, sessão expirada, upload grande demais.
 */
test.describe("extractErrorMessage", () => {
  const apiError = (status: number, message: string) => {
    const error = new axios.AxiosError("Request failed", "ERR_BAD_REQUEST");
    error.response = {
      status,
      statusText: "",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { success: false, error: { code: "CONTENT_5001", message } },
    };
    return error;
  };

  test("prefere a mensagem que a API devolveu", () => {
    expect(
      extractErrorMessage(apiError(422, 'Arquivo ausente para a mídia "Foto".'), FALLBACK),
    ).toBe('Arquivo ausente para a mídia "Foto".');
  });

  test("traduz o 413 do transporte, que não passa pelo envelope da API", () => {
    const tooLarge = new axios.AxiosError("Request failed", "ERR_BAD_REQUEST");
    tooLarge.response = {
      status: 413,
      statusText: "",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: "",
    };

    expect(extractErrorMessage(tooLarge, FALLBACK)).toBe(
      GENERIC_ERROR_MESSAGES.PAYLOAD_TOO_LARGE,
    );
  });

  test("cai no texto padrão quando não há nada a dizer", () => {
    expect(extractErrorMessage({}, FALLBACK)).toBe(FALLBACK);
  });

  test("o aviso global traduz o mesmo 413", () => {
    const tooLarge = new axios.AxiosError("Request failed with status code 413", "ERR_BAD_REQUEST");
    tooLarge.response = {
      status: 413,
      statusText: "",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: "",
    };

    // `getErrorMessage` é o que alimenta o toast do interceptor: as duas
    // mensagens da mesma falha não podem divergir.
    expect(getErrorMessage(tooLarge)).toBe(GENERIC_ERROR_MESSAGES.PAYLOAD_TOO_LARGE);
  });
});
