import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack,
  Link,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  PersonOutline,
  SchoolOutlined,
  PlaceOutlined,
  MapOutlined,
} from "@mui/icons-material";
import { fmtDate } from "@/utils/dates";
import { CopyButton, initials } from "@/utils/components";
import { formatPhone } from "@/utils/phone";

import {
  CLUB_VIEW_TEACHERS_BEFORE_SCROLL,
  CLUB_VIEW_TEACHERS_MAX_HEIGHT,
  EMPTY_VALUE,
} from "../constants";
import {
  formatClubAddress,
  formatClubTime,
  formatUserLabel,
  formatWeekday,
} from "../utils";
import type { ClubAddress, ClubResponse, ClubUserMini } from "../types";

type Props = {
  open: boolean;
  loading: boolean;
  club: ClubResponse | null;
  onClose: () => void;
};

/**
 * Uma seção do modal.
 *
 * Empilha em qualquer largura: o modal é lido no celular, em pé, por quem está
 * a caminho do clubinho. Duas colunas espremiam o endereço e os telefones em
 * linhas de três palavras.
 */
function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      data-testid="clubs-club-view-dialog-section"
      variant="outlined"
      sx={{ p: 1.75, borderRadius: 2 }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ display: "flex", color: "text.secondary" }}>{icon}</Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ lineHeight: 1.4, letterSpacing: 0.6 }}
          >
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

/**
 * Uma pessoa ligada ao clubinho, com o contato à mão.
 *
 * Coordenação e professores mostravam blocos diferentes para a mesma coisa —
 * nome, telefone, botão de copiar — em `Stack` com `flexWrap`, que no celular
 * quebrava o telefone para a linha de baixo e deixava o botão órfão. Aqui é uma
 * linha só: avatar de largura fixa, texto que encolhe, ação na ponta.
 */
function ContactRow({
  user,
  fallbackLabel,
}: {
  user?: ClubUserMini | null;
  fallbackLabel: string;
}) {
  const name = formatUserLabel(user);
  const phone = user?.phone?.trim();

  return (
    <Stack
      data-testid="clubs-club-view-dialog-contact"
      direction="row"
      spacing={1.25}
      alignItems="center"
    >
      <Avatar sx={{ width: 36, height: 36, fontSize: "0.8rem" }}>
        {initials(name === EMPTY_VALUE ? fallbackLabel : name)}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight={600} noWrap title={name}>
          {name}
        </Typography>
        {phone ? (
          <Link
            href={`tel:${phone}`}
            underline="hover"
            variant="body2"
            sx={{ display: "inline-block" }}
          >
            {formatPhone(phone)}
          </Link>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sem telefone
          </Typography>
        )}
      </Box>

      {phone && <CopyButton value={phone} title="Copiar telefone" />}
    </Stack>
  );
}

