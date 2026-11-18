import React from 'react';
import { keyframes } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';

/**
 * Movimento dos gráficos: entram aos poucos, sem atrapalhar quem prefere tela
 * parada (`prefers-reduced-motion`) — nesse caso tudo já aparece no valor final.
 */

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

export const MOTION_MS = 800;
export const STAGGER_MS = 70;
export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** `true` quando a pessoa pediu menos movimento no aparelho. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * `true` assim que o elemento aparece na tela (e continua `true`): os gráficos
 * só começam a crescer quando a pessoa chega até eles.
 */
export function useInView<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = React.useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (seen || !node) return;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, seen]);

  return [ref, seen || reduced];
}

/** Número que sobe até o valor final. Sem movimento, mostra o valor direto. */
export const CountUp: React.FC<{ value: number; decimals?: number; format?: (n: number) => string }> = ({
  value,
  decimals = 0,
  format,
}) => {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = React.useState(reduced ? value : 0);

  React.useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / MOTION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  const text = format ? format(shown) : shown.toFixed(decimals).replace('.', ',');
  return (
    <Box component="span" data-testid="statistics-plain-count-up">
      {text}
    </Box>
  );
};
