import React from "react";
import { IconButton, Tooltip } from "@mui/material";

type Props = {
  /** Vira o rótulo acessível e a dica; o ícone sozinho não diz o que faz. */
  label: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

/**
 * Ação de um card da listagem.
 *
 * O clique não sobe para o card — que abre os detalhes —, e o `span` mantém a
 * dica funcionando quando o botão está desabilitado.
 */
export default function CardActionButton({
  label,
  color = "default",
  disabled,
  onClick,
  children,
}: Props) {
  return (
    <Tooltip data-testid="listing-card-action-button" title={label}>
      <span>
        <IconButton
          size="small"
          type="button"
          color={color}
          disabled={disabled}
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
