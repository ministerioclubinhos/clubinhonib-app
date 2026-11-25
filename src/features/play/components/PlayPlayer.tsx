import { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';

import { MediaPlatform, MediaUploadType } from '@/store/slices/types';
import VideoPlayer from '@/pages/PageView/VideoViewPage/VideoPlayer';
import { getYouTubeId } from '@/utils/video';
import { PLAY_PROGRESS_INTERVAL_MS } from '../constants';
import type { PlayVideo } from '../types';
import { toMediaItem } from '../utils';
import { loadYouTubeApi, type YouTubePlayer } from './youtubeApi';

interface PlayPlayerProps {
  video: PlayVideo;
  /** Segundo em que começar (retomar de onde parou). */
  startAt: number;
  /** Disparado uma vez quando o vídeo começa a tocar. */
  onStart: () => void;
  onProgress: (positionSeconds: number, durationSeconds: number) => void;
  onEnded: () => void;
}

const FRAME_SX = {
  borderRadius: { xs: 0, sm: 3 },
  overflow: 'hidden',
  bgcolor: 'black',
  aspectRatio: '16 / 9',
  width: '100%',
} as const;

/** Arquivo enviado: `<video>` nativo, com retomada, progresso e fim. */
function UploadPlayer({ video, startAt, onStart, onProgress, onEnded }: PlayPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const lastSent = useRef(0);

  const report = () => {
    const element = ref.current;
    if (!element || !Number.isFinite(element.duration)) return;
    onProgress(Math.floor(element.currentTime), Math.floor(element.duration));
  };

  return (
    <Paper elevation={0} sx={FRAME_SX}>
      <Box
        ref={ref}
        component="video"
        controls
        autoPlay
        playsInline
        preload="metadata"
        src={video.url}
        sx={{ width: '100%', height: '100%', display: 'block', bgcolor: 'black' }}
        onLoadedMetadata={() => {
          if (ref.current && startAt > 0) ref.current.currentTime = startAt;
        }}
        onPlay={() => {
          if (started.current) return;
          started.current = true;
          onStart();
        }}
        onTimeUpdate={() => {
          const now = Date.now();
          if (now - lastSent.current < PLAY_PROGRESS_INTERVAL_MS) return;
          lastSent.current = now;
          report();
        }}
        onPause={report}
        onEnded={() => {
          report();
          onEnded();
        }}
      />
    </Paper>
  );
}

/** YouTube: IFrame API para saber o ponto, o fim e retomar. */
function YouTubePlayerView({ video, startAt, onStart, onProgress, onEnded }: PlayPlayerProps) {
  const host = useRef<HTMLDivElement>(null);
  // Os callbacks mudam a cada render; o player é criado uma vez por vídeo.
  const callbacks = useRef({ onStart, onProgress, onEnded });
  callbacks.current = { onStart, onProgress, onEnded };

  useEffect(() => {
    const videoId = getYouTubeId(video.url);
    const element = host.current;
    if (!videoId || !element) return undefined;

    let player: YouTubePlayer | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let started = false;
    let cancelled = false;

    const report = () => {
      if (!player) return;
      const duration = Math.floor(player.getDuration());
      if (duration > 0) callbacks.current.onProgress(Math.floor(player.getCurrentTime()), duration);
    };

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        const mount = document.createElement('div');
        element.appendChild(mount);
        player = new YT.Player(mount, {
          videoId,
          playerVars: { autoplay: 1, start: startAt, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                if (!started) {
                  started = true;
                  callbacks.current.onStart();
                }
                if (!timer) timer = setInterval(report, PLAY_PROGRESS_INTERVAL_MS);
              } else {
                if (timer) {
                  clearInterval(timer);
                  timer = undefined;
                }
                if (event.data === YT.PlayerState.PAUSED) report();
                if (event.data === YT.PlayerState.ENDED) {
                  report();
                  callbacks.current.onEnded();
                }
              }
            },
          },
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      report();
      player?.destroy();
      element.replaceChildren();
    };
    // O player pertence ao vídeo: só recria quando o vídeo muda.
  }, [video.id]);

  return (
    <Paper elevation={0} sx={FRAME_SX}>
      <Box
        ref={host}
        sx={{
          width: '100%',
          height: '100%',
          '& iframe': { width: '100%', height: '100%', border: 0 },
        }}
      />
    </Paper>
  );
}

/** Demais plataformas (Drive, OneDrive…): só embute; conta a visualização ao abrir. */
function EmbedPlayer({ video, onStart }: PlayPlayerProps) {
  useEffect(() => {
    onStart();
    // Uma visualização por vídeo aberto.
  }, [video.id]);
  return <VideoPlayer video={toMediaItem(video)} />;
}

/** Player do Play: escolhe a implementação pela origem do vídeo. */
export default function PlayPlayer(props: PlayPlayerProps) {
  const { video } = props;
  if (video.uploadType === MediaUploadType.UPLOAD || video.isLocalFile) {
    return <UploadPlayer key={video.id} {...props} />;
  }
  if (video.platformType === MediaPlatform.YOUTUBE && getYouTubeId(video.url)) {
    return <YouTubePlayerView key={video.id} {...props} />;
  }
  return <EmbedPlayer key={video.id} {...props} />;
}