/** Link do endereço no mapa, para quem está indo até o clubinho. */
function mapsLink(address: ClubAddress): string {
  const query = encodeURIComponent(formatClubAddress(address));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function ClubViewDialog({ open, loading, club, onClose }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const address = club?.address;
  const teachers = club?.teachers ?? [];
  const hasAddress =
    !!address && formatClubAddress(address) !== EMPTY_VALUE;

  return (
    <Dialog
      data-testid="clubs-club-view-dialog"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isXs}
      aria-labelledby="club-view-title"
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      {/*
        O cabeçalho carrega a identidade do clubinho e nada mais. Antes ele
        repetia dia, horário e número em chips, e o corpo repetia os mesmos
        quatro dados logo abaixo em cartões — a pessoa lia tudo duas vezes antes
        de chegar ao endereço.
      */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          background:
            "linear-gradient(135deg, rgba(76,175,80,.10) 0%, rgba(2,136,209,.10) 100%)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {!club ? (
          <Typography id="club-view-title" variant="h6" fontWeight={800}>
            Detalhes do Clubinho
          </Typography>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "success.main",
                color: "success.contrastText",
                fontWeight: 700,
              }}
              aria-label="avatar do clubinho"
            >
              {club.number}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                id="club-view-title"
                variant="h6"
                fontWeight={800}
                noWrap
                title={`Clubinho ${club.number}`}
              >
                Clubinho {club.number}
              </Typography>
              <Chip
                size="small"
                sx={{ mt: 0.5 }}
                label={club.isActive ? "Ativo" : "Inativo"}
                color={club.isActive ? "success" : "default"}
                variant={club.isActive ? "filled" : "outlined"}
              />
            </Box>
          </Stack>
        )}
      </Box>

      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {loading && !club && (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={84} />
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={96} />
          </Stack>
        )}

        {!loading && !club && (
          <Typography variant="body1" color="text.secondary">
            Nenhum clubinho selecionado.
          </Typography>
        )}

        {club && (
          <Stack spacing={1.5}>
            {/* Quando e onde vêm primeiro: é o que se abre o modal para ver. */}
            <Section icon={<CalendarToday fontSize="small" />} title="Quando">
              <Typography fontWeight={700} sx={{ fontSize: "1.05rem" }}>
                {formatWeekday(club.weekday)}
                <Box component="span" sx={{ color: "text.secondary", mx: 0.75 }}>
                  ·
                </Box>
                {formatClubTime(club.time)}
              </Typography>
            </Section>

            <Section
              icon={<PlaceOutlined fontSize="small" />}
              title="Onde"
              action={
                hasAddress && (
                  <Stack direction="row" spacing={0.25} alignItems="center">
                    <CopyButton
                      value={formatClubAddress(address)}
                      title="Copiar endereço"
                    />
                    <Tooltip title="Abrir no mapa">
                      <IconButton
                        component="a"
                        href={mapsLink(address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        aria-label="Abrir endereço no mapa"
                      >
                        <MapOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )
              }
            >
              {hasAddress ? (
                <Box>
                  <Typography fontWeight={600}>
                    {[address.street, address.number]
                      .filter(Boolean)
                      .join(", ") || EMPTY_VALUE}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[
                      address.district,
                      [address.city, address.state].filter(Boolean).join(" - "),
                      address.postalCode && `CEP ${address.postalCode}`,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Endereço não informado
                </Typography>
              )}
            </Section>

            <Section icon={<PersonOutline fontSize="small" />} title="Coordenação">
              {club.coordinator ? (
                <ContactRow
                  user={club.coordinator.user}
                  fallbackLabel="Coordenação"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum coordenador vinculado
                </Typography>
              )}
            </Section>

            <Section
              icon={<SchoolOutlined fontSize="small" />}
              title={`Professores (${teachers.length})`}
            >
              {teachers.length > 0 ? (
                <Stack
                  divider={<Divider flexItem sx={{ my: 0.25 }} />}
                  spacing={1.25}
                  sx={
                    // A quarta linha aparece cortada de propósito: é o que
                    // mostra que a lista continua.
                    teachers.length > CLUB_VIEW_TEACHERS_BEFORE_SCROLL
                      ? {
                          maxHeight: CLUB_VIEW_TEACHERS_MAX_HEIGHT,
                          overflowY: "auto",
                          pr: 0.5,
                          overscrollBehavior: "contain",
                        }
                      : undefined
                  }
                >
                  {teachers.map((teacher) => (
                    <ContactRow
                      key={teacher.id}
                      user={teacher.user}
                      fallbackLabel="Professor"
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum professor vinculado
                </Typography>
              )}
            </Section>
          </Stack>
        )}
      </DialogContent>

      {/*
        No celular o botão ocupa a largura toda e fica no alcance do polegar; a
        data de atualização é metadado e vai discreta, sem disputar espaço com
        as seções.
      */}
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: { xs: "center", sm: "left" } }}
        >
          {club ? `Atualizado em ${fmtDate(club.updatedAt)}` : ""}
        </Typography>
        <Button
          fullWidth={isXs}
          size={isXs ? "large" : "medium"}
          onClick={onClose}
          variant="contained"
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
