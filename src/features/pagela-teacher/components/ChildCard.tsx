import * as React from "react";
import {
  Card, CardActionArea, CardContent, Stack, Typography,
  Box, Avatar, Tooltip, IconButton, useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PhoneIcon from "@mui/icons-material/Phone";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { ChildSimpleResponseDto } from "@/features/children/types";
import DecisionModal from "./DecisionModal";

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

export default function ChildCard({
  child,
  onClick,
  onEdit,
  onRefresh
}: {
  child: ChildSimpleResponseDto;
  onClick: (c: ChildSimpleResponseDto) => void;
  onEdit?: (c: ChildSimpleResponseDto) => void;
  onRefresh?: () => void;
}) {
  const theme = useTheme();
  const colors = genderPastel(child.name || child.id, child.gender);
  const initials = React.useMemo(() => {
    const parts = (child.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  }, [child.name]);

  const alreadyAccepted = child.acceptedChrists?.length > 0;
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 4,
          height: "100%",
          overflow: "hidden",
          borderColor: "divider",
          transition: "transform .12s ease, box-shadow .12s ease",
          "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
          position: "relative",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #fff 0%, #fafbfc 100%)"
              : "linear-gradient(180deg, #1e1e1e 0%, #161616 100%)",
        }}
      >
        <Tooltip title={alreadyAccepted ? "Registrar reconciliação" : "Registrar decisão por Jesus"}>
          <IconButton
            onClick={() => setModalOpen(true)}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor: "divider",
              zIndex: 3,
              mb: 6,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <FavoriteIcon sx={{ color: alreadyAccepted ? theme.palette.error.main : "#ccc" }} />
          </IconButton>
        </Tooltip>

        {!!onEdit && (
          <Tooltip title="Editar criança">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(child); }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                zIndex: 3,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Box
          sx={{
            height: { xs: 80, sm: 90 },
            background: `linear-gradient(135deg, ${colors.soft} 0%, ${colors.solid} 100%)`,
            position: "relative",
          }}
        >
          <Box sx={{ position: "absolute", top: -10, left: -10, width: 80, height: 80, borderRadius: "50%", opacity: 0.18, backgroundColor: colors.solid, filter: "blur(2px)" }} />
          <Box sx={{ position: "absolute", bottom: -14, right: -10, width: 72, height: 72, borderRadius: "50%", opacity: 0.12, backgroundColor: colors.soft, filter: "blur(1px)" }} />

          <Avatar
            sx={{
              position: "absolute",
              left: 14,
              bottom: -24,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              border: "3px solid",
              borderColor: "background.paper",
              bgcolor: colors.solid,
              fontWeight: 900,
            }}
          >
            {initials || <ChildCareIcon />}
          </Avatar>
        </Box>

        <CardActionArea onClick={() => onClick(child)} sx={{ display: "flex" }}>
          <CardContent sx={{ pt: 3.5, pb: 2.25, px: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
              <ChildCareIcon fontSize="small" sx={{ opacity: 0.7 }} />
              <Typography
                variant="subtitle1"
                fontWeight={900}
                title={child.name}
                sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {child.name}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
              <FamilyRestroomIcon fontSize="small" sx={{ opacity: 0.7 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                title={child.guardianName}
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Resp.: {child.guardianName || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary" noWrap title={child.guardianPhone}>
                Tel.: {child.guardianPhone || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ mt: 1.25 }} alignItems="center" flexWrap="wrap">
              <EmojiEmotionsIcon fontSize="small" sx={{ opacity: 0.65 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.15 }}>
                toque para abrir a caderneta
              </Typography>
              <FavoriteIcon fontSize="inherit" sx={{ opacity: 0.5, ml: 0.25 }} />
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
      <DecisionModal
        open={modalOpen}
        onClose={handleCloseModal}
        child={child}
        onSuccess={async () => {
          if (onRefresh) await onRefresh();
          handleCloseModal();
        }}
      />

    </>
  );
}
