// src/components/common/BackHeader.tsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

type BackHeaderProps = {
  title: string;
  mobileFontSize?: string | number; // 👈 nova prop opcional
  desktopFontSize?: string | number; // 👈 extra se quiser também controlar desktop
};

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  mobileFontSize,
  desktopFontSize,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  return isXs ? (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Tooltip title="Voltar">
        <IconButton
          edge="start"
          onClick={() => navigate(-1)}
          aria-label="Voltar para a página anterior"
          sx={{
            bgcolor: "white",
            boxShadow: 1,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          color: "#1a3c34",
          flex: 1,
          fontSize: mobileFontSize ?? undefined, // 👈 usa o valor passado ou mantém padrão do `h6`
        }}
      >
        {title}
      </Typography>
    </Box>
  ) : (
    <Typography
      variant="h4"
      fontWeight={700}
      textAlign="center"
      sx={{
        mb: 3,
        color: "#1a3c34",
        fontSize: desktopFontSize ?? undefined, // 👈 usa se vier
      }}
    >
      {title}
    </Typography>
  );
};

export default BackHeader;
