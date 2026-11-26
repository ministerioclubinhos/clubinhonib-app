/** Mínimo da YouTube IFrame Player API que o Play usa (sem `any`). */
export interface YouTubePlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YouTubePlayerEvent {
  data: number;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onStateChange?: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api';
let loading: Promise<YouTubeNamespace> | null = null;

/** Carrega a API do YouTube uma única vez por página. */
export function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loading) return loading;

  loading = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error('YouTube API indisponível'));
    };
    const script = document.createElement('script');
    script.src = YOUTUBE_API_SRC;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error('Falha ao carregar a API do YouTube'));
    };
    document.head.appendChild(script);
  });
  return loading;
}
