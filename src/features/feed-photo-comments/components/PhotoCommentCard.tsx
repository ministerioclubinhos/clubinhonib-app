import { Alert, Box, Button, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { PHOTO_COMMENTS_TOUCH_TARGET } from '../constants';
import { PhotoCommentStatus, type PhotoCommentCardProps } from '../types';
import { formatPhotoCommentDate } from '../utils';

export function PhotoCommentCard({ comment, onDelete, deleting }: PhotoCommentCardProps) {
  return (
    <Box
      data-testid={`feed-photo-comment-${comment.id}`}
      component="article"
      sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
        {comment.authorName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatPhotoCommentDate(comment.createdAt)}
      </Typography>
      <Typography
        sx={{
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          fontSize: '0.9rem',
          lineHeight: 1.65,
          mt: 1,
        }}
      >
        {comment.text}
      </Typography>
      {'status' in comment && comment.status === PhotoCommentStatus.REJECTED && (
        <Alert
          data-testid={`feed-photo-comment-rejected-${comment.id}`}
          severity="warning"
          sx={{ mt: 2, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
        >
          <Typography component="span" sx={{ fontWeight: 700, display: 'block' }}>
            Comentário reprovado
          </Typography>
          {comment.moderationReason && <>Motivo: {comment.moderationReason}</>}
        </Alert>
      )}
      {onDelete && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            data-testid={`feed-photo-comment-delete-${comment.id}`}
            type="button"
            disabled={deleting}
            onClick={onDelete}
            aria-label="Excluir meu comentário"
            startIcon={<DeleteOutlineRoundedIcon />}
            sx={{
              minHeight: PHOTO_COMMENTS_TOUCH_TARGET,
              minWidth: PHOTO_COMMENTS_TOUCH_TARGET,
              textTransform: 'none',
            }}
          >
            Excluir
          </Button>
        </Box>
      )}
    </Box>
  );
}
