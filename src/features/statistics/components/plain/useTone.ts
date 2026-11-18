import { alpha, useTheme } from '@mui/material';
import { Tone } from '../../constants';

export interface ToneStyle {
  /** A cor forte: barras, ícones, números. */
  main: string;
  /** O fundo suave. */
  soft: string;
  /** A borda e o fio de destaque. */
  border: string;
  /** Texto escuro legível sobre o fundo suave. */
  text: string;
}

/** As cores de cada tom, tiradas do tema (e portanto certas no claro e no escuro). */
export function useTone(tone: Tone): ToneStyle {
  const { palette } = useTheme();

  const base = {
    [Tone.Success]: palette.success,
    [Tone.Warning]: palette.warning,
    [Tone.Error]: palette.error,
    [Tone.Info]: palette.info,
    [Tone.Neutral]: palette.primary,
  }[tone];

  if (tone === Tone.Neutral) {
    return {
      main: palette.text.secondary,
      soft: alpha(palette.text.primary, 0.04),
      border: palette.divider,
      text: palette.text.primary,
    };
  }

  return {
    main: base.main,
    soft: alpha(base.main, palette.mode === 'dark' ? 0.16 : 0.09),
    border: alpha(base.main, 0.55),
    text: palette.mode === 'dark' ? base.light : base.dark,
  };
}
