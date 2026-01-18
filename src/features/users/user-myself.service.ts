import apiAxios from '@/config/axiosConfig';
import { User } from '@/store/slices/auth/authSlice';

export interface UpdateOwnProfileDto {
    name?: string;
    email?: string;
    phone?: string;
}

export interface ChangePasswordDto {
    currentPassword?: string;
    newPassword: string;
}

export const userMyselfService = {
    getOwnProfile: async (): Promise<User> => {
        const response = await apiAxios.get<User>('/profile');
        return response.data;
    },

    updateOwnProfile: async (data: UpdateOwnProfileDto): Promise<User> => {
        const response = await apiAxios.patch<User>('/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
        const response = await apiAxios.patch<{ message: string }>('/profile/password', data);
        return response.data;
    },

    updateProfileImage: async (file: File): Promise<User> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiAxios.patch<User>('/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
