import type { ReactElement } from 'react';
import {
  Block,
  Cancel,
  CheckCircle,
  EventBusy,
  HourglassEmpty,
  RemoveCircleOutline,
  Warning,
} from '@mui/icons-material';
import type { Theme } from '@mui/material';

import { ClubWeekStatus } from '../types';
import { weekStatusSeverity } from '../utils';

/**
 * O ícone de cada situação.
 *
 * Cor sozinha não identifica nada para quem não a distingue — e o quadro é
 * inteiro feito de cor. Cada célula carrega também um ícone e um texto.
 */
export const STATUS_ICONS: Record<ClubWeekStatus, ReactElement> = {
  [ClubWeekStatus.Ok]: <CheckCircle fontSize="inherit" />,
  [ClubWeekStatus.Partial]: <Warning fontSize="inherit" />,
  [ClubWeekStatus.Missing]: <Cancel fontSize="inherit" />,
  [ClubWeekStatus.Pending]: <HourglassEmpty fontSize="inherit" />,
  [ClubWeekStatus.Exception]: <EventBusy fontSize="inherit" />,
  [ClubWeekStatus.Inactive]: <Block fontSize="inherit" />,
  [ClubWeekStatus.OutOfPeriod]: <RemoveCircleOutline fontSize="inherit" />,
};

/** A cor da situação no tema, já resolvida. */
export function statusColor(theme: Theme, status: ClubWeekStatus): string {
  const severity = weekStatusSeverity(status);

  if (severity === 'default') return theme.palette.text.disabled;
  return theme.palette[severity].main;
}
