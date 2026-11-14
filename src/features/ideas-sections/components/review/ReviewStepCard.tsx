import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface ReviewStepCardProps {
  /** Número exibido no marcador; é a ordem da etapa na revisão. */
  step: number;
  title: string;
  description?: string;
  /** Ação principal da etapa, alinhada ao título. */
  action?: ReactNode;
  children: ReactNode;
  testId?: string;
  sx?: SxProps<Theme>;
}

/**
 * Um passo da revisão.
 *
 * A tela inteira é uma sequência numerada: sem ela, a mesma ideia aparecia em
 * blocos soltos (comparação, ajustes, materiais, publicação) sem indicar qual
 * vinha antes nem qual decidia o quê.
 */
export default function ReviewStepCard({
  step,
  title,
  description,
  action,
  children,
  testId,
  sx,
}: ReviewStepCardProps) {
  return (
    <Paper
      data-testid={testId}
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        minWidth: 0,
        ...sx,
      }}
    >
      <Stack spacing={{ xs: 2, md: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'flex-start' }}
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 32,
                height: 32,
                mt: 0.25,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {step}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" variant="h6" fontWeight={800}>
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          {action ? (
            <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{action}</Box>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
