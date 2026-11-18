import { useCallback, useState } from "react";

import { extractErrorMessage } from "@/utils/apiError";

import { apiUnsubscribeFromNotices } from "./api";
import type { UnsubscribeStatus } from "./types";

/**
 * O descadastro dos avisos.
 *
 * A chamada só sai quando a pessoa confirma na tela: os provedores de e-mail
 * abrem os links das mensagens antes de alguém clicar, e descadastrar na
 * abertura tiraria da lista quem nunca tocou no link.
 */
export function useUnsubscribeFromNotices(token: string | null) {
  const [status, setStatus] = useState<UnsubscribeStatus>("idle");
  const [message, setMessage] = useState("");

  const unsubscribe = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("Link de descadastro inválido ou incompleto.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await apiUnsubscribeFromNotices(token);
      setStatus("done");
      setMessage(result.message);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(
        extractErrorMessage(
          err,
          "Não foi possível concluir o descadastro. Tente novamente.",
        ),
      );
    }
  }, [token]);

  return { status, message, unsubscribe };
}
