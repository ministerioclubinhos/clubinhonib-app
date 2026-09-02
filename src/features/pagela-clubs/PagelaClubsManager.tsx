import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Stack,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Grid,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { SectionHeader } from "./components/SectionHeader";
import { ClubsPanel } from "./components/ClubsPanel";
import { PagelasPanel } from "./components/PagelasPanel";
import { ChildrenPanel } from "./components/ChildrenPanel";

import type { ClubResponse } from "@/features/clubs/types";
import type { ChildResponseDto } from "@/features/children/types";
import BackHeader from "@/components/common/header/BackHeader";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

import { CLUBS_SUBTITLE, CLUBS_SUBTITLE_MOBILE } from "./constants";
import { viewerScopeOf } from "./utils";
import type { PagelaBrowseStep } from "./types";

export default function PagelaClubsManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // A API já devolve só o que cada papel alcança; o alcance aqui muda apenas
  // o texto, para o coordenador não achar que está vendo a rede inteira.
  const isAdmin = useSelector(selectIsAdmin);
  const scope = viewerScopeOf(isAdmin);

  const [selectedClub, setSelectedClub] = useState<ClubResponse | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildResponseDto | null>(null);
  const [mobileStep, setMobileStep] = useState<PagelaBrowseStep>("clubs");

  useEffect(() => {
    if (!isMobile) return;
    if (!selectedClub) setMobileStep("clubs");
    else if (!selectedChild) setMobileStep("children");
    else setMobileStep("pagelas");
  }, [isMobile, selectedClub, selectedChild]);

  const handleBack = () => {
    if (!isMobile) return;
    if (mobileStep === "pagelas") {
      setSelectedChild(null);
      setMobileStep("children");
    } else if (mobileStep === "children") {
      setSelectedClub(null);
      setMobileStep("clubs");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          {isMobile && mobileStep !== "clubs" ? (
            <>
              <IconButton aria-label="voltar" onClick={handleBack} edge="start">
                <ArrowBackIcon />
              </IconButton>

              <Typography
                component="h1"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                  letterSpacing: { xs: 0.2, md: 0.3 },
                }}
              >
                Clubinhos ▸ Crianças ▸ Pagelas
              </Typography>
            </>
          ) : (
            <>
              {isMobile && (
                <BackHeader title="Clubinhos▸Crianças▸Pagelas" mobileFontSize="1rem" />
              )}
            </>
          )}

          {!isMobile && (
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} aria-label="breadcrumb" maxItems={3}>
              <MuiLink
                component="button"
                onClick={() => {
                  setSelectedClub(null);
                  setSelectedChild(null);
                }}
              >
                Clubinhos
              </MuiLink>
              {selectedClub && (
                <MuiLink component="button" onClick={() => setSelectedChild(null)}>
                  Clubinho #{selectedClub.number}
                </MuiLink>
              )}
              {selectedChild && <Typography color="text.primary">{selectedChild.name}</Typography>}
            </Breadcrumbs>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          p: 2,
        }}
      >
        {!isMobile && (
          <Grid
            container
            spacing={2}
            sx={{
              height: "100%",
              minHeight: 0,
            }}
          >
            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader context="clubs" title="Clubinhos" subtitle={CLUBS_SUBTITLE[scope]} />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ClubsPanel
                      onSelect={(club) => {
                        setSelectedClub(club);
                        setSelectedChild(null);
                      }}
                      selectedId={selectedClub?.id || null}
                      scope={scope}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader
                    context="children"
                    title="Crianças"
                    subtitle={selectedClub ? `Clubinho #${selectedClub.number}` : "Escolha um Clubinho"}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ChildrenPanel
                      club={selectedClub}
                      onSelect={(child) => setSelectedChild(child)}
                      selectedId={selectedChild?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader
                    context="pagelas"
                    title="Pagelas"
                    subtitle={selectedChild ? selectedChild.name : "Escolha uma criança"}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <PagelasPanel child={selectedChild} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {isMobile && (
          <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
            {mobileStep === "clubs" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader context="clubs" title="Clubinhos" subtitle={CLUBS_SUBTITLE_MOBILE[scope]} />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ClubsPanel
                      onSelect={(club) => {
                        setSelectedClub(club);
                        setSelectedChild(null);
                        setMobileStep("children");
                      }}
                      selectedId={selectedClub?.id || null}
                      scope={scope}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {mobileStep === "children" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader
                    context="children"
                    title="Crianças"
                    subtitle={selectedClub ? `Clubinho #${selectedClub.number}` : undefined}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ChildrenPanel
                      club={selectedClub}
                      onSelect={(child) => {
                        setSelectedChild(child);
                        setMobileStep("pagelas");
                      }}
                      selectedId={selectedChild?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {mobileStep === "pagelas" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader context="pagelas" title="Pagelas" subtitle={selectedChild ? selectedChild.name : undefined} />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <PagelasPanel child={selectedChild} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
