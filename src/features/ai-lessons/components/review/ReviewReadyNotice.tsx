import { Alert, Button } from '@mui/material';
import { Send as PublishIcon } from '@mui/icons-material';
import type { ReviewReadyNoticeProps } from '../../review.types';

/** Call to action shown once every item is approved. */
export function ReviewReadyNotice({ isSpecial, disabled, onPublish, buttonRef }: ReviewReadyNoticeProps) {
  return (
    <Alert
      data-testid="ai-lesson-review-ready-notice"
      severity="success"
      variant="filled"
      sx={{ borderRadius: 3 }}
      action={
        <Button
          color="inherit"
          size="small"
          startIcon={<PublishIcon />}
          onClick={onPublish}
          data-testid="ai-lesson-review-publish-now"
          ref={buttonRef}
          disabled={disabled}
          sx={{ fontWeight: 800, minHeight: 44 }}
        >
          Publicar Agora
        </Button>
      }
    >
      Todos os itens foram aprovados!{' '}
      {isSpecial
        ? 'O Material Especial está pronto para ser publicado em Materiais Semanais.'
        : 'A lição está pronta para ir ao Materiais Semanais.'}
    </Alert>
  );
}
