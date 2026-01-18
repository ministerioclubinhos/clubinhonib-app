import apiAxios from '@/config/axiosConfig';
import { User } from './authSlice';
import {
    LoginDto,
    AuthResponse,
    RegisterUserDto,
    CompleteUserDto,
    GoogleLoginDto,
    RefreshTokenDto,
    RefreshTokenResponse,
    ForgotPasswordDto,
    ForgotPasswordResponse,
    ValidateResetTokenResponse,
    ResetPasswordDto,
    ResetPasswordResponse
} from './types';

export const authService = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await apiAxios.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterUserDto): Promise<any> => {
        const response = await apiAxios.post<any>('/auth/register', data);
        return response.data;
    },

    completeRegister: async (data: CompleteUserDto): Promise<User> => {
        const response = await apiAxios.post<User>('/auth/complete-register', data);
        return response.data;
    },

    googleLogin: async (data: GoogleLoginDto): Promise<AuthResponse> => {
        const response = await apiAxios.post<AuthResponse>('/auth/google', data);
        return response.data;
    },

    refreshToken: async (data: RefreshTokenDto): Promise<RefreshTokenResponse> => {
        const response = await apiAxios.post<RefreshTokenResponse>('/auth/refresh', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiAxios.get<User>('/auth/me');
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
        const response = await apiAxios.post<ForgotPasswordResponse>('/auth/forgot-password', data);
        return response.data;
    },

    validateResetToken: async (token: string): Promise<ValidateResetTokenResponse> => {
        const response = await apiAxios.get<ValidateResetTokenResponse>(`/auth/reset-password/validate`, {
            params: { token }
        });
        return response.data;
    },

    resetPassword: async (data: ResetPasswordDto): Promise<ResetPasswordResponse> => {
        const response = await apiAxios.post<ResetPasswordResponse>('/auth/reset-password', data);
        return response.data;
    }
};
