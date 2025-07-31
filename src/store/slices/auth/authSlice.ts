import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiAxios from '@/config/axiosConfig';

export enum RoleUser {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  TEACHER = 'teacher',
}

interface User {
  id: string;
  email: string;
  name: string;
  role: RoleUser;
  active?: boolean;
  commonUser?: boolean;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  completed?: boolean;
}

interface GoogleUser {
  name: string;
  email: string;
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
  googleUser: GoogleUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loadingUser: false,
  error: null,
  googleUser: null,
};

const IS_DEV = import.meta.env.DEV === true;
const DEBUG_AUTH = import.meta.env.VITE_DEBUG_AUTH === 'true';

const log = (message: string, ...args: any[]) => {
  if (IS_DEV || DEBUG_AUTH) {
    console.debug(message, ...args);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao buscar usuário';
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
      if (user) state.user = user;
      state.error = null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.googleUser = null;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setGoogleUser: (state, action: PayloadAction<GoogleUser>) => {
      state.googleUser = action.payload;
    },
    clearGoogleUser: (state) => {
      state.googleUser = null;
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
        state.error = (action.payload as string) || 'Erro desconhecido';
      });
  },
});

export const { login, logout, setError, setGoogleUser, clearGoogleUser } = authSlice.actions;
export default authSlice.reducer;
