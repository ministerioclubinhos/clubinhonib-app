import { MediaPlatform, MediaItem, MediaUploadType } from "@/store/slices/types";

export function getYouTubeId(url?: string): string | null {
    if (!url) return null;
    const patterns = [
        /youtu\.be\/([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/,
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m?.[1]) return m[1];
    }
    const queryId = new URLSearchParams(url.split("?")?.[1]).get("v");
    return queryId || null;
}

export function getYouTubeThumb(id?: string | null, quality: "hq" | "mq" | "sd" = "hq") {
    if (!id) return undefined;
    const map = { hq: "hqdefault.jpg", mq: "mqdefault.jpg", sd: "sddefault.jpg" } as const;
    return `https://img.youtube.com/vi/${id}/${map[quality]}`;
}

export function getPreferredThumb(video: MediaItem): string | undefined {
    if (video.uploadType === MediaUploadType.UPLOAD && video.url) return undefined;
    if (video.uploadType === MediaUploadType.LINK && video.platformType === MediaPlatform.YOUTUBE) {
        return getYouTubeThumb(getYouTubeId(video.url), "hq");
    }
    return undefined;
}