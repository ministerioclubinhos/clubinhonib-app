import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import apiAxios from '@/config/axiosConfig';

import { PersonalData, UserPreferences, ProfileImage, UserRole, TeacherProfileLite, CoordinatorProfileLite } from '@/types/shared';

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

const IS_DEV = import.meta.env.DEV === true;

const clean = (s: string) => s.replace(/^"|"$/g, '');

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

export const initAuth = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/initAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const rawAccess = localStorage.getItem('accessToken');
      const rawRefresh = localStorage.getItem('refreshToken');

      if (rawAccess && rawRefresh) {
        const accessToken = clean(rawAccess);
        const refreshToken = clean(rawRefresh);
        dispatch(login({ accessToken, refreshToken }));

        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (e) {
          console.error('[initAuth] Error validating token, forcing logout', e);
          dispatch(logout());
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
      state.accessToken = clean(accessToken);
      state.refreshToken = clean(refreshToken);
      state.isAuthenticated = true;
      if (user) state.user = user;
      if (emailVerification) {
        state.emailVerificationAlert = emailVerification;
      }
      state.error = null;
      try {
        localStorage.setItem('accessToken', state.accessToken!);
        localStorage.setItem('refreshToken', state.refreshToken!);
      } catch { }
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
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch { }
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
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = (action.payload as string) || 'Erro desconhecido';
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } catch { }
      });
  },
});

export const { login, logout, setError, setGoogleUser, clearGoogleUser } = authSlice.actions;
export default authSlice.reducer;
