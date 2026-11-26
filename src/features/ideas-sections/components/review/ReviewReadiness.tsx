import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { Box, Stack, Typography } from '@mui/material';

import type { IdeaReviewReadinessProps } from '../../types';

/**
 * O que ainda falta para publicar, em uma lista curta.
 *
 * Fica dentro do cartão de publicação, sempre à vista, para o admin não ter
 * de procurar qual decisão ficou pendente no meio da página.
 */
export default function ReviewReadiness({ items }: IdeaReviewReadinessProps) {
  return (
    <Stack
      component="ul"
      data-testid="idea-review-readiness"
      direction={{ xs: 'column', md: 'row' }}
      useFlexGap
      flexWrap="wrap"
      sx={{ m: 0, p: 0, gap: { xs: 0.75, md: 2 } }}
    >
      {items.map((item) => (
        <Stack
          component="li"
          key={item.label}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ listStyle: 'none' }}
        >
          {item.done ? (
            <CheckCircleRoundedIcon fontSize="small" color="success" aria-label="Pronto" />
          ) : (
            <RadioButtonUncheckedRoundedIcon
              fontSize="small"
              color="disabled"
              aria-label="Pendente"
            />
          )}
          <Typography
            variant="body2"
            color={item.done ? 'text.primary' : 'text.secondary'}
            fontWeight={item.done ? 600 : 400}
          >
            <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
              {item.label}
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              {item.shortLabel}
            </Box>
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
