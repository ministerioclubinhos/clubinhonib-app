import { UserRow } from "@/features/users/types";

export const TZ = "America/Manaus";
export const SENSITIVE_KEYS = new Set(["password", "refreshToken"]);


function justDigits(phone?: string | number | null) {
  return phone ? String(phone).replace(/\D/g, "") : "";
}

function defaultWaMessage(u: UserRow) {
  const nome = u?.name?.trim() || "tudo bem";
  return `Olá, ${nome}! Podemos falar rapidamente?`;
}

export function buildWhatsappLink(u: UserRow) {
  const digits = justDigits(u.phone);
  if (!digits) return null;
  const text = encodeURIComponent(defaultWaMessage(u));
  return `https://wa.me/${digits}?text=${text}`;
}