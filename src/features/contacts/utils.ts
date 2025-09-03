const TZ = "America/Manaus";

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: TZ }) : "—";
