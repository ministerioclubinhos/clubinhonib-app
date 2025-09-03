// src/components/common/ConfirmDialog.tsx
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type ConfirmDialogProps = {
  open: boolean;

  /** Título do diálogo */
  title?: React.ReactNode;

  /** Conteúdo do corpo (texto ou nó React). Use para mensagens simples. */
  content?: React.ReactNode;

  /** Alternativa ao `content` para render custom do corpo */
  children?: React.ReactNode;

  /** Texto dos botões */
  confirmText?: string;
  cancelText?: string;

  /** Aparência do botão confirmar */
  confirmColor?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "inherit";
  confirmVariant?: "contained" | "outlined" | "text";
  cancelVariant?: "text" | "outlined" | "contained";

  /** Ações */
  onConfirm: () => void | Promise<unknown>;
  onClose: () => void;

  /** Loading controlado externamente (opcional). Se omitido e `onConfirm` retornar Promise, ativa loading interno automático */
  loading?: boolean;

  /** Fecha automaticamente após `onConfirm` (quando resolve). Padrão: true */
  autoCloseOnConfirm?: boolean;

  /** Opções de fechamento */
  disableBackdropClose?: boolean;
  disableEscapeKeyDown?: boolean;

  /** Layout */
  fullWidth?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  showCloseIcon?: boolean;

  /** Ícone opcional à esquerda do título */
  startAdornment?: React.ReactNode;

  /** Estilos extras nos wrappers */
  titleSx?: any;
  contentSx?: any;
  actionsSx?: any;
};

export default function ConfirmDialog({
  open,
  title,
  content,
  children,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "primary",
  confirmVariant = "contained",
  cancelVariant = "text",
  onConfirm,
  onClose,
  loading, // opcional (controlado)
  autoCloseOnConfirm = true,
  disableBackdropClose,
  disableEscapeKeyDown,
  fullWidth = true,
  maxWidth = "xs",
  showCloseIcon = true,
  startAdornment,
  titleSx,
  contentSx,
  actionsSx,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);

  const isLoading = loading ?? internalLoading;

  const handleClose = (_: any, reason?: "backdropClick" | "escapeKeyDown") => {
    if (isLoading) return; // evita fechar durante loading
    if (disableBackdropClose && reason === "backdropClick") return;
    if (disableEscapeKeyDown && reason === "escapeKeyDown") return;
    onClose();
  };

  const handleConfirm = async () => {
    try {
      const result = onConfirm?.();
      const isPromise = result && typeof (result as any).then === "function";
      if (loading === undefined && isPromise) {
        setInternalLoading(true);
        await (result as Promise<unknown>);
        setInternalLoading(false);
        if (autoCloseOnConfirm) onClose();
      } else if (autoCloseOnConfirm && !isPromise) {
        onClose();
      }
    } catch {
      // mantém aberto para o caller tratar erro (mensagem externa)
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      {!!title && (
        <DialogTitle sx={{ pr: showCloseIcon ? 6 : 3, ...titleSx }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {startAdornment}
            <Typography variant="h6" component="div">{title}</Typography>
          </Box>

          {showCloseIcon && (
            <IconButton
              aria-label="Fechar"
              onClick={onClose}
              edge="end"
              disabled={isLoading}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {(content || children) && (
        <DialogContent sx={{ pt: title ? 1 : 2, ...contentSx }}>
          {content ? (
            typeof content === "string"
              ? <Typography>{content}</Typography>
              : content
          ) : children}
        </DialogContent>
      )}

      <DialogActions sx={{ justifyContent: "flex-end", gap: 1, ...actionsSx }}>
        <Button
          onClick={onClose}
          variant={cancelVariant}
          disabled={isLoading}
          sx={{ color: cancelVariant === "text" ? "#757575" : undefined }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={handleConfirm}
          color={confirmColor}
          variant={confirmVariant}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} /> : null}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
