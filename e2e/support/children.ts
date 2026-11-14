import type { ApiClient } from './api';
import { uniqueSuffix } from './api';

/**
 * Dados reais para os testes de crianças, pagelas e decisões.
 *
 * Nada aqui é simulado: a criança é criada na API de verdade, com um nome
 * único, e apagada no fim — a exclusão leva junto as pagelas e as decisões
 * dela. Assim os testes não dependem do que já existe no banco nem deixam
 * resto nele.
 */
export interface SeededChild {
  id: string;
  name: string;
  guardianPhone: string;
}

export interface LaunchWindow {
  open: boolean;
  reason: string | null;
  message: string | null;
  today: string;
  year: number | null;
  currentWeek: number | null;
  totalWeeks: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface PagelaRow {
  id: string;
  childId: string;
  teacherProfileId: string | null;
  referenceDate: string;
  year: number;
  week: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes: string | null;
  createdBy: { id: string; name: string } | null;
  updatedBy: { id: string; name: string } | null;
}

export interface ChildListRow {
  id: string;
  name: string;
  isActive: boolean;
  acceptedChrists: {
    id: string;
    decision: 'ACCEPTED' | 'RECONCILED' | null;
    createdBy: { id: string; name: string } | null;
  }[];
}

/** Telefone único de 11 dígitos, para a busca por telefone achar só esta criança. */
function uniquePhone(): string {
  const tail = String(Date.now()).slice(-8);
  return `929${tail}`;
}

export async function seedChild(
  api: ApiClient,
  overrides: Record<string, unknown> = {},
): Promise<SeededChild> {
  const name = `E2E Criança ${uniqueSuffix()}`;
  const guardianPhone = uniquePhone();
  const created = await api.post<{ id: string }>('/children', {
    name,
    birthDate: '2018-05-10',
    guardianName: 'Responsável E2E',
    gender: 'F',
    guardianPhone,
    joinedAt: '2026-02-02',
    address: {
      street: 'Rua do Teste',
      number: '10',
      district: 'Centro',
      city: 'Manaus',
      state: 'AM',
      postalCode: '69000000',
      complement: 'Bloco E2E',
    },
    ...overrides,
  });

  return { id: created.id, name, guardianPhone };
}

export async function removeChild(api: ApiClient, child: SeededChild | undefined): Promise<void> {
  if (child) await api.delete(`/children/${child.id}`);
}

export function launchWindow(api: ApiClient): Promise<LaunchWindow> {
  return api.get<LaunchWindow>('/pagelas/launch-window');
}

export async function pagelasOf(api: ApiClient, childId: string): Promise<PagelaRow[]> {
  const page = await api.get<{ data: PagelaRow[] }>('/pagelas/paginated', { childId, page: 1, limit: 50 });
  return page.data;
}

/** A criança como a lista da área do professor a devolve, com as decisões. */
export async function childInList(api: ApiClient, child: SeededChild): Promise<ChildListRow> {
  const page = await api.get<{ data: ChildListRow[] }>('/children/simple', {
    searchString: child.name,
    page: 1,
    limit: 5,
  });
  const found = page.data.find((item) => item.id === child.id);
  if (!found) throw new Error(`criança ${child.name} não apareceu em /children/simple`);
  return found;
}

/** Corpo mínimo de uma pagela válida para hoje. */
export function pagelaBody(childId: string, window: LaunchWindow, extra: Record<string, unknown> = {}) {
  return {
    childId,
    referenceDate: window.today,
    year: window.year,
    week: window.currentWeek,
    present: true,
    didMeditation: false,
    recitedVerse: false,
    ...extra,
  };
}

/** O usuário logado na API, para conferir a autoria gravada. */
export async function currentUser(api: ApiClient): Promise<{ id: string; name: string }> {
  return api.get<{ id: string; name: string }>('/auth/me');
}
