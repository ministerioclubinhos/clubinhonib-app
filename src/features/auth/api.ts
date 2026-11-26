import api from '@/config/axiosConfig';

import type {
  ResendVerificationDto,
  ResendVerificationResponseDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
} from './types';

export async function verifyEmail(body: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
  const { data } = await api.post<VerifyEmailResponseDto>('/auth/verify-email', body, {
    skipGlobalError: true,
  });
  return data;
}

export async function resendEmailVerification(
  body: ResendVerificationDto
): Promise<ResendVerificationResponseDto> {
  const { data } = await api.post<ResendVerificationResponseDto>('/auth/resend-verification', body, {
    skipGlobalError: true,
  });
  return data;
}
