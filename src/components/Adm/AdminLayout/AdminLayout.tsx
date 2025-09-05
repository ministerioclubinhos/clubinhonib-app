import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  EventNote,
  PhotoLibrary,
  Collections,
  VideoLibrary,
  Lightbulb,
  MenuBook,
  Description,
  Comment,
  Campaign,
  ContactMail,
  RateReview,
  Group,
  School,
  SupervisorAccount,
  Groups,
  NoteAdd,
  ExpandMore,
} from "@mui/icons-material";

// 👇 imports adicionados
import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { RoleUser } from "@/store/slices/auth/authSlice";

const drawerWidth = 240;

type NavItem = { label: string; to: string; icon: ReactNode };
type SectionId = "pages" | "conteudos" | "clubinho" | "operacional";
type Section = { id: SectionId; title: string; items: NavItem[] };
type MobileTab = "tudo" | SectionId;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 👇 estado de auth
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = !!isAuthenticated && user?.role === RoleUser.ADMIN;
  const isCoordinator = !!isAuthenticated && user?.role === RoleUser.COORDINATOR;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("tudo");
  const toggleDrawer = () => setMobileOpen((v) => !v);

  const allSections = useMemo<Section[]>(
    () => [
      {
        id: "pages",
        title: "Páginas",
        items: [
          { label: "Materiais semanais", to: "/adm/paginas-materiais-semanais", icon: <EventNote /> },
          { label: "Páginas de fotos", to: "/adm/paginas-fotos", icon: <PhotoLibrary /> },
          { label: "Fotos dos clubinhos", to: "/adm/fotos-clubinhos", icon: <Collections /> },
          { label: "Páginas de vídeos", to: "/adm/paginas-videos", icon: <VideoLibrary /> },
          { label: "Páginas de ideias", to: "/adm/paginas-ideias", icon: <Lightbulb /> },
        ],
      },
      {
        id: "conteudos",
        title: "Conteúdos",
        items: [
          { label: "Meditações", to: "/adm/meditacoes", icon: <MenuBook /> },
          { label: "Documentos", to: "/adm/documentos", icon: <Description /> },
          { label: "Informativos", to: "/adm/informativos", icon: <Campaign /> },
          { label: "Criar Página", to: "/adm/criar-pagina", icon: <NoteAdd /> },
        ],
      },
      {
        id: "clubinho",
        title: "Clubinho",
        items: [
          { label: "Clubinhos", to: "/adm/clubinhos", icon: <Groups /> },
          { label: "Pagelas", to: "/adm/pagelas", icon: <Groups /> },
          { label: "Usuários", to: "/adm/usuarios", icon: <Group /> },
          { label: "Professores", to: "/adm/professores", icon: <School /> },
          { label: "Coordenadores", to: "/adm/coordenadores", icon: <SupervisorAccount /> },
          { label: "Crianças", to: "/adm/criancas", icon: <Groups /> },
        ],
      },
      {
        id: "operacional",
        title: "Operacional",
        items: [
          { label: "Feedbacks", to: "/adm/feedbacks", icon: <RateReview /> },
          { label: "Comentários", to: "/adm/comentarios", icon: <Comment /> },
          { label: "Contatos", to: "/adm/contatos", icon: <ContactMail /> },
        ],
      },
    ],
    []
  );

  const coordinatorAllowed = new Set<string>([
    "/adm/criancas",
    "/adm/professores",
    "/adm/clubinhos",
    "/adm/pagelas",
  ]);

  const canSeeItem = (item: NavItem): boolean => {
    if (isAdmin) return true;
    if (isCoordinator) return coordinatorAllowed.has(item.to);
    return false;
  };

  const sections = useMemo<Section[]>(() => {
    const filtered = allSections
      .map((sec) => ({ ...sec, items: sec.items.filter(canSeeItem) }))
      .filter((sec) => sec.items.length > 0);
    return filtered;
  }, [allSections, isAdmin, isCoordinator]);

  const sectionOfPath = (path: string): SectionId => {
    if (path.startsWith("/adm/paginas-") || path.startsWith("/adm/fotos-")) return "pages";
    if (
      path.startsWith("/adm/meditacoes") ||
      path.startsWith("/adm/documentos") ||
      path.startsWith("/adm/informativos") ||
      path.startsWith("/adm/criar-pagina")
    ) {
      return "conteudos";
    }
    if (
      path.startsWith("/adm/usuarios") ||
      path.startsWith("/adm/clubinhos") ||
      path.startsWith("/adm/pagelas") ||
      path.startsWith("/adm/professores") ||
      path.startsWith("/adm/coordenadores") ||
      path.startsWith("/adm/criancas")
    ) {
      return "clubinho";
    }
    return "operacional";
  };

  const [expanded, setExpanded] = useState<SectionId | null>(sectionOfPath(location.pathname));

  useEffect(() => {
    const target = sectionOfPath(location.pathname);
    setExpanded((prev) => (prev === target ? prev : target));
  }, [location.pathname]);

  const handleAccordion =
    (panel: SectionId) => (_: React.SyntheticEvent, isExpanding: boolean) =>
      setExpanded((prev) => (isExpanding ? panel : prev === panel ? null : prev));

  const handleNavigate = (to: string) => {
    navigate(to);
    if (isMobile) setMobileOpen(false);
  };

  const visibleSections =
    isMobile && mobileTab !== "tudo" ? sections.filter((s) => s.id === mobileTab) : sections;

  const labelMap: Record<MobileTab, string> = {
    tudo: "tudo",
    pages: "pages",
    conteudos: "conteúdos",
    clubinho: "clubinho",
    operacional: "operacional",
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ pb: 2, pt: 1, px: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Painel Admin
        </Typography>
      </Box>
      <Divider />

      {isMobile && (
        <Box sx={{ px: 1.25, py: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
              gap: 0.5,
            }}
          >
            {(["tudo", "pages", "conteudos", "clubinho", "operacional"] as MobileTab[]).map((tab) => (
              <Button
                key={tab}
                size="small"
                variant={mobileTab === tab ? "contained" : "outlined"}
                onClick={() => setMobileTab(tab)}
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
                {labelMap[tab]}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {visibleSections.map((sec) => (
        <Accordion
          key={sec.id}
          expanded={expanded === sec.id}
          onChange={handleAccordion(sec.id)}
          disableGutters
          square
          elevation={0}
          sx={{
            "&::before": { display: "none" },
            borderRadius: 0,
            bgcolor: "transparent",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              px: 2,
              py: 1,
              "& .MuiAccordionSummary-content": { alignItems: "center", my: 0.25 },
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              sx={{ fontSize: isMobile ? 11 : undefined }}
            >
              {sec.title}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            <List dense disablePadding>
              {sec.items.map((item) => {
                const selected =
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/");
                return (
                  <ListItemButton
                    key={item.to}
                    selected={selected}
                    onClick={() => handleNavigate(item.to)}
                    sx={{
                      py: 1,
                      px: 2,
                      "& .MuiListItemText-primary": { fontSize: isMobile ? 13 : undefined },
                      "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                        fontSize: isMobile ? "1.1rem" : undefined,
                      },
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                        "&:hover": { bgcolor: "action.selected" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </AccordionDetails>
          <Divider />
        </Accordion>
      ))}
    </>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        minHeight: "100vh",
        m: 0,
        p: 0,
      }}
    >
      {isMobile && (
        <AppBar position="fixed" color="inherit" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontSize: 18 }}>
              Administração
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: isMobile ? 0 : 8,
            overflowY: "auto",
            height: isMobile ? "100vh" : "calc(100vh - 64px)",
            zIndex: isMobile ? 1300 : "auto",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          px: { xs: 0, md: 4 },
          py: { xs: 4, md: 6 },
          mt: isMobile ? 8 : 0,
          bgcolor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        {isMobile && <Toolbar sx={{ minHeight: 0, p: 0 }} />}
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
