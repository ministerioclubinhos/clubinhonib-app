import axios, { CanceledError } from "axios";
import { describe, expect, it } from "vitest";

import { isCancelledRequest } from "./apiError";

/**
 * Uma requisição cancelada não é uma falha.
 *
 * As telas com busca digitada abortam a busca anterior a cada tecla. Antes,
 * o cancelamento passava pelo interceptor como erro qualquer: enchia o console
 * e mostrava toast de erro para quem só estava digitando.
 */
describe("isCancelledRequest", () => {
  it("reconhece o cancelamento do axios", () => {
    const error = new CanceledError("canceled");

    expect(isCancelledRequest(error)).toBe(true);
    // O interceptor usa a mesma checagem para deixar o erro passar direto.
    expect(axios.isCancel(error)).toBe(true);
  });

  it("reconhece o AbortController fora do axios", () => {
    const error = new Error("aborted");
    error.name = "AbortError";

    expect(isCancelledRequest(error)).toBe(true);
  });

  it("não confunde falha de rede com cancelamento", () => {
    const networkError = new axios.AxiosError("Network Error", "ERR_NETWORK");

    expect(isCancelledRequest(networkError)).toBe(false);
    expect(isCancelledRequest(new Error("qualquer coisa"))).toBe(false);
    expect(isCancelledRequest(null)).toBe(false);
    expect(isCancelledRequest(undefined)).toBe(false);
  });
});
