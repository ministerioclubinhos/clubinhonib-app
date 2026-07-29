import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import Slider from "react-slick";

import { MediaItem } from "@/store/slices/types";
import WeekAudioPlayerView from "@/pages/PageView/WeekMaterialViewPage/WeekAudioPlayerView";
import WeekVideoPlayer from "@/pages/PageView/WeekMaterialViewPage/WeekVideoPlayerView";
import { FamilyDayExpandedMedia } from "./FamilyDayExpandedMedia";
import { CarouselArrow } from "./FamilyDayShared";
import { FAMILY_COLORS, sliderBaseSx } from "./familyDayTheme";

type MediaKind = "video" | "audio";

const mediaConfig = {
  video: {
    title: "Vídeos especiais",
    description: "Assista aos conteúdos de apoio sem sair da página.",
    singular: "vídeo",
    plural: "vídeos",
    color: "#4E7CA2",
    background: "#EAF3F8",
    border: "#C9DFEE",
    icon: <PlayCircleRoundedIcon />,
  },
  audio: {
    title: "Áudios especiais",
    description: "Músicas e materiais sonoros preparados para o encontro.",
    singular: "áudio",
    plural: "áudios",
    color: "#91630E",
    background: "#FFF2CD",
    border: "#ECD6A2",
    icon: <GraphicEqRoundedIcon />,
  },
} as const;

export const FamilyDayMediaCarousel = ({
  kind,
  items,
  compact = false,
}: {
  kind: MediaKind;
  items: MediaItem[];
  compact?: boolean;
}) => {
  const [expandedMedia, setExpandedMedia] = useState<MediaItem | null>(null);

  if (items.length === 0) return null;

  const config = mediaConfig[kind];

  return (
    <>
      <Box
        sx={{
          height: compact ? "100%" : "auto",
          mb: compact ? 0 : 2.2,
          p: { xs: 2, sm: 2.8 },
          borderRadius: "34px",
          border: `1px solid ${config.border}`,
          backgroundColor: config.background,
          overflow: "hidden",
        }}
      >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.4}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2.3 }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: "16px",
              color: config.color,
              backgroundColor: FAMILY_COLORS.paper,
            }}
          >
            {config.icon}
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: FAMILY_COLORS.ink,
                fontSize: { xs: "1.2rem", sm: "1.45rem" },
              }}
            >
              {config.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.2,
                color: FAMILY_COLORS.muted,
                fontSize: "0.78rem",
              }}
            >
              {config.description}
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={kind === "audio" ? <MusicNoteRoundedIcon /> : undefined}
          label={`${items.length} ${
            items.length === 1 ? config.singular : config.plural
          }`}
          sx={{
            color: config.color,
            backgroundColor: FAMILY_COLORS.paper,
            fontWeight: 850,
          }}
        />
      </Stack>

      <Box
        sx={{
          ...sliderBaseSx,
          mx: { xs: 0, sm: -0.7 },
          ".slick-dots": { bottom: -20 },
          ".slick-dots li button:before": {
            color: config.color,
            fontSize: 10,
          },
        }}
      >
        <Slider
          dots={items.length > 1}
          infinite={items.length > 1}
          speed={500}
          slidesToShow={compact ? 1 : Math.min(items.length, 2)}
          slidesToScroll={1}
          arrows={items.length > 1}
          nextArrow={<CarouselArrow direction="next" />}
          prevArrow={<CarouselArrow direction="previous" />}
          responsive={[
            {
              breakpoint: 900,
              settings: { slidesToShow: 1, arrows: items.length > 1 },
            },
            {
              breakpoint: 600,
              settings: { slidesToShow: 1, arrows: items.length > 1 },
            },
          ]}
        >
          {items.map((item) => (
            <Box
              key={item.id || item.url}
              sx={{ height: "100%", px: { xs: 0, sm: 0.7 }, pb: 2.6 }}
            >
              <Box sx={{ height: "100%", minWidth: 0 }}>
                {kind === "video" ? (
                  <WeekVideoPlayer
                    video={item}
                    compact
                    onExpand={() => setExpandedMedia(item)}
                  />
                ) : (
                  <WeekAudioPlayerView audio={item} compact />
                )}
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>
      </Box>

      {kind === "video" && (
        <FamilyDayExpandedMedia
          media={expandedMedia}
          items={items}
          kind="video"
          onClose={() => setExpandedMedia(null)}
          onSelect={setExpandedMedia}
        />
      )}
    </>
  );
};
