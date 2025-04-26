import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiAxios from '../../../config/axiosConfig';

export enum RoleUser {
  ADMIN = 'admin',
  USER = 'user',
}

interface User {
  id: string;
  email: string;
  name: string;
  role: RoleUser;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  loadingUser: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loadingUser: false,
  error: null,
};

const log = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;

    if (!token || typeof token !== 'string' || token.trim() === '') {
      log('[Auth] Nenhum token válido encontrado.');
      return rejectWithValue('No valid access token found');
    }

    try {
      const response = await apiAxios.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      log('[Auth] Usuário carregado com sucesso via /auth/me:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar usuário';
      log('[Auth] Erro ao buscar usuário:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user?: User }>
    ) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken.replace(/^"|"$/g, '');
      state.refreshToken = refreshToken.replace(/^"|"$/g, '');
      state.isAuthenticated = true;
      if (user) state.user = user; // Atualiza o user apenas se fornecido
      state.error = null;
      log('[AuthSlice] Login realizado com sucesso:', { user });
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      log('[AuthSlice] Logout realizado.');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loadingUser = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loadingUser = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loadingUser = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload || 'Erro desconhecido';
      });
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
