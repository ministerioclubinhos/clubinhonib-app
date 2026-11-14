import React from 'react';
import type { AlertColor, Theme } from '@mui/material';
import { Cancel, CheckCircle, Info, Warning } from '@mui/icons-material';

import { clubStatusLabel, clubStatusSeverity } from '../utils';

/**
 * O que as duas versões da listagem — cartões no celular, tabela no
 * computador — compartilham.
 *
 * Estavam no mesmo arquivo de 1.020 linhas, e cada uma reimplementava o mesmo
 * mapa de cores e rótulos dentro do próprio ramo do `isMobile`.
 */

/** Converte a severidade vinda da API para as aceitas pelo Alert do MUI. */
const ALERT_SEVERITIES: AlertColor[] = ['error', 'warning', 'info', 'success'];

export const toAlertSeverity = (severity: string | undefined): AlertColor =>
  ALERT_SEVERITIES.includes(severity as AlertColor)
    ? (severity as AlertColor)
    : 'info';

/** Nome do dia como a listagem o mostra. */
export const weekdayNames: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/** Ícone, cor e rótulo de um status; o rótulo vem de `utils.ts`. */
export function statusConfigOf(status: string, theme: Theme) {
  const severity = clubStatusSeverity(status);
  const icones: Record<string, React.ReactElement> = {
    success: <CheckCircle fontSize="small" />,
    warning: <Warning fontSize="small" />,
    error: <Cancel fontSize="small" />,
    info: <Info fontSize="small" />,
  };
  const cor =
    severity === 'success'
      ? theme.palette.success.main
      : severity === 'warning'
        ? theme.palette.warning.main
        : severity === 'error'
          ? theme.palette.error.main
          : theme.palette.info.main;

  return {
    icon: icones[severity],
    color: cor,
    label: clubStatusLabel(status),
    bgcolor: cor + '15',
    borderColor: cor,
  };
}

/** Rótulo da gravidade de um alerta. */
export function severityLabel(severity: string): string {
  const rotulos: Record<string, string> = {
    critical: '🔴 Crítico',
    warning: '⚠️ Aviso',
    info: 'ℹ️ Info',
    success: '✅ Sucesso',
  };

  return rotulos[severity] ?? severity;
}
