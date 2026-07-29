import { useRef, useState } from "react";
import { Box, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Slider from "react-slick";

import { MediaItem } from "@/store/slices/types";
import { CarouselArrow, SectionEyebrow } from "./FamilyDayShared";
import {
  FAMILY_COLORS,
  sectionWidthSx,
  sliderBaseSx,
} from "./familyDayTheme";

export const FamilyDayGallery = ({ images }: { images: MediaItem[] }) => {
  const [activeImage, setActiveImage] = useState(0);
  const sliderRef = useRef<Slider | null>(null);

  if (images.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        py: { xs: 7, md: 11 },
        color: FAMILY_COLORS.paper,
        backgroundColor: FAMILY_COLORS.tealDark,
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          top: -230,
          right: -100,
          border: "70px solid rgba(243,182,63,.15)",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          width: 190,
          height: 100,
          left: "3%",
          bottom: 40,
          opacity: 0.16,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.9) 2px, transparent 2px)",
          backgroundSize: "17px 17px",
          transform: "rotate(9deg)",
        }}
      />

      <Container maxWidth={false} sx={sectionWidthSx}>
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          sx={{ position: "relative" }}
        >
          <Grid item xs={12} md={4}>
            <SectionEyebrow
              icon={<FavoriteRoundedIcon />}
              color="#FFE6DC"
              background="rgba(214,93,67,.34)"
            >
              Nosso álbum de memórias
            </SectionEyebrow>
            <Typography
              component="h2"
              variant="h2"
              sx={{
                mt: 2,
                color: FAMILY_COLORS.paper,
                fontSize: { xs: "2.35rem", sm: "3rem", md: "3.8rem" },
                lineHeight: 1.02,
              }}
            >
              Momentos para guardar{" "}
              <Box component="span" sx={{ color: "#F6C866" }}>
                no coração
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2,
                maxWidth: 440,
                color: "rgba(255,255,255,.7)",
                fontSize: { xs: "0.9rem", md: "0.96rem" },
                lineHeight: 1.7,
              }}
            >
              Inspire-se, compartilhe o convite e registre os sorrisos de um dia
              vivido em família.
            </Typography>

            <Stack direction="row" spacing={1.2} sx={{ mt: 3 }}>
              <Counter value={activeImage + 1} label="Foto atual" accent />
              <Counter value={images.length} label="Memórias" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                ...sliderBaseSx,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: {
                    xs: "22px -6px -14px 18px",
                    sm: "28px -16px -18px 36px",
                  },
                  borderRadius: "38px",
                  backgroundColor: FAMILY_COLORS.terracotta,
                  transform: "rotate(2.2deg)",
                },
              }}
            >
              <Slider
                ref={sliderRef}
                dots={false}
                infinite={images.length > 1}
                speed={600}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={images.length > 1}
                autoplaySpeed={5000}
                pauseOnHover
                arrows={images.length > 1}
                nextArrow={<CarouselArrow direction="next" light />}
                prevArrow={<CarouselArrow direction="previous" light />}
                beforeChange={(_, next) => setActiveImage(next)}
              >
                {images.map((image, index) => (
                  <Box
                    key={image.id || image.url}
                    sx={{ p: { xs: 0.4, sm: 0.7 } }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        p: { xs: 0.7, sm: 1 },
                        borderRadius: { xs: "28px", sm: "38px" },
                        backgroundColor: FAMILY_COLORS.paper,
                        boxShadow: "0 28px 70px rgba(8, 38, 35, .3)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={image.url}
                        alt={
                          image.title ||
                          `Memória ${index + 1} do Dia da Família`
                        }
                        sx={{
                          width: "100%",
                          maxHeight: 610,
                          aspectRatio: { xs: "4 / 3", sm: "16 / 10" },
                          display: "block",
                          objectFit: "cover",
                          borderRadius: { xs: "22px", sm: "30px" },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: { xs: 7, sm: 10 },
                          borderRadius: { xs: "22px", sm: "30px" },
                          background:
                            "linear-gradient(180deg, transparent 52%, rgba(28,35,33,.76) 100%)",
                          pointerEvents: "none",
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        sx={{
                          position: "absolute",
                          left: { xs: 22, sm: 34 },
                          right: { xs: 22, sm: 34 },
                          bottom: { xs: 20, sm: 30 },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: "#F6C866",
                              fontSize: "0.66rem",
                              fontWeight: 850,
                              letterSpacing: "0.09em",
                              textTransform: "uppercase",
                            }}
                          >
                            Dia da Família 2026
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.45,
                              maxWidth: 540,
                              color: FAMILY_COLORS.paper,
                              fontSize: { xs: "0.86rem", sm: "1.02rem" },
                              fontWeight: 750,
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {image.description ||
                              image.title ||
                              "Um momento especial para guardar e compartilhar."}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${index + 1}/${images.length}`}
                          size="small"
                          sx={{
                            flex: "0 0 auto",
                            color: FAMILY_COLORS.ink,
                            backgroundColor: "rgba(255,255,255,.9)",
                            fontWeight: 850,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Slider>
            </Box>

            {images.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: 2.5,
                  pb: 0.5,
                  px: 0.5,
                  overflowX: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={`thumbnail-${image.id || image.url}`}
                    component="button"
                    type="button"
                    onClick={() => sliderRef.current?.slickGoTo(index)}
                    aria-label={`Abrir imagem ${index + 1}`}
                    sx={{
                      width: { xs: 68, sm: 82 },
                      height: { xs: 50, sm: 58 },
                      flex: "0 0 auto",
                      p: 0.4,
                      borderRadius: "14px",
                      border:
                        index === activeImage
                          ? `3px solid ${FAMILY_COLORS.sun}`
                          : "3px solid rgba(255,255,255,.18)",
                      backgroundColor:
                        index === activeImage
                          ? FAMILY_COLORS.paper
                          : "rgba(255,255,255,.08)",
                      opacity: index === activeImage ? 1 : 0.62,
                      cursor: "pointer",
                      transition: "opacity .2s ease, transform .2s ease",
                      transform:
                        index === activeImage ? "translateY(-3px)" : "none",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={image.url}
                      alt=""
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const Counter = ({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) => (
  <Box
    sx={{
      px: 1.5,
      py: 1,
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,.17)",
      backgroundColor: "rgba(255,255,255,.07)",
    }}
  >
    <Typography
      sx={{
        color: accent ? "#F6C866" : FAMILY_COLORS.paper,
        fontSize: "1.3rem",
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {String(value).padStart(2, "0")}
    </Typography>
    <Typography
      sx={{
        mt: 0.4,
        color: "rgba(255,255,255,.6)",
        fontSize: "0.63rem",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>
  </Box>
);
