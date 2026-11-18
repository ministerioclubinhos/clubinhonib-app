import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export type ReviewAccent = 'primary' | 'secondary' | 'warning' | 'success';

interface ReviewSectionCardProps {
  /** Cor da seção: faixa no topo e bloco do ícone. */
  accent?: ReviewAccent;
  /** Ícone da seção, mostrado num bloco colorido ao lado do título. */
  icon: ReactNode;
  title: string;
  description?: string;
  /** Elemento à direita do título (chip de estado, botão). */
  action?: ReactNode;
  children: ReactNode;
  testId?: string;
  sx?: SxProps<Theme>;
}

/**
 * Uma seção da revisão: cartão limpo, com ícone e título.
 *
 * A revisão deixou de ser uma sequência numerada: o estado de cada decisão
 * aparece na lista de prontidão do cartão de publicação, que fica sempre à
 * vista, e as seções só agrupam o conteúdo.
 */
export default function ReviewSectionCard({
  accent = 'primary',
  icon,
  title,
  description,
  action,
  children,
  testId,
  sx,
}: ReviewSectionCardProps) {
  return (
    <Paper
      data-testid={testId}
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 3 },
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        borderTop: 4,
        borderTopColor: `${accent}.main`,
        minWidth: 0,
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)',
        ...sx,
      }}
    >
      <Stack spacing={{ xs: 2, md: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              aria-hidden
              sx={(theme) => ({
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: `${accent}.main`,
                bgcolor: alpha(theme.palette[accent].main, 0.12),
              })}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h2"
                variant="h6"
                fontWeight={800}
                sx={{ lineHeight: 1.25, fontSize: { xs: 17, md: 19 }, color: 'text.primary' }}
              >
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
