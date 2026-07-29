import { Box, Button, Card, Chip, Grid, Stack, Typography } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { motion } from "framer-motion";

import { MediaItem } from "@/store/slices/types";
import { FAMILY_COLORS } from "./familyDayTheme";

export const FamilyDayDocuments = ({
  documents,
  onPreview,
  onDownload,
}: {
  documents: MediaItem[];
  onPreview: (document: MediaItem) => void;
  onDownload: (document: MediaItem) => void;
}) => {
  if (documents.length === 0) return null;

  return (
    <Box
      sx={{
        height: "100%",
        p: { xs: 2, sm: 2.8 },
        borderRadius: "34px",
        border: `1px solid ${FAMILY_COLORS.line}`,
        backgroundColor: FAMILY_COLORS.paper,
        boxShadow: "0 18px 50px rgba(91,62,46,.07)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.4}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2.3 }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: "16px",
              color: FAMILY_COLORS.terracotta,
              backgroundColor: "#FCE9E3",
            }}
          >
            <DescriptionRoundedIcon />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: FAMILY_COLORS.ink,
                fontSize: { xs: "1.2rem", sm: "1.45rem" },
              }}
            >
              Materiais para baixar
            </Typography>
            <Typography
              sx={{
                mt: 0.2,
                color: FAMILY_COLORS.muted,
                fontSize: "0.78rem",
              }}
            >
              Abra, confira e leve os arquivos para o seu Clubinho.
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={`${documents.length} ${
            documents.length === 1 ? "arquivo" : "arquivos"
          }`}
          sx={{
            color: FAMILY_COLORS.terracotta,
            backgroundColor: "#FCE9E3",
            fontWeight: 850,
          }}
        />
      </Stack>

      <Grid container spacing={1.4}>
        {documents.map((document, index) => (
          <Grid
            key={document.id || document.url}
            item
            xs={12}
            sm={documents.length > 1 ? 6 : 12}
          >
            <Card
              component={motion.article}
              whileHover={{ y: -4 }}
              sx={{
                height: "100%",
                p: 1.7,
                borderRadius: "24px",
                border: `1px solid ${FAMILY_COLORS.line}`,
                backgroundColor: index % 2 === 0 ? "#FFF9F4" : "#F6FAF8",
                boxShadow: "none",
              }}
            >
              <Stack sx={{ height: "100%" }} spacing={1.4}>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "14px",
                      color:
                        index % 2 === 0
                          ? FAMILY_COLORS.terracotta
                          : FAMILY_COLORS.teal,
                      backgroundColor:
                        index % 2 === 0 ? "#FCE9E3" : "#E3F1EB",
                    }}
                  >
                    <DescriptionRoundedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography
                    sx={{
                      minWidth: 0,
                      color: FAMILY_COLORS.ink,
                      fontSize: "0.88rem",
                      fontWeight: 850,
                      lineHeight: 1.3,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {document.title || `Material ${index + 1}`}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    flex: 1,
                    color: FAMILY_COLORS.muted,
                    fontSize: "0.76rem",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {document.description ||
                    "Material de apoio para preparar o Dia da Família."}
                </Typography>

                <Stack direction="row" spacing={0.8}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => onPreview(document)}
                    sx={{
                      color: FAMILY_COLORS.teal,
                      borderColor: "#AFCFC4",
                      "&:hover": {
                        borderColor: FAMILY_COLORS.teal,
                        backgroundColor: "#EAF4F0",
                      },
                    }}
                  >
                    Visualizar
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => onDownload(document)}
                    sx={{
                      backgroundColor: FAMILY_COLORS.terracotta,
                      "&:hover": {
                        backgroundColor: FAMILY_COLORS.terracottaDark,
                      },
                    }}
                  >
                    Baixar
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
