import ConfirmDialog from './ConfirmDialog';
import { UNSAVED_CHANGES_COPY } from './constants';

interface UnsavedChangesDialogProps {
  open: boolean;
  /** Fica na tela e continua editando. */
  onStay: () => void;
  /** Sai mesmo assim, descartando o rascunho. */
  onLeave: () => void;
}

/**
 * Confirmação de saída com edição pendente.
 *
 * O texto fica em um só lugar porque o aviso aparece por dois caminhos — o
 * menu do painel e o botão de voltar do próprio formulário — e dois textos
 * diferentes para a mesma perda seriam duas promessas diferentes.
 */
export default function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog data-testid="modal-unsaved-changes-dialog"
      open={open}
      title={UNSAVED_CHANGES_COPY.title}
      content={UNSAVED_CHANGES_COPY.content}
      confirmText={UNSAVED_CHANGES_COPY.confirm}
      cancelText={UNSAVED_CHANGES_COPY.cancel}
      confirmColor="error"
      onConfirm={onLeave}
      onClose={onStay}
      showCloseIcon={false}
    />
  );
}
