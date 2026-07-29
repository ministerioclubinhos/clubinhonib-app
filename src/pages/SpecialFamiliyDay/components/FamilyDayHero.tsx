import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { motion } from "framer-motion";

import { WeekMaterialPageData } from "@/store/slices/week-material/weekMaterialSlice";
import { SectionEyebrow } from "./FamilyDayShared";
import { FAMILY_COLORS, sectionWidthSx } from "./familyDayTheme";

const FAMILY_DAY_HERO_IMAGE =
  "https://clubinho-nib-storage.s3.amazonaws.com/production/uploads/1785245767597_image_0.jpeg";

const eventInfo = [
  {
    icon: <CalendarMonthRoundedIcon />,
    label: "Quando",
    value: "08 de agosto de 2026",
    color: FAMILY_COLORS.terracotta,
    background: "#FCE9E3",
  },
  {
    icon: <PlaceRoundedIcon />,
    label: "Onde",
    value: "No seu Clubinho Bíblico",
    color: FAMILY_COLORS.teal,
    background: "#E3F1EB",
  },
  {
    icon: <AccessTimeRoundedIcon />,
    label: "Horário",
    value: "No horário do seu Clubinho",
    color: "#4E7CA2",
    background: FAMILY_COLORS.skyLight,
  },
];

