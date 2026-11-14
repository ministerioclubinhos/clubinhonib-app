import { Alert, AlertTitle, Button } from '@mui/material';

import { extractErrorMessage } from '@/utils/apiError';

interface ChartErrorProps {
  /** O que não carregou, na voz da tela: "os dados demográficos". */
  subject: string;
  error?: unknown;
  /** Quando informado, oferece o botão de nova tentativa. */
  onRetry?: () => void;
}

/**
 * A falha de um gráfico, com saída.
 *
 * Antes cada gráfico resolvia isso com um `<Typography color="error">Erro ao
 * carregar…</Typography>`: sem causa, sem botão, sem nada a fazer além de
 * recarregar a página inteira. Aqui a mensagem que a API devolveu aparece e a
 * nova tentativa é um clique — a mesma régua que o `ListingLayout` já aplica
 * nas listagens do painel.
 *
 * Renderiza só o alerta, sem contêiner próprio: cada gráfico já tem o seu, e
 * um `Paper` dentro de outro só empilharia bordas.
 */
export function ChartError({ subject, error, onRetry }: ChartErrorProps) {
  return (
    <Alert
      data-testid="statistics-chart-error"
      severity="error"
      action={
        onRetry && (
          <Button type="button" color="inherit" size="small" onClick={onRetry}>
            Tentar de novo
          </Button>
        )
      }
    >
      <AlertTitle>Não foi possível carregar {subject}</AlertTitle>
      {extractErrorMessage(error, 'Tente novamente em instantes.')}
    </Alert>
  );
}
