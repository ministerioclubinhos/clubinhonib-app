import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiAxios from '@/config/axiosConfig';

import {
  PersonalData,
  UserPreferences,
  ProfileImage,
  UserRole,
  TeacherProfileLite,
  CoordinatorProfileLite,
} from '@/types/shared';
import { authService } from './auth.service';
import { clearAuthTokens, readAuthTokens, sanitizeToken, writeAuthTokens } from './authStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cpf?: string | null;
  active?: boolean;
  commonUser?: boolean;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  completed?: boolean;
  teacherProfile?: TeacherProfileLite | null;
  coordinatorProfile?: CoordinatorProfileLite | null;
  personalData?: PersonalData;
  preferences?: UserPreferences;
  image?: ProfileImage;
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
  emailVerification?: {
    verificationEmailSent: boolean;
    message: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  loadingUser: boolean;
  initialized: boolean;
  error: string | null;
  googleUser: GoogleUser | null;
  emailVerificationAlert: { verificationEmailSent: boolean; message: string } | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loadingUser: false,
  initialized: false,
  error: null,
  googleUser: null,
  emailVerificationAlert: null,
};

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return rejectWithValue('No valid access token found');
    }

    try {
      const response = await apiAxios.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao buscar usuário';
      return rejectWithValue(errorMessage);
    }
  }
);

export const linkTeacherClub = createAsyncThunk<User, number, { rejectValue: string }>(
  'auth/linkTeacherClub',
  async (clubNumber, { dispatch, rejectWithValue }) => {
    try {
      await authService.linkTeacherClub(clubNumber);
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao vincular clubinho';
      return rejectWithValue(msg);
    }
  }
);

export const signOut = createAsyncThunk<void, void, { state: { auth: AuthState } }>(
  'auth/signOut',
  async (_, { dispatch, getState }) => {
    const { accessToken, refreshToken } = getState().auth;
    dispatch(logout());

    try {
      await authService.logout(refreshToken ?? undefined, accessToken ?? undefined);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Auth] Falha ao revogar sessão no servidor:', error);
      }
    }
  }
);

export const initAuth = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/initAuth',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const tokens = readAuthTokens();

      if (tokens) {
        dispatch(restoreSession(tokens));

        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (e) {
          const state = getState() as { auth: AuthState };
          if (!state.auth.accessToken || !state.auth.refreshToken) {
            dispatch(logout());
          }
          if (import.meta.env.DEV) {
            console.warn('[initAuth] Não foi possível validar a sessão:', e);
          }
        }
      } else {
        dispatch(logout());
      }
    } catch (e: any) {
      return rejectWithValue('Falha ao inicializar auth');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user?: User;
        emailVerification?: { verificationEmailSent: boolean; message: string };
      }>
    ) => {
      const { accessToken, refreshToken, user, emailVerification } = action.payload;
      state.accessToken = sanitizeToken(accessToken);
      state.refreshToken = sanitizeToken(refreshToken);
      state.isAuthenticated = true;
      if (user) state.user = user;
      if (emailVerification) {
        state.emailVerificationAlert = emailVerification;
      }
      state.error = null;
      writeAuthTokens({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      });
    },
    restoreSession: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = sanitizeToken(action.payload.accessToken);
      state.refreshToken = sanitizeToken(action.payload.refreshToken);
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    tokensRefreshed: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = sanitizeToken(action.payload.accessToken);
      state.refreshToken = sanitizeToken(action.payload.refreshToken);
      writeAuthTokens({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      });
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.googleUser = null;
      state.emailVerificationAlert = null;
      state.error = null;
      state.initialized = true;
      clearAuthTokens();
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
      .addCase(initAuth.pending, (state) => {
        state.loadingUser = true;
        state.initialized = false;
      })
      .addCase(initAuth.fulfilled, (state) => {
        state.loadingUser = false;
        state.initialized = true;
      })
      .addCase(initAuth.rejected, (state, action) => {
        console.warn('[Auth:reducer] initAuth.rejected', action.payload);
        state.loadingUser = false;
        state.initialized = true;
        state.error = (action.payload as string) || 'Falha ao inicializar auth';
      })
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
        console.warn('[Auth:reducer] fetchCurrentUser.rejected', action.payload);
        state.loadingUser = false;
        state.isAuthenticated = Boolean(state.user && state.accessToken && state.refreshToken);
        state.error = (action.payload as string) || 'Erro desconhecido';
      })
      .addCase(linkTeacherClub.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const {
  login,
  logout,
  restoreSession,
  tokensRefreshed,
  setError,
  setGoogleUser,
  clearGoogleUser,
} = authSlice.actions;
export default authSlice.reducer;
