import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import type { MediaItem } from '@/store/slices/types';

import { IDEAS_MEDIA_KINDS, TOUCH_TARGET, type IdeasMediaKind } from './constants';
import { mediasOfType } from './utils';

interface MediaSectionProps {
  title: string;
  description: string;
  medias: MediaItem[];
  onOpenGallery: (kind: IdeasMediaKind, items: MediaItem[]) => void;
}

/**
 * Uma seção da página de ideias.
 *
 * Cada tipo de mídia é uma linha inteira e tocável que abre a galeria daquele
 * tipo. Antes eram cartões dentro de cartões, com emoji, ícone, rótulo,
 * contagem entre parênteses e a mesma contagem repetida num chip — quatro
 * elementos para dizer "dois vídeos".
 */
export default function MediaSection({
  title,
  description,
  medias,
  onOpenGallery,
}: MediaSectionProps) {
  const kinds = IDEAS_MEDIA_KINDS.map((kind) => ({
    kind,
    items: mediasOfType(medias, kind.mediaType),
  })).filter((entry) => entry.items.length > 0);

  return (
    <Card data-testid="page-view-ideas-material-viewpage-media-section" variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3 }}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
            {description}
          </Typography>
        )}

        {kinds.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            Esta seção ainda não tem materiais.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {kinds.map(({ kind, items }) => (
              <Button
                key={kind.mediaType}
                type="button"
                fullWidth
                color={kind.color}
                onClick={() => onOpenGallery(kind, items)}
                sx={{
                  minHeight: TOUCH_TARGET,
                  justifyContent: 'space-between',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.5,
                  bgcolor: (theme) => theme.palette.action.hover,
                  '&:hover': { bgcolor: (theme) => theme.palette.action.selected },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  {kind.icon}
                  <Typography fontWeight={700} noWrap>
                    {items.length === 1 ? kind.singular : kind.label}
                  </Typography>
                  <Chip label={items.length} size="small" color={kind.color} variant="outlined" />
                </Box>

                <ChevronRightIcon />
              </Button>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
