import { Box, Container, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { MediaItem } from "@/store/slices/types";
import { FamilyDayDocuments } from "./FamilyDayDocuments";
import { FamilyDayMediaCarousel } from "./FamilyDayMediaCarousel";
import { SectionEyebrow } from "./FamilyDayShared";
import { FAMILY_COLORS, sectionWidthSx } from "./familyDayTheme";

export const FamilyDayMaterials = ({
  videos,
  audios,
  documents,
  onPreview,
  onDownload,
}: {
  videos: MediaItem[];
  audios: MediaItem[];
  documents: MediaItem[];
  onPreview: (document: MediaItem) => void;
  onDownload: (document: MediaItem) => void;
}) => {
  if (videos.length === 0 && audios.length === 0 && documents.length === 0) {
    return null;
  }

  return (
    <Box
      id="materiais"
      component="section"
      sx={{
        py: { xs: 7, md: 11 },
        backgroundColor: FAMILY_COLORS.cream,
        scrollMarginTop: 88,
      }}
    >
      <Container maxWidth={false} sx={sectionWidthSx}>
        <Box sx={{ maxWidth: 760, mb: { xs: 4, md: 5.5 } }}>
          <SectionEyebrow
            icon={<AutoAwesomeRoundedIcon />}
            color={FAMILY_COLORS.teal}
            background="#E3F1EB"
          >
            Tudo em um só lugar
          </SectionEyebrow>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              mt: 2,
              color: FAMILY_COLORS.ink,
              fontSize: { xs: "2.3rem", sm: "3rem", md: "3.7rem" },
              lineHeight: 1.04,
            }}
          >
            Materiais para fazer esse dia{" "}
            <Box component="span" sx={{ color: FAMILY_COLORS.terracotta }}>
              acontecer
            </Box>
          </Typography>
        </Box>

        <FamilyDayMediaCarousel kind="video" items={videos} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              audios.length > 0 && documents.length > 0
                ? { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
                : "1fr",
            gap: 2.2,
            alignItems: "stretch",
          }}
        >
          <FamilyDayMediaCarousel
            kind="audio"
            items={audios}
            compact={audios.length > 0 && documents.length > 0}
          />
          <FamilyDayDocuments
            documents={documents}
            onPreview={onPreview}
            onDownload={onDownload}
          />
        </Box>
      </Container>
    </Box>
  );
};
