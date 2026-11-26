import { formatPhone, hasAcceptedChrist } from "@/features/children/utils";
import * as React from "react";
import {
  Card, CardActionArea, Stack, Typography, Box, Avatar, Tooltip, IconButton,
  Chip, Divider, Button, useTheme,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { ChildListItem } from "@/features/children/types";
import DecisionModal from "./DecisionModal";
import { FEATURE } from "@/features/feature-flags";
import { useFeatureEnabled } from "@/hooks";

const ACTION_SX = { width: 44, height: 44 } as const;

function genderPastel(seed: string, gender: string | undefined) {
  const hash = Array.from(seed).reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) % 1000, 7);
  const t = hash / 1000;
  const g = (gender || "").toUpperCase();
  const h = g === "F" ? (310 + t * 70) % 360 : 190 + t * 40;
  const s = 70, l = 85;
  return {
    solid: `hsl(${h} ${s}% ${l - 15}%)`,
    soft: `hsl(${(h + 12) % 360} ${s}% ${l}%)`,
  };
}

type ChildCardProps = {
  child: ChildListItem;
  onClick: (c: ChildListItem) => void;
  onViewDetails?: (c: ChildListItem) => void;
  onEdit?: (c: ChildListItem) => void;
  onDelete?: (c: ChildListItem) => void;
  onRefresh?: () => void;
  onToggleActive?: (c: ChildListItem) => void;
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Stack data-testid="pagela-teacher-child-info-row" direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Box sx={{ display: "flex", color: "text.secondary", opacity: 0.8 }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary" noWrap title={value} sx={{ minWidth: 0 }}>
        {label}: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{value}</Box>
      </Typography>
    </Stack>
  );
}

export default function ChildCard({
  child,
  onClick,
  onViewDetails,
  onEdit,
  onDelete,
  onRefresh,
  onToggleActive,
}: ChildCardProps) {
  const theme = useTheme();
  const colors = genderPastel(child.name || child.id, child.gender);
  const initials = React.useMemo(() => {
    const parts = (child.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  }, [child.name]);

  const alreadyAccepted = hasAcceptedChrist(child.acceptedChrists);
  const [modalOpen, setModalOpen] = React.useState(false);
  const canRegisterDecision = useFeatureEnabled(FEATURE.ACCEPTED_CHRISTS);
  const isLight = theme.palette.mode === "light";

  return (
    <>
      <Card
        data-testid="pagela-teacher-child-card"
        variant="outlined"
        sx={{
          borderRadius: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderColor: "divider",
          opacity: child.isActive ? 1 : 0.78,
          transition: "transform .12s ease, box-shadow .12s ease",
          "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
        }}
      >
        {/* Faixa de cor: identifica a criança sem ocupar espaço. */}
        <Box sx={{ height: 6, background: `linear-gradient(90deg, ${colors.soft}, ${colors.solid})` }} />

        <CardActionArea
          onClick={() => onClick(child)}
          sx={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: 1.5, p: 1.5 }}
        >
          <Avatar sx={{ width: 52, height: 52, bgcolor: colors.solid, color: "#143a2b", fontWeight: 900, flexShrink: 0 }}>
            {initials || <ChildCareIcon />}
          </Avatar>

          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Typography fontWeight={900} noWrap title={child.name} sx={{ flex: 1, minWidth: 0 }}>
                {child.name}
              </Typography>
              <ChevronRightIcon sx={{ color: "text.disabled", flexShrink: 0 }} />
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={child.isActive ? "Ativa" : "Desativada"}
                color={child.isActive ? "success" : "default"}
                variant={child.isActive ? "filled" : "outlined"}
                sx={{ fontWeight: 700 }}
              />
              {alreadyAccepted && (
                <Chip
                  size="small"
                  icon={<FavoriteIcon />}
                  label="Aceitou Jesus"
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>

            <InfoRow icon={<FamilyRestroomIcon fontSize="small" />} label="Resp." value={child.guardianName || "—"} />
            <InfoRow
              icon={<PhoneIcon fontSize="small" />}
              label="Tel."
              value={child.guardianPhone ? formatPhone(child.guardianPhone) : "—"}
            />
          </Stack>
        </CardActionArea>

        {!!onViewDetails && (
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => onViewDetails(child)}
              data-testid="child-card-details-button"
              sx={{ minHeight: 44, fontWeight: 700 }}
            >
              Mais detalhes
            </Button>
          </Box>
        )}

        <Divider />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 0.5, bgcolor: isLight ? "grey.50" : "grey.900" }}
        >
          <Stack direction="row">
            {canRegisterDecision && (
              <Tooltip title={alreadyAccepted ? "Registrar reconciliação" : "Registrar decisão por Jesus"}>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
                  aria-label="Registrar decisão"
                  sx={ACTION_SX}
                >
                  <FavoriteIcon sx={{ color: alreadyAccepted ? theme.palette.error.main : "#bbb" }} />
                </IconButton>
              </Tooltip>
            )}
            {!!onEdit && (
              <Tooltip title="Editar criança">
                <IconButton
                  onClick={(e) => { e.stopPropagation(); onEdit(child); }}
                  aria-label="Editar criança"
                  sx={ACTION_SX}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!!onDelete && (
              <Tooltip title="Excluir criança">
                <IconButton
                  onClick={(e) => { e.stopPropagation(); onDelete(child); }}
                  aria-label="Excluir criança"
                  sx={{ ...ACTION_SX, color: "error.main" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {!!onToggleActive && (
            <Tooltip title={child.isActive ? "Desativar criança" : "Ativar criança"}>
              <Box
                component="button"
                type="button"
                role="switch"
                aria-checked={child.isActive}
                aria-label={child.isActive ? "Desativar criança" : "Ativar criança"}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleActive(child); }}
                sx={{
                  position: "relative",
                  mr: 1,
                  // Área de toque de 44 px sem engordar o interruptor.
                  "&::before": { content: '""', position: "absolute", inset: "-8px -4px" },
                  width: 48,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  px: 0.5,
                  bgcolor: child.isActive ? theme.palette.success.main : theme.palette.grey[400],
                  transition: "background-color .2s",
                  "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "white",
                    transition: "transform .2s",
                    transform: child.isActive ? "translateX(20px)" : "translateX(0)",
                    boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                  }}
                />
              </Box>
            </Tooltip>
          )}
        </Stack>
      </Card>

      <DecisionModal
        data-testid="pagela-teacher-child-card-decision"
        open={modalOpen && canRegisterDecision}
        onClose={() => setModalOpen(false)}
        child={child}
        onSuccess={async () => {
          // Quem fecha é o modal: depois de excluir um registro ele segue
          // aberto, com o histórico já atualizado.
          if (onRefresh) await onRefresh();
        }}
      />
    </>
  );
}
