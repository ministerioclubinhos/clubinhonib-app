// src/features/pagela-teacher/components/PagelaCard.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Delete, Edit, EventNote } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpaIcon from "@mui/icons-material/Spa";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import type { Pagela } from "../types";
import { toLabelWeek } from "../utils";

/** Formata YYYY-MM-DD para "31 de agosto de 2025" (seguro contra fuso) */
function formatPtBrDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export default function PagelaCard({
  row,
  onEdit,
  onDelete,
}: {
  row: Pagela;
  onEdit: (r: Pagela) => void;
  onDelete: (r: Pagela) => void;
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Estilo para forçar 3 colunas no mobile
  const chipMobileSx = {
    width: "100%",
    px: 0.5,
    height: 28,
    borderRadius: 2,
    "& .MuiChip-label": {
      px: 0.5,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 700,
      fontSize: "0.75rem",
    },
    "& .MuiChip-icon": { mr: 0.5 },
  } as const;

  const Chips = () =>
    isXs ? (
      // MOBILE: 3 chips lado a lado, cada um com 33%
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 0.5,
          width: "100%",
        }}
      >
        <Tooltip title={row.present ? "Presente" : "Ausente"}>
          <Chip
            size="small"
            color={row.present ? "success" : "default"}
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={row.present ? "Pres." : "Aus."}
            sx={chipMobileSx}
          />
        </Tooltip>

        <Tooltip title="Meditação">
          <Chip
            size="small"
            color={row.didMeditation ? "success" : "default"}
            icon={<SpaIcon sx={{ fontSize: 16 }} />}
            label="Med."
            sx={chipMobileSx}
          />
        </Tooltip>

        <Tooltip title="Versículo">
          <Chip
            size="small"
            color={row.recitedVerse ? "success" : "default"}
            icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
            label="Vers."
            sx={chipMobileSx}
          />
        </Tooltip>
      </Box>
    ) : (
      // DESKTOP: layout original com labels completos
      <Stack direction="row" spacing={0.75} flexWrap="wrap">
        <Chip
          size="small"
          color={row.present ? "success" : "default"}
          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
          label={row.present ? "Presente" : "Ausente"}
          sx={{ fontWeight: 700 }}
        />
        <Chip
          size="small"
          color={row.didMeditation ? "success" : "default"}
          icon={<SpaIcon sx={{ fontSize: 16 }} />}
          label="Meditação"
          sx={{ fontWeight: 700 }}
        />
        <Chip
          size="small"
          color={row.recitedVerse ? "success" : "default"}
          icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
          label="Versículo"
          sx={{ fontWeight: 700 }}
        />
      </Stack>
    );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        height: "100%",
        overflow: "hidden",
        transition: "transform .12s ease, box-shadow .12s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
      }}
    >
      {/* Faixa superior fofinha */}
      <Box
        sx={{
          height: 6,
          background:
            "linear-gradient(90deg, #a0e3a2 0%, #b8d6ff 50%, #ffb8e6 100%)",
        }}
      />

      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              fontWeight={900}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={toLabelWeek(row.year, row.week)}
            >
              {toLabelWeek(row.year, row.week)}
            </Typography>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => onEdit(row)}
                  aria-label="Editar pagela"
                >
                  <Edit fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <IconButton
                  size="small"
                  onClick={() => onDelete(row)}
                  aria-label="Excluir pagela"
                >
                  <Delete fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ color: "text.secondary" }}
          >
            <EventNote fontSize="small" />
            <Typography variant="caption">
              Registro: {formatPtBrDate(row.referenceDate)}
            </Typography>
          </Stack>

          <Divider />

          <Chips />

          {row.notes && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {row.notes}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
