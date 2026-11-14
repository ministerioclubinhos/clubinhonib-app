import type { Theme } from '@mui/material';

/**
 * Faixas de cor das listagens de desempenho.
 *
 * Estavam dentro de `ClubsListView`, o que impedia usá-las na versão de
 * celular sem duplicar os limites — e testá-las sem montar a tela.
 */

/** Cor do selo de desempenho, no vocabulário do MUI. */
export function performanceColor(
  score: number,
): 'success' | 'info' | 'warning' | 'default' {
  if (score >= 85) return 'success';
  if (score >= 70) return 'info';
  if (score >= 60) return 'warning';

  return 'default';
}

/**
 * Cor do selo de engajamento de uma criança.
 *
 * As faixas são mais exigentes que as de desempenho de clubinho: a criança é
 * medida pelo próprio histórico, não pela média da turma.
 */
export function engagementColor(
  score: number,
): 'success' | 'info' | 'warning' | 'default' {
  if (score >= 90) return 'success';
  if (score >= 75) return 'info';
  if (score >= 60) return 'warning';

  return 'default';
}

/** Cor da medalha das três primeiras posições; da quarta em diante, cinza. */
export function medalColor(rank: number, theme: Theme): string {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';

  return theme.palette.grey[400];
}

/**
 * Iniciais de um nome, para o avatar.
 *
 * Nome com um só termo usa as duas primeiras letras; sem isso, "Ana" viraria
 * apenas "A" e todos os avatares de nome curto ficariam iguais.
 */
export function nameInitials(name: string): string {
  const partes = name.trim().split(/\s+/).filter(Boolean);

  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  return name.trim().substring(0, 2).toUpperCase();
}
