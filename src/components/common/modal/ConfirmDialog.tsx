import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type ConfirmDialogProps = {
  open: boolean;
  title?: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "inherit";
  confirmVariant?: "contained" | "outlined" | "text";
  cancelVariant?: "text" | "outlined" | "contained";
  onConfirm: () => void | Promise<unknown>;
  onClose: () => void;
  loading?: boolean;
  autoCloseOnConfirm?: boolean;
  disableBackdropClose?: boolean;
  disableEscapeKeyDown?: boolean;
  fullWidth?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  showCloseIcon?: boolean;
  startAdornment?: React.ReactNode;
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
  loading,
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
    if (isLoading) return; 
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
