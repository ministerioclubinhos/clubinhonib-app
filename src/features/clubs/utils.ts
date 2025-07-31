export const tz = "America/Manaus";

export const fmtDate = (iso?: string | Date) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: tz }) : "—";
