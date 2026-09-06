import axios, { CanceledError } from "axios";
import { expect, test } from '@playwright/test';

import { isCancelledRequest } from "@/utils/apiError";

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
