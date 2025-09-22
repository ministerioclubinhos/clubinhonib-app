export const formatDate = (date?: string | null, includeTime: boolean = false) => {
  if (!date) return "—";
  return includeTime 
    ? new Date(date).toLocaleString("pt-BR")
    : new Date(date).toLocaleDateString("pt-BR");
};

export const fmtDateOnly = (d?: string | null) => formatDate(d, false);
export const fmtDT = (s?: string) => formatDate(s, true);

export const gLabel = (g?: "M" | "F") => 
  g === "M" ? "Menino" : g === "F" ? "Menina" : "—";

export const fmtBR = (d: string) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "";

export function summaryLabel(from?: string, to?: string) {
  const f = from || "";
  const t = to || "";
  if (!f && !t) return "";
  if (f && t && f === t) return fmtBR(f);
  if (f && t) return `${fmtBR(f)} — ${fmtBR(t)}`;
  if (f && !t) return `${fmtBR(f)} — `;
  if (!f && t) return `— ${fmtBR(t)}`;
  return "";
}

const WEEKDAY_PT: Record<string, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira", 
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
};

export const weekdayLabel = (weekday?: string | null): string => {
  if (!weekday) return "—";
  return WEEKDAY_PT[weekday] || weekday;
};


export const ageFrom = (birth?: string | null) => {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(+b)) return null;
  const now = new Date();
  let y = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  const d = now.getDate() - b.getDate();
  if (m < 0 || (m === 0 && d < 0)) y--;
  return y < 0 ? null : y;
};

function calculateTimeDifference(date?: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(+d)) return null;
  
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) return null;
  
  return { years, months };
}

export const timeDifference = (date?: string | null) => {
  const diff = calculateTimeDifference(date);
  if (!diff) return null;
  
  const { years, months } = diff;
  
  if (years === 0 && months === 0) return "menos de 1 mês";
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
};

export const ageDetailed = timeDifference;
export const tenureFrom = timeDifference;
