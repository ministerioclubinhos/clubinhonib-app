import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import EmojiPeopleRoundedIcon from "@mui/icons-material/EmojiPeopleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import SportsKabaddiRoundedIcon from "@mui/icons-material/SportsKabaddiRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import { motion } from "framer-motion";

import { SectionEyebrow } from "./FamilyDayShared";
import { FAMILY_COLORS, sectionWidthSx } from "./familyDayTheme";

const programItems = [
  {
    title: "Recepção e crachás",
    icon: <BadgeRoundedIcon />,
    color: FAMILY_COLORS.terracotta,
  },
  {
    title: "Boas-vindas e oração",
    icon: <VolunteerActivismRoundedIcon />,
    color: FAMILY_COLORS.teal,
  },
  {
    title: "Apresentação do Clubinho",
    icon: <GroupsRoundedIcon />,
    color: FAMILY_COLORS.sky,
  },
  {
    title: "Declaração das crianças",
    icon: <EmojiPeopleRoundedIcon />,
    color: FAMILY_COLORS.terracotta,
  },
  {
    title: "Brincadeira pais e filhos",
    icon: <SportsKabaddiRoundedIcon />,
    color: FAMILY_COLORS.teal,
  },
  {
    title: "Música especial",
    icon: <MusicNoteRoundedIcon />,
    color: FAMILY_COLORS.sky,
  },
  {
    title: "História bíblica + versículo",
    icon: <MenuBookRoundedIcon />,
    color: FAMILY_COLORS.sun,
  },
  {
    title: "Lanche e oração",
    icon: <RestaurantRoundedIcon />,
    color: FAMILY_COLORS.terracotta,
  },
  {
    title: "Sorteio e encerramento",
    icon: <CardGiftcardRoundedIcon />,
    color: FAMILY_COLORS.teal,
  },
];

type ProgramItem = (typeof programItems)[number];

const ProgramCard = ({
  item,
  index,
}: {
  item: ProgramItem;
  index: number;
}) => (
  <Box
    component={motion.article}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.2) }}
    whileHover={{ y: -5 }}
    sx={{
      position: "relative",
      height: "100%",
      minHeight: { xs: 138, md: 154 },
      p: { xs: 1.7, md: 2 },
      borderRadius: "26px",
      border: `1px solid ${FAMILY_COLORS.line}`,
      backgroundColor: FAMILY_COLORS.paper,
      boxShadow: "0 14px 36px rgba(91, 62, 46, 0.07)",
      overflow: "hidden",
      "&::after": {
        content: '""',
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: "50%",
        right: -20,
        bottom: -24,
        backgroundColor: item.color,
        opacity: 0.14,
      },
    }}
  >
    <Stack sx={{ height: "100%" }} justifyContent="space-between" spacing={1.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 46,
            height: 46,
            display: "grid",
            placeItems: "center",
            borderRadius: "16px",
            color: item.color,
            backgroundColor: `${item.color}18`,
            "& .MuiSvgIcon-root": { fontSize: 24 },
          }}
        >
          {item.icon}
        </Box>
        <Typography
          sx={{
            color: item.color,
            fontWeight: 900,
            fontSize: "0.76rem",
            letterSpacing: "0.08em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </Typography>
      </Stack>
      <Typography
        sx={{
          color: FAMILY_COLORS.ink,
          fontSize: { xs: "0.84rem", md: "0.92rem" },
          fontWeight: 800,
          lineHeight: 1.3,
          maxWidth: 160,
        }}
      >
        {item.title}
      </Typography>
    </Stack>
  </Box>
);

export const FamilyDayProgram = ({
  description,
  subtitle,
}: {
  description?: string;
  subtitle?: string;
}) => (
  <Box
    id="programacao"
    component="section"
    sx={{
      py: { xs: 7, md: 11 },
      backgroundColor: "#FFFDF9",
      scrollMarginTop: 88,
    }}
  >
    <Container maxWidth={false} sx={sectionWidthSx}>
      <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-end">
        <Grid item xs={12} md={5}>
          <SectionEyebrow icon={<CelebrationRoundedIcon />}>
            Feito para viver juntos
          </SectionEyebrow>
          <Typography
            component="h2"
            variant="h2"
            sx={{
              mt: 2,
              maxWidth: 590,
              color: FAMILY_COLORS.ink,
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.7rem" },
              lineHeight: 1.03,
            }}
          >
            Um encontro cheio de{" "}
            <Box component="span" sx={{ color: FAMILY_COLORS.teal }}>
              significado
            </Box>
          </Typography>
        </Grid>
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              position: "relative",
              p: { xs: 2.2, sm: 2.7 },
              pl: { xs: 2.2, sm: 8 },
              borderRadius: "30px",
              color: FAMILY_COLORS.ink,
              backgroundColor: "#F6E8DA",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: 110,
                height: 110,
                left: -50,
                top: "50%",
                borderRadius: "50%",
                backgroundColor: FAMILY_COLORS.sun,
                transform: "translateY(-50%)",
              },
            }}
          >
            <Typography
              sx={{
                position: "relative",
                fontSize: { xs: "0.93rem", sm: "1rem" },
                lineHeight: 1.75,
                fontWeight: 550,
              }}
            >
              {description ||
                subtitle ||
                "Cada momento foi pensado para aproximar pais, responsáveis e crianças, criando um ambiente de alegria, comunhão e fé."}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: { xs: 4, md: 5.5 },
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: 1.15, md: 1.4 },
        }}
      >
        {programItems.map((item, index) => (
          <ProgramCard key={item.title} item={item} index={index} />
        ))}
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.4}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{
          mt: 3,
          p: { xs: 2, sm: 2.3 },
          borderRadius: "28px",
          color: FAMILY_COLORS.paper,
          backgroundColor: FAMILY_COLORS.ink,
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
            color: FAMILY_COLORS.ink,
            backgroundColor: FAMILY_COLORS.sun,
          }}
        >
          <HomeRoundedIcon />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1rem", fontWeight: 850 }}>
            Uma programação simples, acolhedora e pronta para o seu Clubinho
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: "rgba(255,255,255,.66)",
              fontSize: "0.8rem",
            }}
          >
            Adapte os momentos à realidade da sua turma e faça cada família se
            sentir em casa.
          </Typography>
        </Box>
      </Stack>
    </Container>
  </Box>
);
