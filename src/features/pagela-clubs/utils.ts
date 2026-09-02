import { useEffect, useState } from "react";

import type { ClubAddress, Weekday } from "@/features/clubs/types";
import { WEEKDAY_LABELS } from "@/features/clubs/constants";
import { EMPTY_VALUE } from "@/features/pagelas/constants";

import { SEARCH_DEBOUNCE_MS } from "./constants";
import type { PagelaViewerScope } from "./types";

/** Rótulos dos dias, reaproveitados do dono do contrato de clubinhos. */
export { WEEKDAY_LABELS };

/** Nome do dia da semana do clubinho. */
export function formatWeekday(weekday?: Weekday | null): string {
  return weekday ? WEEKDAY_LABELS[weekday] : EMPTY_VALUE;
}

/** Frase do dia do encontro, como aparece no card do clubinho. */
export function formatMeetingDay(weekday?: Weekday | null): string {
  return weekday ? `Dia de ${WEEKDAY_LABELS[weekday]}` : "Dia não informado";
}

/**
 * Data `YYYY-MM-DD` em `dd/mm/aaaa`.
 *
 * Lida por componentes, e não por `new Date(texto)`: a string vira meia-noite
 * UTC e, em fuso negativo, a tela mostrava o dia anterior.
 */
export function formatDate(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return EMPTY_VALUE;

  const [year, month, day] = raw.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return raw;

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Bairro e cidade do clubinho em uma linha.
 *
 * Todo campo do endereço é anulável; juntar só o que existe evita a linha
 * `– /` que aparecia quando faltava tudo.
 */
export function formatClubLocation(address?: ClubAddress | null): string {
  const city = [address?.city, address?.state].filter(Boolean).join("/");
  const parts = [address?.district, city].filter(Boolean);

  return parts.length ? parts.join(" – ") : "Endereço não informado";
}

/** Telefone em `(00) 00000-0000`, ou como veio quando não dá para formatar. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return EMPTY_VALUE;

  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length >= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return phone;
}

/** Iniciais do nome, para o avatar. */
export function initialsFromName(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Alcance de quem está olhando, a partir do papel. */
export function viewerScopeOf(isAdmin: boolean): PagelaViewerScope {
  return isAdmin ? "all" : "own";
}

/**
 * Segura o valor por um tempo antes de deixá-lo passar.
 *
 * As buscas dos três painéis são digitadas; sem a espera, cada tecla vira uma
 * requisição.
 */
export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
