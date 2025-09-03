// src/features/pagela-teacher/components/ChildCard.tsx
import * as React from "react";
import {
  Card, CardActionArea, CardContent, Chip, Stack, Typography,
  Box, Avatar, Tooltip, IconButton, useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PhoneIcon from "@mui/icons-material/Phone";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { ChildSimpleResponseDto } from "@/features/children/types";

/** Paleta pastel estável por nome, com faixa de cor por gender */
function genderPastel(seed: string, gender: string | undefined) {
  const hash = Array.from(seed).reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) % 1000, 7);
  const t = hash / 1000;
  const g = (gender || "").toUpperCase();
  const h = g === "F" ? (310 + t * 70) % 360 : 190 + t * 40;
  const s = 70, l = 85;
  return {
    solid: `hsl(${h} ${s}% ${l - 15}%)`,
    soft:  `hsl(${(h + 12) % 360} ${s}% ${l}%)`,
  };
}

export default function ChildCard({
  child,
  onClick,
  onEdit, // 👈 novo
}: {
  child: ChildSimpleResponseDto;
  onClick: (c: ChildSimpleResponseDto) => void;
  onEdit?: (c: ChildSimpleResponseDto) => void;
}) {
  const theme = useTheme();
  const colors = genderPastel(child.name || child.id, child.gender);

  const initials = React.useMemo(() => {
    const parts = (child.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  }, [child.name]);

  const hasClub = !!child.clubId;
  const g = (child.gender || "").toUpperCase();
  const GenderIcon = g === "F" ? FemaleIcon : MaleIcon;

  return (
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
      {/* Ações / badges no topo direito */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          flexWrap: "wrap",
          maxWidth: "70%",
          justifyContent: "flex-end",
        }}
      >
        {/* Editar */}
        {!!onEdit && (
          <Tooltip title="Editar criança">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(child); }}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Gênero 
        <Tooltip title={g === "F" ? "Feminino" : "Masculino"}>
          <Chip
            size="small"
            color={g === "F" ? "secondary" : "primary"}
            icon={<GenderIcon sx={{ fontSize: 16 }} />}
            label={g === "F" ? "F" : "M"}
            sx={{ fontWeight: 700 }}
          />
        </Tooltip>
        */}

        {/* Vínculo ao clube
        <Tooltip title={hasClub ? "Vinculado a um clubinho" : "Sem clubinho"}>
          <Chip
            size="small"
            color={hasClub ? "success" : "default"}
            label={hasClub ? "Clubinho" : "Sem club"}
            sx={{ fontWeight: 700 }}
          />
        </Tooltip> */}
      </Box>

      {/* Header colorido por gênero */}
      <Box
        sx={{
          height: { xs: 64, sm: 72 },
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

      <CardActionArea onClick={() => onClick(child)} sx={{ height: "100%", alignItems: "stretch", display: "flex" }}>
        <CardContent sx={{ pt: 3.5, pb: 2.25, px: { xs: 1.5, sm: 2 } }}>
          {/* Nome (clamp) */}
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5, minWidth: 0 }}>
            <ChildCareIcon fontSize="small" sx={{ opacity: 0.7 }} />
            <Typography
              variant="subtitle1"
              fontWeight={900}
              title={child.name}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {child.name}
            </Typography>
          </Stack>

          {/* Responsável */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25, minWidth: 0 }}>
            <FamilyRestroomIcon fontSize="small" sx={{ opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" noWrap title={child.guardianName}>
              Resp.: {child.guardianName || "—"}
            </Typography>
          </Stack>

          {/* Telefone */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" noWrap title={child.guardianPhone}>
              Tel.: {child.guardianPhone || "—"}
            </Typography>
          </Stack>

          {/* Rodapé */}
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
  );
}
