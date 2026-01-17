import type { ReactElement } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Fab,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  NoteAdd,
  EventNote,
  PhotoLibrary,
  Collections,
  VideoLibrary,
  Description,
  Comment,
  Campaign,
  ContactPhone,
  Lightbulb,
  RateReview,
  Group,
  School,
  SupervisorAccount,
  Groups,
  MenuBook,
  ArrowUpward,
  ChevronRight,
  BarChart,
  Checklist,
} from "@mui/icons-material";

import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { UserRole } from "@/store/slices/auth/authSlice";

type SectionId = "all" | "pessoas" | "clubinhos" | "conteudos" | "midias" | "materiais" | "interacoes" | "operacional";

interface CardData {
  title: string;
  description: string;
  icon: ReactElement;
  path: string;
  section: Exclude<SectionId, "all">;
}

const cardData: CardData[] = [
  { title: "Criar Página", description: "Adicione novas páginas de conteúdo ao site.", icon: <NoteAdd fontSize="large" color="primary" />, path: "/adm/criar-pagina", section: "conteudos" },
  { title: "Meditações", description: "Crie, edite e visualize meditações semanais.", icon: <MenuBook fontSize="large" color="primary" />, path: "/adm/meditacoes", section: "conteudos" },
  { title: "Documentos", description: "Gerencie documentos para professores.", icon: <Description fontSize="large" color="primary" />, path: "/adm/documentos", section: "conteudos" },
  { title: "Informativos", description: "Gerencie banners informativos do site.", icon: <Campaign fontSize="large" color="primary" />, path: "/adm/informativos", section: "conteudos" },

  { title: "Usuários", description: "Gerencie usuários do clubinho.", icon: <Group fontSize="large" color="primary" />, path: "/adm/usuarios", section: "pessoas" },
  { title: "Professores", description: "Gerencie professores do clubinho.", icon: <School fontSize="large" color="primary" />, path: "/adm/professores", section: "pessoas" },
  { title: "Coordenadores", description: "Gerencie coordenadores do clubinho.", icon: <SupervisorAccount fontSize="large" color="primary" />, path: "/adm/coordenadores", section: "pessoas" },
  { title: "Crianças", description: "Gerencie crianças do clubinho.", icon: <Group fontSize="large" color="primary" />, path: "/adm/criancas", section: "pessoas" },

  { title: "Clubinhos", description: "Gerencie clubinhos.", icon: <Groups fontSize="large" color="primary" />, path: "/adm/clubinhos", section: "clubinhos" },
  { title: "Pagelas", description: "Gerencie pagelas.", icon: <Groups fontSize="large" color="primary" />, path: "/adm/pagelas", section: "clubinhos" },

  { title: "Galerias de Fotos", description: "Organize e edite galerias de imagens do site.", icon: <PhotoLibrary fontSize="large" color="primary" />, path: "/adm/paginas-fotos", section: "midias" },
  { title: "Fotos dos Clubinhos", description: "Organize e edite galerias de fotos dos Clubinhos.", icon: <Collections fontSize="large" color="primary" />, path: "/adm/fotos-clubinhos", section: "midias" },
  { title: "Vídeos", description: "Adicione vídeos ou links do YouTube para o site.", icon: <VideoLibrary fontSize="large" color="primary" />, path: "/adm/paginas-videos", section: "midias" },

  { title: "Materiais de Visita", description: "Gerencie conteúdos semanais.", icon: <EventNote fontSize="large" color="primary" />, path: "/adm/paginas-materiais-semanais", section: "materiais" },
  { title: "Páginas de Ideias", description: "Gerencie páginas de ideias para professores.", icon: <Lightbulb fontSize="large" color="primary" />, path: "/adm/paginas-ideias", section: "materiais" },
  { title: "Ideias Compartilhadas", description: "Gerencie Ideias compartilhadas pelos Clubinhos", icon: <Lightbulb fontSize="large" color="primary" />, path: "/adm/ideias-compartilhadas", section: "materiais" },

  { title: "Comentários", description: "Gerencie comentários dos usuários.", icon: <Comment fontSize="large" color="primary" />, path: "/adm/comentarios", section: "interacoes" },
  { title: "Contatos", description: "Gerencie contatos enviados para o Clubinho.", icon: <ContactPhone fontSize="large" color="primary" />, path: "/adm/contatos", section: "interacoes" },
  { title: "Feedbacks", description: "Gerencie feedbacks enviados para o Clubinho.", icon: <RateReview fontSize="large" color="primary" />, path: "/adm/feedbacks", section: "interacoes" },

  { title: "Controle de Clubinhos", description: "Verificação em tempo real de pagelas por clube.", icon: <Checklist fontSize="large" color="primary" />, path: "/adm/controle-clubinhos", section: "operacional" },
  { title: "Estatísticas", description: "Visualize estatísticas e análises completas.", icon: <BarChart fontSize="large" color="primary" />, path: "/adm/estatisticas", section: "operacional" },
];

