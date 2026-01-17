
export interface PersonalData {
    birthDate?: string;
    gender?: string;
    gaLeaderName?: string;
    gaLeaderContact?: string;
}

export interface UserPreferences {
    loveLanguages?: string;
    temperaments?: string;
    favoriteColor?: string;
    favoriteFood?: string;
    favoriteMusic?: string;
    whatMakesYouSmile?: string;
    skillsAndTalents?: string;
}

export interface ProfileImage {
    id: string;
    url: string;
    title?: string;
    description?: string;
    mediaType: string;
    uploadType: string;
    isLocalFile?: boolean;
    platformType?: string | null;
    originalName?: string;
    size?: number;
    createdAt?: string;
    updatedAt?: string;
}

export enum UserRole {
    ADMIN = 'admin',
    COORDINATOR = 'coordinator',
    TEACHER = 'teacher',
}

export interface Address {
    id: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClubLite {
    id: string;
    number: number;
    weekday: string;
    time?: string;
    isActive?: boolean;
}

export interface TeacherProfileLite {
    id: string;
    active: boolean;
    club: ClubLite | null;
}

export interface CoordinatorProfileLite {
    id: string;
    active: boolean;
    clubs: ClubLite[];
}
