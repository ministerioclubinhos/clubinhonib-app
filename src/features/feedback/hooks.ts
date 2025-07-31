import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { apiDeleteFeedback, apiListFeedbacks, apiMarkAsRead } from "./api";
import { setFeedbacks } from "@/store/slices/feedback/feedbackSlice";
import { FeedbackData } from "@/store/slices/feedback/feedbackSlice";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useFeedbackList() {
  const dispatch = useDispatch();
  const [items, setItems] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiListFeedbacks();
      setItems(data);
      dispatch(setFeedbacks(data));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Erro ao carregar feedbacks");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, setError, refresh, setItems };
}

export function useFeedbackSearch(items: FeedbackData[]) {
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    if (!term.trim()) return items;
    const t = term.toLowerCase();
    return items.filter((f) =>
      [f.name, f.email || "", f.comment, f.category]
        .some((field) => String(field).toLowerCase().includes(t))
    );
  }, [items, term]);

  return { search, setSearch, filtered };
}

export function useFeedbackMutations(refresh: () => Promise<void> | void) {
  const [mLoading, setLoading] = useState(false);
  const [mError, setError] = useState("");

  const deleteOne = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await apiDeleteFeedback(id);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Erro ao excluir feedback");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await apiMarkAsRead(id);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Erro ao marcar como lido");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return { mLoading, mError, setMError: setError, deleteOne, markAsRead };
}
