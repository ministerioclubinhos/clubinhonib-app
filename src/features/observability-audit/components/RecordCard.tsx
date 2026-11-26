import type { ReactNode } from 'react';
import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

import type { CardLine, ChipColor } from '../types';

interface RecordCardProps {
  testId: string;
  /** Nome acessível do card inteiro (abre os detalhes). */
  ariaLabel: string;
  /** Linha de cima: data/hora. */
  heading: string;
  chip: { label: string; color: ChipColor };
  /** Destaque do card: mensagem ou ação. */
  title: string;
  lines: CardLine[];
  /** Ids com botão de copiar, fora da área clicável. */
  footer?: ReactNode;
  onSelect: () => void;
}

/**
 * Uma linha da listagem no celular.
 *
 * A tabela larga não cabe em 390 px; o card mostra o que importa para decidir
 * abrir os detalhes, e o toque no card faz isso. O rodapé (ids e copiar) fica
 * fora da área de toque para copiar não abrir o modal.
 */
export default function RecordCard({ testId, ariaLabel, heading, chip, title, lines, footer, onSelect }: RecordCardProps) {
  return (
    <Card data-testid={testId} variant="outlined" sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={onSelect} aria-label={ariaLabel} sx={{ minHeight: 44 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {heading}
            </Typography>
            <Chip size="small" label={chip.label} color={chip.color} />
          </Stack>
          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
            {title}
          </Typography>
          <Stack spacing={0.25} sx={{ mt: 0.75 }}>
            {lines.map((line) => (
              <Typography key={line.label} variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {line.label}:{' '}
                <Typography component="span" variant="caption" color="text.primary" fontFamily={line.monospace ? 'monospace' : undefined}>
                  {line.value}
                </Typography>
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
      {footer && (
        <Stack direction="row" spacing={2} sx={{ px: 1.5, pb: 1, flexWrap: 'wrap' }} useFlexGap>
          {footer}
        </Stack>
      )}
    </Card>
  );
}
