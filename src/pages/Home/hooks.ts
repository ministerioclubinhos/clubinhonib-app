import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/slices';
import { setComments } from 'store/slices/comment/commentsSlice';
import api from '@/config/axiosConfig';

export const useComments = () => {
  const comments = useSelector((state: RootState) => state.comments.comments);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
  
    if (comments && comments.length > 0) return;

    const fetchComments = async () => {
      try {
        const response = await api.get('/comments/published');
        dispatch(setComments(response.data));
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
      }
    };
    fetchComments();
  }, [dispatch, comments]);

  return comments;
};

export const useAuth = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  return { isAuthenticated, user };
};
