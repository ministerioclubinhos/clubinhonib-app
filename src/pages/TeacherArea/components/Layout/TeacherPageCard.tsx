import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';

interface Props {
  icon: React.ReactNode;
  accent: string;
  title: string;
  subtitle?: string;
  count?: number;
  /** Slot à direita do cabeçalho (busca, botões). No mobile desce para baixo do título. */
  actions?: React.ReactNode;
  testId?: string;
  children: React.ReactNode;
}

/**
 * Casca única de todas as subpáginas da Área do Professor: mesmo card, mesma
 * faixa de cor no topo, mesmo cabeçalho (ícone + título + contador + subtítulo
 * + ações) e mesmo espaçamento. Só o conteúdo muda de uma página para outra.
 */
const TeacherPageCard: React.FC<Props> = ({
  icon,
  accent,
  title,
  subtitle,
  count,
  actions,
  testId,
  children,
}) => (
  <Paper
    data-testid={testId}
    elevation={0}
    sx={{
      p: { xs: 2, sm: 2.5, md: 3 },
      border: '1px solid #e2e8f0',
      borderTop: `4px solid ${accent}`,
      backgroundColor: '#ffffff',
      borderRadius: 3.5,
      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: `${accent}14`,
            color: accent,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              component="h1"
              variant="h6"
              fontWeight={800}
              color="#0f172a"
              sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            {count !== undefined && (
              <Chip
                size="small"
                label={count}
                sx={{ bgcolor: `${accent}18`, color: accent, fontWeight: 700, height: 22 }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {actions}
    </Box>
    {children}
  </Paper>
);

export default TeacherPageCard;
