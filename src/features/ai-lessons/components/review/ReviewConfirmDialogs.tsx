import { Typography } from '@mui/material';
import ConfirmDialog from '@/components/common/modal/ConfirmDialog';
import type { ReviewConfirmDialogsProps } from '../../review.types';

/** Confirmations for the actions that change the published material. */
export function ReviewConfirmDialogs({
  currentWeekOpen,
  onConfirmCurrentWeek,
  onCloseCurrentWeek,
  archiveOpen,
  onConfirmArchive,
  onCloseArchive,
}: ReviewConfirmDialogsProps) {
  return (
    <>
      <ConfirmDialog
        data-testid="ai-lesson-current-week-confirm-dialog"
        open={currentWeekOpen}
        title="Definir como semana atual?"
        confirmText="Definir como semana atual"
        onConfirm={onConfirmCurrentWeek}
        onClose={onCloseCurrentWeek}
        autoCloseOnConfirm={false}
      >
        <Typography variant="body2">
          Este material passa a ser o material da semana atual e substitui o que está definido
          hoje. O material anterior continua publicado em Materiais Semanais, apenas deixa de ser o
          da semana.
        </Typography>
      </ConfirmDialog>

      <ConfirmDialog
        data-testid="ai-lesson-archive-confirm-dialog"
        open={archiveOpen}
        title="Arquivar esta lição?"
        confirmText="Arquivar"
        onConfirm={onConfirmArchive}
        onClose={onCloseArchive}
        autoCloseOnConfirm={false}
      >
        <Typography variant="body2">
          A lição sai das listas ativas do Estúdio. O material já publicado em Materiais Semanais
          não é alterado, e a lição pode ser restaurada depois.
        </Typography>
      </ConfirmDialog>
    </>
  );
}