const EventDetails = () => (
  <Box sx={{ pb: { xs: 7, md: 10 } }}>
    <Container maxWidth={false} sx={sectionWidthSx}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1.4,
          mt: { xs: -2, md: -3.5 },
          position: "relative",
          zIndex: 3,
        }}
      >
        {eventInfo.map((info) => (
          <Stack
            key={info.label}
            component={motion.div}
            whileHover={{ y: -4 }}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: { xs: 1.5, md: 1.8 },
              minWidth: 0,
              borderRadius: "24px",
              border: `1px solid ${FAMILY_COLORS.line}`,
              backgroundColor: FAMILY_COLORS.paper,
              boxShadow: "0 16px 40px rgba(91, 62, 46, 0.08)",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                flex: "0 0 auto",
                display: "grid",
                placeItems: "center",
                borderRadius: "16px",
                color: info.color,
                backgroundColor: info.background,
              }}
            >
              {info.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: info.color,
                  fontSize: "0.68rem",
                  fontWeight: 850,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                {info.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  color: FAMILY_COLORS.ink,
                  fontSize: { xs: "0.86rem", md: "0.92rem" },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {info.value}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </Container>
  </Box>
);

export const FamilyDayHero = ({ data }: { data: WeekMaterialPageData }) => {
  const hasMaterials =
    data.videos.length > 0 ||
    data.audios.length > 0 ||
    data.documents.length > 0;

  return (
    <>
      <Box
        component="section"
        sx={{
          position: "relative",
          isolation: "isolate",
          pt: { xs: 4.5, sm: 6, md: 7.5 },
          pb: { xs: 7.5, sm: 9, md: 11 },
          background:
            "linear-gradient(135deg, #FFF8EF 0%, #FFF4E7 52%, #F9ECDF 100%)",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            zIndex: -1,
            width: { xs: 230, md: 420 },
            height: { xs: 230, md: 420 },
            borderRadius: "42% 58% 63% 37% / 52% 37% 63% 48%",
            backgroundColor: FAMILY_COLORS.peach,
            opacity: 0.48,
            top: { xs: -110, md: -190 },
            left: { xs: -120, md: -180 },
            transform: "rotate(18deg)",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            zIndex: -1,
            width: { xs: 170, md: 290 },
            height: { xs: 170, md: 290 },
            borderRadius: "50%",
            border: { xs: "34px solid", md: "56px solid" },
            borderColor: FAMILY_COLORS.sun,
            opacity: 0.2,
            right: { xs: -100, md: -110 },
            top: { xs: 80, md: 40 },
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            zIndex: -1,
            width: 150,
            height: 80,
            left: "42%",
            bottom: 18,
            opacity: 0.18,
            backgroundImage: `radial-gradient(${FAMILY_COLORS.teal} 2px, transparent 2px)`,
            backgroundSize: "16px 16px",
            transform: "rotate(-8deg)",
          }}
        />

        <Container maxWidth={false} sx={sectionWidthSx}>
          <Grid container spacing={{ xs: 5.5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65 }}
              >
                <SectionEyebrow
                  icon={<FamilyRestroomRoundedIcon />}
                  color={FAMILY_COLORS.teal}
                  background="#E3F1EB"
                >
                  Família, um projeto de Deus
                </SectionEyebrow>

                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    mt: 2.2,
                    maxWidth: 740,
                    fontSize: {
                      xs: "3.1rem",
                      sm: "4.25rem",
                      md: "4.7rem",
                      lg: "5.55rem",
                    },
                    lineHeight: 0.93,
                    color: FAMILY_COLORS.ink,
                  }}
                >
                  Dia da
                  <Box
                    component="span"
                    sx={{
                      position: "relative",
                      zIndex: 0,
                      display: "block",
                      width: "fit-content",
                      color: FAMILY_COLORS.terracotta,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        zIndex: -1,
                        left: -4,
                        right: -12,
                        bottom: "0.02em",
                        height: "0.22em",
                        borderRadius: 999,
                        backgroundColor: FAMILY_COLORS.sun,
                        opacity: 0.48,
                        transform: "rotate(-1.5deg)",
                      },
                    }}
                  >
                    Família
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    mt: 2.3,
                    maxWidth: 620,
                    color: FAMILY_COLORS.muted,
                    fontSize: { xs: "1rem", sm: "1.08rem", md: "1.14rem" },
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  {data.subtitle ||
                    "Um encontro para celebrar o amor que acolhe, a fé que nos aproxima e as memórias que levamos para sempre."}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.2}
                  sx={{ mt: 3.2, alignItems: { xs: "stretch", sm: "center" } }}
                >
                  <Button
                    component="a"
                    href="#programacao"
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      minHeight: 52,
                      backgroundColor: FAMILY_COLORS.terracotta,
                      boxShadow: "0 12px 26px rgba(214, 93, 67, 0.26)",
                      "&:hover": {
                        backgroundColor: FAMILY_COLORS.terracottaDark,
                      },
                    }}
                  >
                    Conheça a programação
                  </Button>
                  {hasMaterials && (
                    <Button
                      component="a"
                      href="#materiais"
                      variant="text"
                      sx={{
                        minHeight: 52,
                        color: FAMILY_COLORS.teal,
                        "&:hover": { backgroundColor: "#E3F1EB" },
                      }}
                    >
                      Ver materiais do encontro
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                sx={{
                  position: "relative",
                  minHeight: { xs: 390, sm: 490, md: 520 },
                  maxWidth: 650,
                  ml: { md: "auto" },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    position: "absolute",
                    inset: {
                      xs: "30px 14px 42px 28px",
                      sm: "28px 20px 48px 48px",
                    },
                    borderRadius:
                      "34% 66% 38% 62% / 57% 34% 66% 43%",
                    backgroundColor: FAMILY_COLORS.teal,
                    transform: "rotate(4deg)",
                  }}
                />
                <Box
                  aria-hidden="true"
                  sx={{
                    position: "absolute",
                    width: { xs: 110, sm: 150 },
                    height: { xs: 110, sm: 150 },
                    borderRadius: "50%",
                    top: 0,
                    right: 0,
                    backgroundColor: FAMILY_COLORS.sun,
                  }}
                />
                <Box
                  component="figure"
                  sx={{
                    position: "absolute",
                    inset: {
                      xs: "18px 28px 40px 6px",
                      sm: "20px 44px 46px 18px",
                    },
                    m: 0,
                    p: { xs: 0.8, sm: 1.1 },
                    borderRadius: {
                      xs: "32px 32px 90px 32px",
                      sm: "46px 46px 140px 46px",
                    },
                    backgroundColor: FAMILY_COLORS.paper,
                    boxShadow: "0 28px 70px rgba(72, 48, 36, 0.19)",
                    transform: "rotate(-2.2deg)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={FAMILY_DAY_HERO_IMAGE}
                    alt="Dia Especial da Família"
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                      borderRadius: {
                        xs: "25px 25px 82px 25px",
                        sm: "37px 37px 130px 37px",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: { xs: 7, sm: 9 },
                      borderRadius: {
                        xs: "25px 25px 82px 25px",
                        sm: "37px 37px 130px 37px",
                      },
                      background:
                        "linear-gradient(180deg, transparent 54%, rgba(52,43,39,0.64) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: { xs: 4, sm: 8 },
                    left: { xs: -4, sm: -12 },
                    width: { xs: 82, sm: 96 },
                    py: 1.25,
                    borderRadius: "24px",
                    color: FAMILY_COLORS.ink,
                    backgroundColor: FAMILY_COLORS.paper,
                    textAlign: "center",
                    boxShadow: "0 16px 38px rgba(72, 48, 36, 0.17)",
                    transform: "rotate(-7deg)",
                  }}
                >
                  <Typography
                    sx={{
                      color: FAMILY_COLORS.terracotta,
                      fontSize: { xs: "1.75rem", sm: "2.05rem" },
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    08
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: "0.68rem",
                      fontWeight: 850,
                      letterSpacing: "0.07em",
                    }}
                  >
                    AGO • 2026
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    position: "absolute",
                    zIndex: 3,
                    right: { xs: 0, sm: -4 },
                    bottom: { xs: 2, sm: 6 },
                    maxWidth: { xs: 245, sm: 300 },
                    p: { xs: 1.25, sm: 1.5 },
                    pr: { xs: 1.6, sm: 2 },
                    borderRadius: "24px 24px 8px 24px",
                    color: FAMILY_COLORS.paper,
                    backgroundColor: FAMILY_COLORS.terracotta,
                    boxShadow: "0 18px 42px rgba(169, 63, 43, 0.28)",
                    transform: "rotate(2deg)",
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      flex: "0 0 auto",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "14px",
                      color: FAMILY_COLORS.terracotta,
                      backgroundColor: FAMILY_COLORS.paper,
                    }}
                  >
                    <FavoriteRoundedIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        lineHeight: 1.25,
                        fontWeight: 850,
                      }}
                    >
                      Amor que acolhe
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.2,
                        color: "rgba(255,255,255,.78)",
                        fontSize: { xs: "0.67rem", sm: "0.74rem" },
                      }}
                    >
                      Uma celebração para todas as famílias
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: "-2%",
            right: "-2%",
            bottom: -1,
            height: { xs: 48, md: 72 },
            backgroundColor: FAMILY_COLORS.cream,
            clipPath:
              "polygon(0 55%, 8% 67%, 18% 48%, 29% 70%, 40% 51%, 52% 72%, 64% 47%, 76% 66%, 88% 46%, 100% 62%, 100% 100%, 0 100%)",
          }}
        />
      </Box>

      <EventDetails />
    </>
  );
};
