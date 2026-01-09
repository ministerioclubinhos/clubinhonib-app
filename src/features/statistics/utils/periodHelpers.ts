import { PeriodShortcut } from '../api';

/**
 * ⭐ v2.11.0: Helpers para calcular datas dos atalhos de período
 *
 * Converte atalhos de período em datas de início e fim
 */

export interface PeriodDates {
  startDate: string;
  endDate: string;
}

/**
 * Converte um atalho de período em datas de início e fim
 * @param period - Atalho de período (today, this_week, etc)
 * @returns Objeto com startDate e endDate no formato YYYY-MM-DD
 */
export function getPeriodDates(
  period: PeriodShortcut | undefined,
  customStart?: string,
  customEnd?: string
): PeriodDates | undefined {
  if (!period || period === 'custom') {
    // Se period é custom ou undefined, retorna as datas customizadas (se fornecidas)
    if (customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd };
    }
    return undefined;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today': {
      const dateStr = formatDate(today);
      return { startDate: dateStr, endDate: dateStr };
    }

    case 'this_week': {
      // Semana começa na segunda-feira
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Se domingo (0), volta 6 dias
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
      };
    }

    case 'this_month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      };
    }

    case 'last_7_days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // Últimos 7 dias (incluindo hoje)

      return {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(today),
      };
    }

    case 'last_30_days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29); // Últimos 30 dias (incluindo hoje)

      return {
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(today),
      };
    }

    case 'this_year': {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

      return {
        startDate: formatDate(firstDayOfYear),
        endDate: formatDate(today),
      };
    }

    default:
      return undefined;
  }
}

/**
 * Formata uma data para o formato YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna o label amigável de um atalho de período
 */
export function getPeriodLabel(period: PeriodShortcut | undefined): string {
  switch (period) {
    case 'today':
      return 'Hoje';
    case 'this_week':
      return 'Esta Semana';
    case 'this_month':
      return 'Este Mês';
    case 'last_7_days':
      return 'Últimos 7 Dias';
    case 'last_30_days':
      return 'Últimos 30 Dias';
    case 'this_year':
      return 'Este Ano';
    case 'custom':
      return 'Personalizado';
    default:
      return 'Todos os Períodos';
  }
}

/**
 * Retorna descrição detalhada do período selecionado
 */
export function getPeriodDescription(
  period: PeriodShortcut | undefined,
  customStart?: string,
  customEnd?: string
): string {
  const dates = getPeriodDates(period, customStart, customEnd);

  if (!dates) {
    return 'Todos os dados disponíveis';
  }

  const { startDate, endDate } = dates;

  if (startDate === endDate) {
    return `Data: ${formatDateBR(startDate)}`;
  }

  return `Período: ${formatDateBR(startDate)} a ${formatDateBR(endDate)}`;
}

/**
 * Formata data para formato brasileiro (DD/MM/YYYY)
 */
function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
