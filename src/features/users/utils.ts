export const TZ = "America/Manaus";
export const SENSITIVE_KEYS = new Set(["password", "refreshToken"]);

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: TZ }) : "—";
