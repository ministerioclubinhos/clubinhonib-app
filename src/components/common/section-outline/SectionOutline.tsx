import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { LockOutlined, Public } from '@mui/icons-material';

import type { SectionOutlineProps } from './types';

/**
 * Índice das seções de uma página de conteúdo: leva direto a uma delas sem
 * rolar a página inteira. Compartilhado pelos editores de ideias e galeria.
 */
export default function SectionOutline({ items, onSelect }: SectionOutlineProps) {
  if (!items.length) return null;
  return (
    <Box
      component="nav"
      data-testid="section-outline"
      aria-label="Índice das seções"
      sx={{ maxHeight: { lg: 'calc(100vh - 360px)' }, overflowY: 'auto', mx: -0.5 }}
    >
      <Stack component="ol" spacing={0.25} sx={{ listStyle: 'none', m: 0, p: 0.5 }}>
        {items.map((item) => (
          <li key={item.key}>
            <ButtonBase
              data-testid="section-outline-item"
              onClick={() => onSelect(item.key)}
              sx={{
                width: '100%',
                minHeight: 44,
                px: 1,
                gap: 1,
                borderRadius: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                {item.index + 1}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{ flex: 1, minWidth: 0, fontWeight: item.hasError ? 700 : 400 }}
                color={item.hasError ? 'error' : 'text.primary'}
              >
                {item.title.trim() || `Seção ${item.index + 1}`}
              </Typography>
              {item.hasDraft && <Chip size="small" color="warning" label="Em edição" />}
              {item.hasError && <Chip size="small" color="error" label="Revisar" />}
              {item.public ? (
                <Public fontSize="inherit" color="success" titleAccess="Pública" />
              ) : (
                <LockOutlined fontSize="inherit" color="disabled" titleAccess="Restrita" />
              )}
            </ButtonBase>
          </li>
        ))}
      </Stack>
    </Box>
  );
}
