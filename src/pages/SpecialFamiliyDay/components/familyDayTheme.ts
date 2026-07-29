import { createTheme } from "@mui/material";

export const FAMILY_COLORS = {
  ink: "#342B27",
  muted: "#73645D",
  cream: "#FFF8EF",
  creamDeep: "#F8EBDD",
  paper: "#FFFFFF",
  terracotta: "#D65D43",
  terracottaDark: "#A93F2B",
  peach: "#F4C2AA",
  sun: "#F3B63F",
  teal: "#2D7A73",
  tealDark: "#205B57",
  mint: "#C5DED1",
  sky: "#6D9FC7",
  skyLight: "#DCEAF4",
  line: "#E9DCD1",
} as const;

export const familyDayTheme = createTheme({
  palette: {
    primary: {
      main: FAMILY_COLORS.terracotta,
      contrastText: FAMILY_COLORS.paper,
    },
    secondary: {
      main: FAMILY_COLORS.teal,
      contrastText: FAMILY_COLORS.paper,
    },
    background: {
      default: FAMILY_COLORS.cream,
      paper: FAMILY_COLORS.paper,
    },
    text: {
      primary: FAMILY_COLORS.ink,
      secondary: FAMILY_COLORS.muted,
    },
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: "'Poppins', Arial, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.055em" },
    h2: { fontWeight: 850, letterSpacing: "-0.045em" },
    h3: { fontWeight: 850, letterSpacing: "-0.035em" },
    h4: { fontWeight: 800, letterSpacing: "-0.025em" },
    button: { fontWeight: 800, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: "none",
          paddingInline: 22,
        },
      },
    },
  },
});

export const sectionWidthSx = {
  width: "90%",
  maxWidth: "none",
  px: "0 !important",
} as const;

export const sliderBaseSx = {
  minWidth: 0,
  ".slick-list": { overflow: "hidden" },
  ".slick-track": { display: "flex", alignItems: "stretch" },
  ".slick-slide": { height: "auto" },
  ".slick-slide > div": { height: "100%" },
} as const;