const sectionLabels: Record<SectionId, string> = {
  all: "tudo",
  pessoas: "pessoas",
  clubinhos: "clubinhos",
  conteudos: "conteúdos",
  midias: "mídias",
  materiais: "materiais",
  interacoes: "interações",
  operacional: "operacional",
};

const order: Exclude<SectionId, "all">[] = ["pessoas", "clubinhos", "conteudos", "midias", "materiais", "interacoes", "operacional"];
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;
  const isAdmin = !!isAuthenticated && role === UserRole.ADMIN;
  const isCoordinator = !!isAuthenticated && role === UserRole.COORDINATOR;
  const isSimpleMode = isCoordinator && !isAdmin;

  const [query, setQuery] = React.useState("");
  const [section, setSection] = React.useState<SectionId>("all");
  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setShowTop(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const normalizedQuery = query.trim().toLowerCase();
  const coordinatorAllowed = new Set<string>([
    "/adm/criancas",
    "/adm/professores",
    "/adm/clubinhos",
    "/adm/pagelas",
  ]);

  const canSeeCard = (card: CardData): boolean => {
    if (isAdmin) return true;
    if (isCoordinator) return coordinatorAllowed.has(card.path);
    return false;
  };

  const visibleCards = React.useMemo(
    () => cardData.filter(canSeeCard),
    [isAdmin, isCoordinator]
  );

  const grouped = React.useMemo(() => {
    const g: Record<Exclude<SectionId, "all">, CardData[]> = {
      pessoas: [],
      clubinhos: [],
      conteudos: [],
      midias: [],
      materiais: [],
      interacoes: [],
      operacional: [],
    };
    for (const c of visibleCards) {
      const inSection = section === "all" ? true : c.section === section;
      if (!inSection) continue;
      if (normalizedQuery) {
        const hay = `${c.title} ${c.description}`.toLowerCase();
        if (!hay.includes(normalizedQuery)) continue;
      }
      g[c.section].push(c);
    }
    return g;
  }, [section, normalizedQuery, visibleCards]);

  const hasResults =
    grouped.pessoas.length + grouped.clubinhos.length + grouped.conteudos.length + grouped.midias.length + grouped.materiais.length + grouped.interacoes.length + grouped.operacional.length >
    0;

  const MobileList: React.FC = () => {
    const allFiltered = order.flatMap((sec) => grouped[sec]);

    return (
      <Box sx={{ width: "100%", px: 2, pb: 8, mt: 0, pt: 0 }}>
        {!isSimpleMode && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              pt: 0,

              pb: 1.25,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TextField
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar… (ex.: fotos, usuários, vídeos)"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
                gap: 0.5,
              }}
            >
              {(["all", "pessoas", "clubinhos", "conteudos", "midias", "materiais", "interacoes", "operacional"] as SectionId[]).map((key) => (
                <Button
                  key={key}
                  size="small"
                  variant={section === key ? "contained" : "outlined"}
                  onClick={() => setSection(key)}
                  sx={{
                    textTransform: "none",
                    justifyContent: "center",
                    px: 1,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: 12,
                    lineHeight: 1.2,
                    minWidth: 0,
                  }}
                >
                  {sectionLabels[key]}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {!isSimpleMode &&
          order.map((sec) =>
            grouped[sec].length ? (
              <Box key={sec} sx={{ mt: 2 }}>
                {section === "all" && (
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ pl: 0.5, letterSpacing: 0.4 }}
                  >
                    {sectionLabels[sec]}
                  </Typography>
                )}
                <List dense sx={{ mt: section === "all" ? 0.5 : 1 }}>
                  {grouped[sec].map((card) => (
                    <Paper
                      key={card.path}
                      variant="outlined"
                      sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}
                    >
                      <ListItemButton onClick={() => navigate(card.path)}>
                        <ListItemIcon sx={{ minWidth: 40 }}>{card.icon}</ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={700}>
                              {card.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {card.description}
                            </Typography>
                          }
                        />
                        <ChevronRight />
                      </ListItemButton>
                    </Paper>
                  ))}
                </List>
              </Box>
            ) : null
          )}

        {isSimpleMode && (
          <>
            <List dense sx={{ mt: 2 }}>
              {allFiltered.map((card) => (
                <Paper
                  key={card.path}
                  variant="outlined"
                  sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}
                >
                  <ListItemButton onClick={() => navigate(card.path)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{card.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={700}>
                          {card.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {card.description}
                        </Typography>
                      }
                    />
                    <ChevronRight />
                  </ListItemButton>
                </Paper>
              ))}
            </List>

            {allFiltered.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Nada disponível para seu perfil.
                </Typography>
              </Box>
            )}
          </>
        )}

        {!hasResults && !isSimpleMode && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Nada encontrado para “{query}”.
            </Typography>
          </Box>
        )}

        {showTop && (
          <Fab
            color="primary"
            size="small"
            aria-label="Voltar ao topo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ position: "fixed", bottom: 88, right: 16 }}
          >
            <ArrowUpward />
          </Fab>
        )}
      </Box>
    );
  };

  const DesktopGrid: React.FC = () => {
    const allFiltered = order.flatMap((sec) => grouped[sec]);
    const greetName =
      (user?.name && user.name.split(" ")[0]) || (isAdmin ? "Admin" : isCoordinator ? "Coordenador(a)" : "Usuário");
    return (
      <Box sx={{ width: "100%", px: { xs: 2, md: 6 }, pt: { xs: 4, md: 0 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign={{ xs: "center", md: "left" }}
          mb={3}
          sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, color: "primary.main" }}
        >
          Bem-vindo(a), {greetName} 👋
        </Typography>

        {!isSimpleMode && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center", mb: 3 }}>
            <TextField
              placeholder="Buscar…"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 360, mr: 1 }}
            />
            {(["all", "pessoas", "clubinhos", "conteudos", "midias", "materiais", "interacoes", "operacional"] as SectionId[]).map((key) => (
              <Button
                key={key}
                variant={section === key ? "contained" : "outlined"}
                onClick={() => setSection(key)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {sectionLabels[key]}
              </Button>
            ))}
          </Box>
        )}

        {!isSimpleMode && <Divider sx={{ mb: 3 }} />}

        <Grid container spacing={3}>
          {allFiltered.map((card) => (
            <Grid item key={card.path} xs={12} sm={6} md={4} lg={3}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  transition: "transform .12s ease, box-shadow .12s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ mb: 1.5 }}>{card.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(card.path)}
                  aria-label={`Acessar ${card.title}`}
                >
                  Acessar
                </Button>
              </Paper>
            </Grid>
          ))}

          {allFiltered.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  Nada disponível para seu perfil.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return isMobile ? <MobileList /> : <DesktopGrid />;
}
