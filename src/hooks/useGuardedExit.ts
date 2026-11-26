import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface GuardedExit {
  /** Se o diálogo de confirmação está aberto. */
  confirming: boolean;
  /** Pedido de saída: confirma quando há rascunho, sai direto quando não há. */
  requestExit: () => void;
  /** Sai mesmo assim, descartando o rascunho. */
  confirmExit: () => void;
  /** Desiste de sair. */
  cancelExit: () => void;
}

/**
 * Saída de um formulário para a tela de destino, perguntando quando há
 * alteração pendente.
 *
 * Fica em um hook porque os cinco formulários de página precisam do mesmo
 * comportamento, e a versão inline em cada um deles divergiria — foi assim que
 * o aviso de saída nasceu faltando em todos.
 */
export function useGuardedExit(isDirty: boolean, to: string): GuardedExit {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const requestExit = useCallback(() => {
    if (isDirty) {
      setConfirming(true);
      return;
    }
    navigate(to);
  }, [isDirty, navigate, to]);

  const confirmExit = useCallback(() => {
    setConfirming(false);
    navigate(to);
  }, [navigate, to]);

  const cancelExit = useCallback(() => setConfirming(false), []);

  return { confirming, requestExit, confirmExit, cancelExit };
}
