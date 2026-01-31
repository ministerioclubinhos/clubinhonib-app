import React from 'react';
import {
    AdminPanelSettings as AdminIcon,
    School as MemberIcon,
    SupervisorAccount as LeaderIcon,
} from '@mui/icons-material';

export interface RoleConfig {
    gradient: string;
    color: string;
    label: string;
    icon: React.ReactElement;
    bgLight: string;
}

export interface GenderStyle {
    gradient: string;
    color: string;
    bgLight: string;
}

export const roleConfig: Record<string, RoleConfig> = {
    admin: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#764ba2',
        label: 'Admin',
        icon: <AdminIcon sx={{ fontSize: 14 }} />,
        bgLight: 'rgba(118, 75, 162, 0.08)',
    },
    coordinator: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f5576c',
        label: 'Coordenador',
        icon: <LeaderIcon sx={{ fontSize: 14 }} />,
        bgLight: 'rgba(245, 87, 108, 0.08)',
    },
    teacher: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#4facfe',
        label: 'Professor',
        icon: <MemberIcon sx={{ fontSize: 14 }} />,
        bgLight: 'rgba(79, 172, 254, 0.08)',
    },
};

export const genderConfig: Record<string, GenderStyle> = {
    Masculino: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
        color: '#4facfe',
        bgLight: 'rgba(79, 172, 254, 0.06)',
    },
    Feminino: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f5576c',
        bgLight: 'rgba(245, 87, 108, 0.06)',
    },
    neutral: {
        gradient: 'linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 100%)',
        color: '#888888',
        bgLight: 'rgba(136, 136, 136, 0.06)',
    },
};

/**
 * Get gender-based styling configuration
 */
export const getGenderStyle = (gender?: string): GenderStyle => {
    if (gender === 'Masculino') return genderConfig.Masculino;
    if (gender === 'Feminino') return genderConfig.Feminino;
    return genderConfig.neutral;
};
