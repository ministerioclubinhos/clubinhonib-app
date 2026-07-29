import { useEffect } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
  MediaItem,
  MediaPlatform,
  MediaUploadType,
} from "@/store/slices/types";

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    } else if (parsedUrl.pathname.startsWith("/embed/")) {
      videoId = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] || "";
    } else if (parsedUrl.pathname.startsWith("/shorts/")) {
      videoId = parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    } else {
      videoId = parsedUrl.searchParams.get("v") || "";
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : null;
  } catch {
    return null;
  }
};

const getGoogleDriveEmbedUrl = (url: string) => {
  const fileId = url.match(/\/d\/([^/]+)/)?.[1];
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
};

const ExpandedVideo = ({ media }: { media: MediaItem }) => {
  if (
    media.isLocalFile ||
    media.uploadType === MediaUploadType.UPLOAD
  ) {
    return (
      <Box
        component="video"
        src={media.url}
        controls
        autoPlay
        playsInline
        sx={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          backgroundColor: "#000",
        }}
      />
    );
  }

  const embedUrl =
    media.platformType === MediaPlatform.YOUTUBE
      ? getYouTubeEmbedUrl(media.url)
      : media.platformType === MediaPlatform.GOOGLE_DRIVE
        ? getGoogleDriveEmbedUrl(media.url)
        : media.url;

  if (!embedUrl) return null;

  return (
    <Box
      component="iframe"
      src={embedUrl}
      title={media.title || "Vídeo expandido"}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      sx={{
        width: "100%",
        height: "100%",
        display: "block",
        border: 0,
        backgroundColor: "#000",
      }}
    />
  );
};

export const FamilyDayExpandedMedia = ({
  media,
  items,
  kind,
  onClose,
  onSelect,
}: {
  media: MediaItem | null;
  items: MediaItem[];
  kind: "image" | "video";
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}) => {
  const currentIndex = media
    ? items.findIndex((item) =>
        media.id && item.id ? item.id === media.id : item.url === media.url
      )
    : -1;
  const canNavigate = items.length > 1 && currentIndex >= 0;

  const navigate = (direction: -1 | 1) => {
    if (!canNavigate) return;
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    onSelect(items[nextIndex]);
  };

  useEffect(() => {
    if (!media || !canNavigate) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <Dialog
      open={Boolean(media)}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          m: 0,
          borderRadius: 0,
          backgroundColor: "rgba(12, 15, 16, 0.98)",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100dvh",
          display: "grid",
          placeItems: "center",
          p: { xs: 1, sm: 2 },
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Fechar visualização expandida"
          sx={{
            position: "absolute",
            zIndex: 3,
            top: { xs: 10, sm: 18 },
            right: { xs: 10, sm: 18 },
            width: { xs: 44, sm: 50 },
            height: { xs: 44, sm: 50 },
            color: "#fff",
            backgroundColor: "rgba(0,0,0,.62)",
            border: "1px solid rgba(255,255,255,.28)",
            backdropFilter: "blur(8px)",
            "&:hover": { backgroundColor: "rgba(0,0,0,.82)" },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        {canNavigate && (
          <>
            <NavigationButton
              direction="previous"
              onClick={() => navigate(-1)}
            />
            <NavigationButton direction="next" onClick={() => navigate(1)} />
          </>
        )}

        {media && kind === "image" && (
          <Box
            key={media.id || media.url}
            component="img"
            src={media.url}
            alt={media.title || "Imagem expandida do Dia da Família"}
            sx={{
              width: "auto",
              maxWidth: "96vw",
              height: "auto",
              maxHeight: "94dvh",
              display: "block",
              objectFit: "contain",
            }}
          />
        )}

        {media && kind === "video" && (
          <Box
            key={media.id || media.url}
            sx={{
              width: "min(96vw, 1680px)",
              maxHeight: "94dvh",
              aspectRatio: "16 / 9",
              backgroundColor: "#000",
              boxShadow: "0 28px 90px rgba(0,0,0,.5)",
            }}
          >
            <ExpandedVideo media={media} />
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

const NavigationButton = ({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) => {
  const isNext = direction === "next";

  return (
    <IconButton
      onClick={onClick}
      aria-label={isNext ? "Próxima mídia" : "Mídia anterior"}
      sx={{
        position: "absolute",
        zIndex: 3,
        top: "50%",
        [isNext ? "right" : "left"]: { xs: 8, sm: 20 },
        transform: "translateY(-50%)",
        width: { xs: 44, sm: 54 },
        height: { xs: 44, sm: 54 },
        color: "#fff",
        backgroundColor: "rgba(0,0,0,.62)",
        border: "1px solid rgba(255,255,255,.3)",
        boxShadow: "0 10px 30px rgba(0,0,0,.28)",
        backdropFilter: "blur(8px)",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,.85)",
          transform: "translateY(-50%) scale(1.05)",
        },
      }}
    >
      {isNext ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />}
    </IconButton>
  );
};
