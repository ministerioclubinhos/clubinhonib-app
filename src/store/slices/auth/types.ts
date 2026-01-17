import { User } from "./authSlice";
import { UserRole } from "@/types/shared";

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface RegisterUserDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
}

export interface CompleteUserDto {
    email: string;
    name: string;
    phone: string;
    password?: string;
    role?: UserRole;
}

export interface GoogleLoginDto {
    token: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ForgotPasswordResponse {
    status: string;
    message: string;
}

export interface ValidateResetTokenResponse {
    valid: boolean;
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}
