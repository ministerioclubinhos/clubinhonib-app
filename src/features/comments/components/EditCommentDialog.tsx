import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  COMMENT_CLUBINHO_MAX_LENGTH,
  COMMENT_NAME_MAX_LENGTH,
  COMMENT_NEIGHBORHOOD_MAX_LENGTH,
  COMMENT_TEXT_MAX_LENGTH,
} from "../constants";
import type { CommentFormErrors, CommentFormValues } from "../types";

type Props = {
  open: boolean;
  value: CommentFormValues;
  onChange: (value: CommentFormValues) => void;
  errors: CommentFormErrors;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onSave: () => void;
};

/** Campos do formulário, com o limite que a API aceita em cada um. */
const FIELDS = [
  { id: "name", label: "Nome", maxLength: COMMENT_NAME_MAX_LENGTH, multiline: false },
  { id: "clubinho", label: "Clubinho", maxLength: COMMENT_CLUBINHO_MAX_LENGTH, multiline: false },
  { id: "neighborhood", label: "Bairro", maxLength: COMMENT_NEIGHBORHOOD_MAX_LENGTH, multiline: false },
  { id: "comment", label: "Comentário", maxLength: COMMENT_TEXT_MAX_LENGTH, multiline: true },
] as const;

export default function EditCommentDialog({
  open,
  value,
  onChange,
  errors,
  loading,
  error,
  onCancel,
  onSave,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <Dialog data-testid="comments-edit-comment-dialog"
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
    >
      <DialogTitle>Editar comentário</DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {FIELDS.map((field) => (
            <TextField
              key={field.id}
              fullWidth
              required
              label={field.label}
              value={value[field.id]}
              error={errors[field.id]}
              helperText={errors[field.id] ? "Campo obrigatório." : undefined}
              multiline={field.multiline}
              minRows={field.multiline ? 4 : undefined}
              slotProps={{ htmlInput: { maxLength: field.maxLength } }}
              onChange={(event) =>
                onChange({ ...value, [field.id]: event.target.value })
              }
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button onClick={onCancel} fullWidth={isMobile}>
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={loading || hasErrors}
          fullWidth={isMobile}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
