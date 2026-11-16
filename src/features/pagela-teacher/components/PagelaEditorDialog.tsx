import type { ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import PagelaQuickForm from "./PagelaQuickForm";
import {
  PagelaEditorMode,
  type Pagela,
  type PagelaEditorState,
} from "../types";
import { PAGELA_EDITOR_TEXTS } from "../constants";

type FormProps = ComponentProps<typeof PagelaQuickForm>;

type Props = {
  /** `null` mantém o editor fechado. */
  editor: PagelaEditorState | null;
  childName: string;
  childId: string;
  launchWindow: FormProps["launchWindow"];
  launchLoading: boolean;
  launchError: string;
  findPagela: FormProps["findPagela"];
  onCreate: FormProps["onCreate"];
  onUpdate: FormProps["onUpdate"];
  onEditExisting: (pagela: Pagela) => void;
  onClose: () => void;
};

/**
 * Janela única de criar e editar pagela.
 *
 * Tela cheia no celular, caixa de diálogo no computador. O formulário é
 * remontado a cada pagela (pela `key`), então nunca carrega valores de outra.
 */
export default function PagelaEditorDialog({
  editor,
  childName,
  childId,
  launchWindow,
  launchLoading,
  launchError,
  findPagela,
  onCreate,
  onUpdate,
  onEditExisting,
  onClose,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const editing = editor?.mode === PagelaEditorMode.EDIT;
  const pagela = editor?.mode === PagelaEditorMode.EDIT ? editor.pagela : null;

  return (
    <Dialog
      open={!!editor}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="pagela-editor-title"
      data-testid="pagela-teacher-editor-dialog"
    >
      <DialogTitle
        id="pagela-editor-title"
        sx={{ pr: 7, fontWeight: 900, lineHeight: 1.25 }}
      >
        {editing ? PAGELA_EDITOR_TEXTS.editTitle : PAGELA_EDITOR_TEXTS.createTitle}
        <br />
        <span style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.75 }}>
          {childName || "—"}
        </span>
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, width: 44, height: 44 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "8px !important" }}>
        {editor && (
          <PagelaQuickForm
            key={pagela?.id ?? "new"}
            mode={editor.mode}
            initial={pagela}
            childId={childId}
            launchWindow={launchWindow}
            launchLoading={launchLoading}
            launchError={launchError}
            findPagela={findPagela}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDone={onClose}
            onEditExisting={onEditExisting}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
