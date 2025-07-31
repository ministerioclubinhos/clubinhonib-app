export const fmtDate = (iso?: string, tz = "America/Manaus") =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: tz }) : "—";
