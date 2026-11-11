import { MAX_ISO_WEEK, MIN_ISO_WEEK } from "./constants";

/**
 * Regras puras da área do professor.
 *
 * `BRAND_GREEN` saiu daqui para `constants.ts`, e continua reexportado porque
 * os componentes já a importavam deste caminho.
 */
export { BRAND_GREEN } from "./constants";

/**
 * Data de hoje em `YYYY-MM-DD`, pelos componentes locais.
 *
 * `toISOString()` converteria para UTC antes de recortar e, em fuso positivo,
 * devolveria o dia anterior.
 */
export function todayISO(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

/** Mantém a semana dentro dos limites ISO. */
export function clampWeek(week: number): number {
  return Math.max(MIN_ISO_WEEK, Math.min(MAX_ISO_WEEK, week));
}

/** Rótulo de ano e semana, como a barra de navegação mostra. */
export function toLabelWeek(year: number, week: number): string {
  return `Ano: ${year} Semana: ${String(week).padStart(2, "0")}`;
}

/**
 * Ano e semana ISO de uma data.
 *
 * A semana é a da quinta-feira: é ela que decide a qual ano a semana pertence
 * quando a virada de ano cai no meio dela.
 */
export function getISOWeekYear(date: Date): { year: number; week: number } {
  const quinta = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  quinta.setUTCDate(quinta.getUTCDate() + 4 - (quinta.getUTCDay() || 7));

  const year = quinta.getUTCFullYear();
  const inicioDoAno = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((quinta.getTime() - inicioDoAno.getTime()) / 86400000 + 1) / 7,
  );

  return { year, week };
}

/**
 * Semanas letivas que aceitam lançamento, da atual para a primeira.
 *
 * Fora do período letivo não há nenhuma. A ordem é decrescente porque quase
 * todo lançamento é da semana atual ou da anterior.
 */
export function launchableWeeks(window: {
  open: boolean;
  currentWeek: number | null;
} | null): number[] {
  if (!window?.open || !window.currentWeek) return [];

  return Array.from(
    { length: window.currentWeek },
    (_, index) => window.currentWeek! - index,
  );
}
