import { useTheme } from '@mui/material';
import { RateTone } from '../../constants';

/** As cores de uma série: sempre as do tema, nunca soltas no componente. */
export function useChartPalette(): string[] {
  const { palette } = useTheme();
  return [palette.primary.main, palette.secondary.main, palette.success.main, palette.warning.main, palette.info.main, palette.error.main];
}

/** Verde, amarelo ou vermelho para a leitura da presença; azul quando não há leitura. */
export function useToneColor(): (tone: RateTone | undefined) => string {
  const { palette } = useTheme();
  return (tone) =>
    tone === RateTone.Good
      ? palette.success.main
      : tone === RateTone.Medium
        ? palette.warning.main
        : tone === RateTone.Low
          ? palette.error.main
          : palette.primary.main;
}
