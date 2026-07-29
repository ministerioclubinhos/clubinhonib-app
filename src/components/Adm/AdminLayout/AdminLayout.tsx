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
  Tooltip,
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
  Checklist,
  BarChart,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";
import { useFeatureFlags } from "@/hooks";

const drawerWidth = 240;

type NavItem = { label: string; to: string; icon: ReactNode };
type SectionId = "pessoas" | "clubinhos" | "conteudos" | "midias" | "materiais" | "interacoes" | "operacional";
type Section = { id: SectionId; title: string; items: NavItem[] };
type MobileTab = "tudo" | SectionId;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = !!isAuthenticated && user?.role === UserRole.ADMIN;
  const isCoordinator = !!isAuthenticated && user?.role === UserRole.COORDINATOR;
  const { flags } = useFeatureFlags();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("tudo");
  const toggleDrawer = () => setMobileOpen((v) => !v);

  const HEADER_H = 64;
  const FOOTER_H = 88;
  const cssVars = {
    "--app-header-h": `${HEADER_H}px`,
    "--app-footer-h": `${FOOTER_H}px`,
  } as React.CSSProperties;

  const allSections = useMemo<Section[]>(
    () => [
      {
        id: "pessoas",
        title: "Pessoas",
        items: [
          { label: "Perfis", to: "/adm/perfis", icon: <Group /> },
          { label: "Usuários", to: "/adm/usuarios", icon: <Group /> },
          { label: "Professores", to: "/adm/professores", icon: <School /> },
          { label: "Coordenadores", to: "/adm/coordenadores", icon: <SupervisorAccount /> },
          { label: "Crianças", to: "/adm/criancas", icon: <Groups /> },
        ],
      },
      {
        id: "clubinhos",
        title: "Clubinhos",
        items: [
          { label: "Clubinhos", to: "/adm/clubinhos", icon: <Groups /> },
          { label: "Pagelas", to: "/adm/pagelas", icon: <Groups /> },

        ],
      },
      {
        id: "conteudos",
        title: "Conteúdo",
        items: [
          { label: "Meditações", to: "/adm/meditacoes", icon: <MenuBook /> },
          { label: "Documentos", to: "/adm/documentos", icon: <Description /> },
          { label: "Informativos", to: "/adm/informativos", icon: <Campaign /> },
          { label: "Criar Página", to: "/adm/criar-pagina", icon: <NoteAdd /> },
          { label: "Páginas de ideias", to: "/adm/paginas-ideias", icon: <Lightbulb /> },
          { label: "Ideias compartilhadas", to: "/adm/ideias-compartilhadas", icon: <Lightbulb /> },
        ],
      },
      {
        id: "midias",
        title: "Mídias",
        items: [
          { label: "Páginas de fotos", to: "/adm/paginas-fotos", icon: <PhotoLibrary /> },
          { label: "Fotos dos clubinhos", to: "/adm/fotos-clubinhos", icon: <Collections /> },
          { label: "Páginas de vídeos", to: "/adm/paginas-videos", icon: <VideoLibrary /> },
        ],
      },
      {
        id: "materiais",
        title: "Materiais",
        items: [
          { label: "Materiais semanais", to: "/adm/paginas-materiais-semanais", icon: <EventNote /> },
        ],
      },
      {
        id: "interacoes",
        title: "Interações",
        items: [
          { label: "Comentários", to: "/adm/comentarios", icon: <Comment /> },
          { label: "Contatos", to: "/adm/contatos", icon: <ContactMail /> },
          { label: "Feedbacks", to: "/adm/feedbacks", icon: <RateReview /> },

        ],
      },
      {
        id: "operacional",
        title: "Operacional",
        items: [
          { label: "Controle de Clubinhos", to: "/adm/controle-clubinhos", icon: <Checklist /> },
          { label: "Estatísticas", to: "/adm/estatisticas", icon: <BarChart /> },
        ],
      },
    ],
    []
  );

  const coordinatorAllowed = new Set<string>([
    ...(flags.coordinator_children_access ? ["/adm/criancas"] : []),
    "/adm/professores",
    "/adm/clubinhos",
    "/adm/pagelas",
    "/adm/perfis",
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
    if (
      path.startsWith("/adm/usuarios") ||
      path.startsWith("/adm/professores") ||
      path.startsWith("/adm/coordenadores") ||
      path.startsWith("/adm/coordenadores") ||
      path.startsWith("/adm/criancas") ||
      path.startsWith("/adm/perfis")
    ) {
      return "pessoas";
    }

    if (
      path.startsWith("/adm/clubinhos") ||
      path.startsWith("/adm/pagelas") ||
      path.startsWith("/adm/controle-clubinhos")
    ) {
      return "clubinhos";
    }

    if (
      path.startsWith("/adm/meditacoes") ||
      path.startsWith("/adm/documentos") ||
      path.startsWith("/adm/informativos") ||
      path.startsWith("/adm/criar-pagina") ||
      path.startsWith("/adm/paginas-ideias") ||
      path.startsWith("/adm/ideias-compartilhadas")
    ) {
      return "conteudos";
    }

    if (path.startsWith("/adm/paginas-fotos") || path.startsWith("/adm/fotos-") || path.startsWith("/adm/paginas-videos")) return "midias";

    if (path.startsWith("/adm/paginas-materiais-semanais")) return "materiais";

    return "interacoes";
  };

  const [expanded, setExpanded] = useState<SectionId | null>(sectionOfPath(location.pathname));

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const target = sectionOfPath(location.pathname);
    setExpanded((prev) => (prev === target ? prev : target));
  }, [location.pathname]);

  const handleAccordion =
    (panel: SectionId) => (_: React.SyntheticEvent, isExpanding: boolean) => {
      setExpanded((prev) => (isExpanding ? panel : prev === panel ? null : prev));
    };

  const handleNavigate = (to: string) => {
    navigate(to);
    if (isMobile) setMobileOpen(false);
  };

  const visibleSections =
    isMobile && mobileTab !== "tudo" ? sections.filter((s) => s.id === mobileTab) : sections;

  const labelMap: Record<MobileTab, string> = {
    tudo: "tudo",
    pessoas: "pessoas",
    clubinhos: "clubinhos",
    conteudos: "conteúdo",
    midias: "mídias",
    materiais: "materiais",
    interacoes: "interações",
    operacional: "operacional",
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ pb: 1, pt: 1, px: 2, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
        {!sidebarCollapsed && (
          <Typography variant="subtitle1" fontWeight="bold">
            Painel Admin
          </Typography>
        )}
        <Tooltip title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>
          <IconButton
            size="small"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
          >
            {sidebarCollapsed ? (
              <ChevronRight fontSize="small" />
            ) : (
              <ChevronLeft fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
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
            {(["tudo", "pessoas", "clubinhos", "conteudos", "midias", "materiais", "interacoes"] as MobileTab[]).map((tab) => (
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
            expandIcon={sidebarCollapsed ? null : <ExpandMore />}
            sx={{
              px: sidebarCollapsed ? 1 : 2,
              py: 1,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              bgcolor: sidebarCollapsed && expanded === sec.id ? 'rgba(0,0,0,0.02)' : 'transparent',
              "& .MuiAccordionSummary-content": {
                alignItems: "center",
                my: 0.25,
                flexGrow: sidebarCollapsed ? 0 : 1,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              },
              "&:hover": { bgcolor: sidebarCollapsed && expanded === sec.id ? 'rgba(0,0,0,0.04)' : "action.hover" },
            }}
          >
            {!sidebarCollapsed ? (
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ fontSize: isMobile ? 11 : undefined }}
              >
                {sec.title}
              </Typography>
            ) : (
              <Tooltip title={sec.title} placement="right">
                <Box sx={{ display: 'flex', color: expanded === sec.id ? 'text.primary' : 'text.secondary' }}>
                  {sec.items[0]?.icon}
                </Box>
              </Tooltip>
            )}
          </AccordionSummary>

          <AccordionDetails
            sx={{
              p: 0,
              ...(sidebarCollapsed && expanded === sec.id
                ? {
                  bgcolor: 'rgba(0,0,0,0.02)',
                  py: 0.5,
                }
                : {}),
            }}
          >
            <List dense disablePadding>
              {sec.items.map((item) => {
                const selected =
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/");
                return (
                  <Tooltip key={item.to} title={sidebarCollapsed ? item.label : ""} placement="right">
                    <ListItemButton
                      selected={selected}
                      onClick={() => handleNavigate(item.to)}
                      sx={{
                        py: 1,
                        px: sidebarCollapsed ? 1 : 2,
                        justifyContent: sidebarCollapsed ? "center" : "flex-start",
                        borderRadius: sidebarCollapsed ? 1 : 0,
                        "& .MuiListItemText-primary": { fontSize: isMobile ? 13 : undefined },
                        "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                          fontSize: sidebarCollapsed ? "1.2rem" : (isMobile ? "1.1rem" : undefined),
                        },
                        "&.Mui-selected": {
                          bgcolor: sidebarCollapsed ? "transparent" : "action.selected",
                          color: sidebarCollapsed ? "primary.main" : "inherit",
                          "&:hover": { bgcolor: sidebarCollapsed ? "transparent" : "action.selected" },
                          "& .MuiListItemIcon-root": {
                            color: sidebarCollapsed ? "primary.main" : "inherit"
                          }
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 36, justifyContent: 'center', color: sidebarCollapsed && !selected ? "text.secondary" : "inherit" }}>
                        {item.icon}
                      </ListItemIcon>
                      {!sidebarCollapsed && <ListItemText primary={item.label} />}
                    </ListItemButton>
                  </Tooltip>
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
      style={cssVars}
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
          width: sidebarCollapsed ? 72 : drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiDrawer-paper": {
            width: sidebarCollapsed ? 72 : drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            boxSizing: "border-box",
            mt: isMobile ? 0 : `${HEADER_H}px`,
            height: isMobile
              ? "100vh"
              : `calc(100vh - var(--app-header-h))`,
            pb: isMobile ? 0 : "var(--app-footer-h)",
            zIndex: isMobile ? 1300 : 1000,
            borderRight: `1px solid ${theme.palette.divider}`,
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
          py: { xs: 0, md: 6 },
          mt: isMobile ? 2 : 0,
          bgcolor: "#f5f7fa",
          minHeight: `calc(100vh - var(--app-header-h))`,
          pb: { xs: "var(--app-footer-h)", md: "var(--app-footer-h)" },
        }}
      >
        {isMobile && <Toolbar sx={{ minHeight: 0, p: 0 }} />}
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
