import { alpha, Box, Button, Chip, Paper, Stack, Typography, useTheme } from '@mui/material';
import type { LessonCommentsPanelProps } from '../types';

export function LessonCommentsPanel({
  comments,
  title,
  'data-testid': testId,
  onResolve,
  resolvingId = null,
}: LessonCommentsPanelProps) {
  const theme = useTheme();
  if (!comments.length) return null;
  const open = comments.filter((comment) => !comment.isResolved).length;
  return (
    <Paper
      data-testid={testId}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.warning.main, 0.04),
        borderColor: alpha(theme.palette.warning.main, 0.3),
      }}
    >
      <Typography variant="subtitle2" component="h3" fontWeight={800} sx={{ mb: 1 }}>
        {title} ({open} em aberto de {comments.length})
      </Typography>
      <Stack spacing={1.25} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {comments.map((comment) => (
          <Box
            component="li"
            key={comment.id}
            data-testid={`${testId}-item-${comment.id}`}
            data-resolved={comment.isResolved}
          >
            <Typography
              variant="body2"
              color={comment.isResolved ? 'text.secondary' : 'text.primary'}
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {comment.commentText}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {comment.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Registrado em {new Date(comment.createdAt).toLocaleString('pt-BR')}
                </Typography>
              )}
              {comment.isResolved ? (
                <Chip size="small" color="success" variant="outlined" label="Resolvida" />
              ) : (
                onResolve && (
                  <Button
                    data-testid={`${testId}-resolve-${comment.id}`}
                    size="small"
                    disabled={resolvingId === comment.id}
                    onClick={() => onResolve(comment.id)}
                    sx={{ minHeight: 44, textTransform: 'none' }}
                  >
                    {resolvingId === comment.id ? 'Marcando…' : 'Marcar como resolvida'}
                  </Button>
                )
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
