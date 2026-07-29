import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import api from "@/config/axiosConfig";
import { WeekMaterialPageData } from "@/store/slices/week-material/weekMaterialSlice";
import { MediaItem } from "@/store/slices/types";
import MediaDocumentPreviewModal from "@/utils/MediaDocumentPreviewModal";
import {
  FAMILY_COLORS,
  FamilyDayClosing,
  FamilyDayGallery,
  FamilyDayHero,
  FamilyDayMaterials,
  FamilyDayProgram,
  familyDayTheme,
} from "./components";

const SpecialFamilyDayPage = () => {
  const [data, setData] = useState<WeekMaterialPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const sectionId = import.meta.env.VITE_SPECIAL_FAMILY_DAY_ID || "";

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      if (!sectionId) {
        setError("A página do Dia Especial da Família ainda não foi configurada.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<WeekMaterialPageData>(
          `/week-material-pages/${sectionId}`
        );
        if (active) setData(response.data);
      } catch {
        if (active) {
          setError("Erro ao carregar os dados do Dia Especial da Família.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [sectionId]);

  const previewDocument = (document: MediaItem) => {
    setSelectedMedia(document);
    setPreviewOpen(true);
  };

  const downloadDocument = async (document: MediaItem) => {
    try {
      const response = await fetch(document.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = document.title || "material-dia-da-familia";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(document.url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={familyDayTheme}>
        <Box
          sx={{
            minHeight: "72vh",
            display: "grid",
            placeItems: "center",
            backgroundColor: FAMILY_COLORS.cream,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                display: "grid",
                placeItems: "center",
                borderRadius: "28px",
                backgroundColor: "#FCE9E3",
              }}
            >
              <CircularProgress
                size={34}
                sx={{ color: FAMILY_COLORS.terracotta }}
              />
            </Box>
            <Typography color="text.secondary" fontWeight={700}>
              Preparando um dia cheio de afeto...
            </Typography>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !data) {
    return (
      <ThemeProvider theme={familyDayTheme}>
        <Box
          sx={{
            minHeight: "68vh",
            display: "grid",
            placeItems: "center",
            backgroundColor: FAMILY_COLORS.cream,
            px: 2,
          }}
        >
          <Alert
            severity="error"
            sx={{
              maxWidth: 680,
              borderRadius: "22px",
              border: "1px solid #F2C7BA",
            }}
          >
            {error || "Não foi possível encontrar o conteúdo desta página."}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={familyDayTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          color: FAMILY_COLORS.ink,
          backgroundColor: FAMILY_COLORS.cream,
          overflow: "hidden",
        }}
      >
        <FamilyDayHero data={data} />
        <FamilyDayProgram
          description={data.description}
          subtitle={data.subtitle}
        />
        <FamilyDayGallery images={data.images} />
        <FamilyDayMaterials
          videos={data.videos}
          audios={data.audios}
          documents={data.documents}
          onPreview={previewDocument}
          onDownload={downloadDocument}
        />
        <FamilyDayClosing />

        <MediaDocumentPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          media={selectedMedia}
          title={selectedMedia?.title}
        />
      </Box>
    </ThemeProvider>
  );
};

export default SpecialFamilyDayPage;
