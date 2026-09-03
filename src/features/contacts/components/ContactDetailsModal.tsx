import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { formatDateTime, formatPhone, whatsappHref } from "../utils";
import type { ContactResponse } from "../types";

type Props = {
  contact: ContactResponse | null;
  onClose: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
};

/** Uma linha de dado do detalhe. */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ color: "text.secondary", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ wordBreak: "break-word" }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export default function ContactDetailsModal({
  contact,
  onClose,
  onToggleRead,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!contact) return null;

  const whatsapp = whatsappHref(contact.phone);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, pb: 1 }}
      >
        <DialogTitle sx={{ p: 0, fontSize: { xs: "1rem", md: "1.15rem" } }}>
          Detalhes do contato
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack spacing={2}>
          <DetailRow icon={<PersonIcon fontSize="small" />} label="Nome">
            <Typography>{contact.name}</Typography>
          </DetailRow>

          <DetailRow icon={<EmailIcon fontSize="small" />} label="E-mail">
            <Link href={`mailto:${contact.email}`} underline="hover">
              {contact.email}
            </Link>
          </DetailRow>

          <DetailRow icon={<PhoneIcon fontSize="small" />} label="Telefone">
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Link href={`tel:${contact.phone}`} underline="hover">
                {formatPhone(contact.phone)}
              </Link>
              {whatsapp ? (
                <Link
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  <WhatsAppIcon fontSize="small" />
                  WhatsApp
                </Link>
              ) : null}
            </Stack>
          </DetailRow>

          <DetailRow icon={<ScheduleIcon fontSize="small" />} label="Recebido em">
            <Typography>{formatDateTime(contact.createdAt)}</Typography>
          </DetailRow>

          <Chip
            size="small"
            label={contact.read ? "Lido" : "Não lido"}
            color={contact.read ? "success" : "warning"}
            sx={{ alignSelf: "flex-start" }}
          />

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Mensagem
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {contact.message}
            </Typography>
          </Box>
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
        <Button onClick={onClose} fullWidth={isMobile}>
          Fechar
        </Button>

        <Button
          onClick={onToggleRead}
          variant="outlined"
          fullWidth={isMobile}
          startIcon={
            contact.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />
          }
        >
          {contact.read ? "Marcar como não lido" : "Marcar como lido"}
        </Button>

        <Button
          onClick={onDelete}
          variant="contained"
          color="error"
          fullWidth={isMobile}
          startIcon={<DeleteIcon />}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
