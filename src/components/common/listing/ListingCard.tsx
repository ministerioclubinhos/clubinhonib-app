import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import type { ListingBadge, ListingMeta } from "./types";

type Props = {
  /** Iniciais ou ícone no avatar. */
  avatar: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Cor da faixa lateral e do avatar; segue a paleta do tema. */
  accent: ListingBadge["color"];
  badges?: ListingBadge[];
  meta?: ListingMeta[];
  /** Texto principal, recortado em poucas linhas. */
  excerpt?: string;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
};

/** Quantas linhas do texto aparecem antes do recorte. */
const EXCERPT_LINES = 3;

/**
 * Card da listagem administrativa.
 *
 * As três telas usam este mesmo formato — faixa de destaque, avatar, título,
 * selos, trecho e rodapé com ações — para que pareçam a mesma família.
 */
export default function ListingCard({
  avatar,
  title,
  subtitle,
  accent,
  badges = [],
  meta = [],
  excerpt,
  footer,
  actions,
  onClick,
}: Props) {
  const theme = useTheme();
  const accentColor = theme.palette[accent === "default" ? "grey" : accent];
  const accentMain =
    accent === "default" ? theme.palette.grey[500] : (accentColor as { main: string }).main;

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .2s, box-shadow .2s, transform .2s",
        // A faixa lateral dá o estado do item sem custar espaço no card.
        "&::before": {
          content: '""',
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 0,
          width: 4,
          bgcolor: accentMain,
        },
        "&:hover": onClick
          ? {
              borderColor: accentMain,
              boxShadow: { xs: "none", sm: `0 8px 24px ${alpha(accentMain, 0.18)}` },
              transform: { xs: "none", sm: "translateY(-2px)" },
            }
          : undefined,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.75, sm: 2 },
          pl: { xs: 2.25, sm: 2.5 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          minHeight: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              fontSize: 15,
              fontWeight: 700,
              bgcolor: alpha(accentMain, 0.14),
              color: accentMain,
            }}
          >
            {avatar}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.25 }}
              noWrap
              title={title}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" noWrap title={subtitle}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        {badges.length > 0 ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {badges.map((badge) => (
              <Chip
                key={badge.label}
                size="small"
                label={badge.label}
                color={badge.color}
                variant={badge.color === "default" ? "outlined" : "filled"}
                sx={{ borderRadius: 999, maxWidth: "100%" }}
              />
            ))}
          </Stack>
        ) : null}

        {excerpt ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: EXCERPT_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              // Um comentário longo não pode esticar o card fora da grade.
              wordBreak: "break-word",
            }}
          >
            {excerpt}
          </Typography>
        ) : null}

        {meta.length > 0 ? (
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: "auto", pt: 0.5 }}
          >
            {meta.map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ color: "text.secondary", minWidth: 0 }}
              >
                {item.icon}
                <Typography variant="caption" noWrap title={item.label}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </CardContent>

      {actions || footer ? (
        <>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            // No celular a linha quebra em vez de espremer: com quatro ações de
            // 44px sobra pouco para o rodapé em telas de 320px.
            flexWrap="wrap"
            useFlexGap
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.5, sm: 0.75 },
              pl: { xs: 1.75, sm: 2.25 },
            }}
          >
            <Box sx={{ minWidth: 0, flex: { xs: "1 1 100%", sm: "0 1 auto" } }}>
              {footer}
            </Box>
            <Stack
              direction="row"
              spacing={0.25}
              sx={{
                flexShrink: 0,
                // O dedo precisa de mais alvo que o mouse; as telas passam os
                // botões como `size="small"`, que sozinho daria ~34px.
                "& .MuiIconButton-root": {
                  minWidth: { xs: 44, sm: "auto" },
                  minHeight: { xs: 44, sm: "auto" },
                },
              }}
            >
              {actions}
            </Stack>
          </Stack>
        </>
      ) : null}
    </Card>
  );
}
