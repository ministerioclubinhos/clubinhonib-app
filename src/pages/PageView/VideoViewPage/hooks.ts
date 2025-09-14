import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/slices";
import { setVideoData } from "@/store/slices/video/videoSlice";
import { fetchRoutes } from "@/store/slices/route/routeSlice";
import { videoPageApi, toVideoPageData } from "./api";

export const useVideoPage = (idToFetch: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const videoData = useSelector((s: RootState) => s.video.videoData);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const dto = await videoPageApi.getById(idToFetch);
            const data = toVideoPageData(dto);
            dispatch(setVideoData(data));
        } catch (e) {
            console.error(e);
            setError("Erro ao carregar a página de vídeos. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [dispatch, idToFetch]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await load();
            } finally {
                if (!mounted) return;
            }
        })();
        return () => {
            mounted = false;
        };
    }, [load]);

    const deletePage = useCallback(
        async (onSuccess?: () => void, onError?: (msg: string) => void) => {
            try {
                if (!videoData?.id) return;
                setIsDeleting(true);
                await videoPageApi.deleteById(videoData.id);
                await dispatch(fetchRoutes());
                onSuccess?.();
            } catch (e) {
                console.error(e);
                const msg = "Erro ao excluir a página. Tente novamente mais tarde.";
                setError(msg);
                onError?.(msg);
            } finally {
                setIsDeleting(false);
            }
        },
        [dispatch, videoData?.id]
    );

    return { videoData, loading, error, isDeleting, reload: load, deletePage } as const;
};
