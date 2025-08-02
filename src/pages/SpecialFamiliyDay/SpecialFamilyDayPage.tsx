import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import api from "@/config/axiosConfig";
import { WeekMaterialPageData } from "@/store/slices/week-material/weekMaterialSlice";
import { MediaItem } from "store/slices/types";
import MediaDocumentPreviewModal from "@/utils/MediaDocumentPreviewModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion"; // Para animações

// Ícones da programação
import BadgeIcon from "@mui/icons-material/Badge";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import GroupsIcon from "@mui/icons-material/Groups";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

const theme = createTheme({
  palette: {
    primary: { main: "#388E3C" },
    secondary: { main: "#FF6F00" },
    background: { default: "#F5F6F5" }
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif" },
    h2: { fontFamily: "'Playfair Display', serif" },
    h4: { fontFamily: "'Playfair Display', serif" },
  },
});

const programIcons = [
  <BadgeIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <VolunteerActivismIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <GroupsIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <OndemandVideoIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <EmojiPeopleIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <SportsKabaddiIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <MusicNoteIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <MenuBookIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <RestaurantIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
  <CardGiftcardIcon sx={{ color: "#FF6F00", fontSize: 32 }} />,
];

const SpecialFamilyDayPage: React.FC = () => {
  const [data, setData] = useState<WeekMaterialPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get<WeekMaterialPageData>(
          "/week-material-pages/a2f9913a-e123-46b2-b6f4-a4138686042f"
        );
        setData(response.data);
      } catch {
        setError("Erro ao carregar dados do Dia Especial da Família.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, mt: 6, pb: 6 }}>
        <Box
          component={motion.section}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
            py: { xs: 8, sm: 10 },
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 } }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              sx={{
                color: "#fff",
                textShadow: "2px 2px 8px rgba(0,0,0,0.4)",
                mb: 2,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              fontWeight={500}
              sx={{ color: "#E8F5E9", fontSize: { xs: "1.25rem", sm: "1.75rem" } }}
            >
              Família um projeto de Deus
            </Typography>
          </Container>
        </Box>

        <Container maxWidth={false} sx={{ maxWidth: "90%", py: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {[
              { icon: <CalendarMonthIcon />, label: "Data", value: "09/08/2025", color: "#FF8A65" },
              { icon: <AccessTimeIcon />, label: "Horário", value: "14h às 15h30", color: "#4FC3F7" },
              { icon: <PlaceIcon />, label: "Local", value: "No seu Clubinho Bíblico", color: "#81C784" },
            ].map((info, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    height: { xs: 120, sm: 140, md: 160 },
                    p: 2,
                    textAlign: "center",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    backgroundColor: info.color,
                    color: "#fff",
                  }}
                >
                  <Box sx={{ fontSize: { xs: 24, sm: 30, md: 36 }, mb: 1 }}>{info.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    {info.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    {info.value}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" sx={{ my: 6 }}>
            <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main} sx={{ mb: 2 }}>
              O que vai acontecer?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mx: "auto", maxWidth: 800, fontSize: "1.1rem", color: "#555" }}
            >
              {data.subtitle}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" color={theme.palette.primary.main} sx={{ mb: 4 }}>
              Programação do Dia
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {[
                "Recepção e crachás",
                "Boas-vindas e oração",
                "Apresentação do Clubinho",
                "Vídeo convite do Clubão",
                "Declaração das crianças",
                "Brincadeira pais e filhos",
                "Música especial",
                "História bíblica + Versículo",
                "Lanche e oração",
                "Sorteio e encerramento",
              ].map((item, idx) => (
                <Grid key={idx} item xs={12} sm={6} md={4}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      textAlign: "center",
                      backgroundColor: idx % 2 === 0 ? "#E8F5E9" : "#FFF3E0",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    {programIcons[idx]}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                      {idx + 1}. {item}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {data.images.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Grid container spacing={4} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={5}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mb: 2, textAlign: { xs: "center", md: "left" }, color: theme.palette.primary.main }}
                  >
                    Momentos Especiais
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", color: "#555", textAlign: { xs: "center", md: "left" } }}
                  >
                    {data.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Slider
                    dots
                    infinite
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay
                    autoplaySpeed={3000}
                    arrows
                    nextArrow={<Box sx={{ color: theme.palette.primary.main }} />}
                    prevArrow={<Box sx={{ color: theme.palette.primary.main }} />}
                  >
                    {data.images.map((img) => (
                      <Box
                        key={img.id}
                        sx={{
                          position: "relative",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          px: 2,
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "400px",
                            borderRadius: "12px",
                            objectFit: "cover",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: 10,
                            color: "#fff",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                          }}
                        >
                          {img.title}
                        </Typography>
                      </Box>
                    ))}
                  </Slider>
                </Grid>
              </Grid>
            </Box>
          )}

          {data.videos.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight="bold" textAlign="center" color={theme.palette.primary.main} sx={{ mb: 3 }}>
                Vídeos Especiais
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                {data.videos.map((video) => (
                  <Grid key={video.id} item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                      <video controls width="100%" style={{ borderRadius: "8px 8px 0 0" }} src={video.url} />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold">{video.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{video.description}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {data.documents.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight="bold" textAlign="center" color={theme.palette.primary.main} sx={{ mb: 3 }}>
                Materiais para Download
              </Typography>
              <Grid container spacing={3}>
                {data.documents.map((doc) => (
                  <Grid key={doc.id} item xs={12} sm={6} md={4}>
                    <Card sx={{ p: 3, textAlign: "center", borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                      <Typography variant="h6" fontWeight="bold">{doc.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{doc.description}</Typography>
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedMedia(doc);
                            setPreviewOpen(true);
                          }}
                        >
                          Visualizar
                        </Button>
                        <Button variant="contained" color="secondary" href={doc.url} target="_blank">
                          Baixar
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 5 }} />
          <Typography
            variant="h6"
            textAlign="center"
            fontStyle="italic"
            sx={{ color: theme.palette.primary.main, maxWidth: 800, mx: "auto", p: 2, backgroundColor: "#E8F5E9", borderRadius: 2 }}
          >
            “Eu e minha casa serviremos ao Senhor.” – Josué 24:15
          </Typography>
        </Container>

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
