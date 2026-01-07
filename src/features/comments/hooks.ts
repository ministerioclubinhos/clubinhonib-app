import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/slices';
import { CommentData, setComments } from 'store/slices/comment/commentsSlice';
import { apiDeleteComment, apiGetComments, apiPublishComment, apiUpdateComment } from './api';
import { debounce } from './utils';

export function useCommentsData() {
  const dispatch = useDispatch<AppDispatch>();
  const comments = useSelector((s: RootState) => s.comments.comments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetComments();
      dispatch(setComments(data));
    } catch (e: any) {
      setError('Erro ao buscar comentários');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, setError, fetchComments };
}

export function useCommentsFilter(comments: CommentData[] | null | undefined) {
  const [filtered, setFiltered] = useState<CommentData[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'unpublished'>('all');
  const [isFiltering, setIsFiltering] = useState(false);

  const applyFilter = useCallback(
    (term: string, s: typeof status) => {
      let result = comments || [];
      if (term.trim()) {
        const q = term.toLowerCase();
        result = result.filter(
          (c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.clubinho || '').toLowerCase().includes(q) ||
            (c.neighborhood || '').toLowerCase().includes(q)
        );
      }
      if (s === 'published') result = result.filter((c) => !!c.published);
      if (s === 'unpublished') result = result.filter((c) => !c.published);
      setFiltered(result);
      setIsFiltering(false);
    },
    [comments]
  );

  const debounced = useMemo(
    () => debounce((term: string) => applyFilter(term, status), 300),
    [applyFilter, status]
  );

  const onSearchChange = (term: string) => {
    setSearch(term);
    setIsFiltering(true);
    debounced(term);
  };

  useEffect(() => {
    applyFilter(search, status);
  }, [applyFilter, search, status]);
  useEffect(() => () => debounced.cancel(), [debounced]);

  return { filtered, search, onSearchChange, status, setStatus, isFiltering };
}

export function useCommentActions(fetchComments: () => Promise<void> | void) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const publish = useCallback(
    async (c: CommentData) => {
      setActionLoading(true);
      setActionError('');
      try {
        await apiPublishComment(c);
        await fetchComments();
      } catch (e: any) {
        setActionError('Erro ao publicar comentário');
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchComments]
  );

  const remove = useCallback(
    async (c: CommentData) => {
      if (!c.id) return;
      setActionLoading(true);
      setActionError('');
      try {
        await apiDeleteComment(c.id);
        await fetchComments();
      } catch (e: any) {
        setActionError('Erro ao deletar comentário');
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchComments]
  );

  const update = useCallback(
    async (
      c: CommentData,
      payload: {
        name: string;
        comment: string;
        clubinho: string;
        neighborhood: string;
        published?: boolean;
      }
    ) => {
      setActionLoading(true);
      setActionError('');
      try {
        await apiUpdateComment(c, payload);
        await fetchComments();
      } catch (e: any) {
        setActionError('Erro ao salvar comentário');
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchComments]
  );

  return { actionLoading, actionError, setActionError, publish, remove, update };
}
