import type { User } from './authSlice';
import { UserRole } from '@/types/shared';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  emailVerification?: {
    verificationEmailSent: boolean;
    message: string;
  };
}

/**
 * Resposta de `POST /auth/register`.
 *
 * O back declara `AuthRegisterResponseDto`: mensagem, o usuário criado e o
 * estado do envio de confirmação. Não vêm tokens — a conta nasce inativa e só
 * ganha sessão depois de confirmar o e-mail.
 */
export interface RegisterResponse {
  message: string;
  user?: User;
  emailVerification?: {
    verificationEmailSent: boolean;
    message?: string;
  };
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

export interface FetchCurrentUserFailure {
  message: string;
  shouldLogout: boolean;
}
