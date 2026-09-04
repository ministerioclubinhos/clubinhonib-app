import api from "@/config/axiosConfig";

import { EMAIL_PREFERENCES_ENDPOINT } from "./constants";
import type { EmailPreferencesResponse } from "./types";

/**
 * Tira a pessoa da lista de avisos.
 *
 * É `POST`, e não `GET`: os provedores de e-mail abrem os links das mensagens
 * para checagem antes de a pessoa clicar, e um `GET` que já cancela
 * descadastraria quem nunca tocou no link.
 */
export async function apiUnsubscribeFromNotices(
  token: string,
): Promise<EmailPreferencesResponse> {
  const { data } = await api.post<EmailPreferencesResponse>(
    `${EMAIL_PREFERENCES_ENDPOINT}/unsubscribe`,
    { token },
    // A pessoa não está logada, e a falha é mostrada na própria página.
    { skipGlobalError: true },
  );

  return data;
}
